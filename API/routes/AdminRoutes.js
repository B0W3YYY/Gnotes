const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Guia = require('../models/Guia');
const Comentario = require('../models/Comentario');
const Reporte = require('../models/Reporte');
const PalabraProhibida = require('../models/PalabraProhibida');
const Sancion = require('../models/Sancion');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const { registrarAccion } = require('../utils/moderacion');

router.use(requiereSesion, requiereRol('admin'));


//GET estadísticas generales
router.get('/estadisticas', async (req, res) => {
    try {
        const guias = await Guia.find({ estado: 'publicada' }).select('categoria vistas votos');
        const porCategoria = {};
        guias.forEach(g => { porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + 1; });

        res.json({
            usuarios: await Usuario.countDocuments(),
            guias: guias.length,
            comentarios: await Comentario.countDocuments(),
            reportesPendientes: await Reporte.countDocuments({ estado: 'pendiente' }),
            sancionesActivas: await Sancion.countDocuments({ activa: true }),
            vistas: guias.reduce((t, g) => t + g.vistas, 0),
            votos: guias.reduce((t, g) => t + g.votos.length, 0),
            porCategoria
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET palabras prohibidas
router.get('/palabras', async (req, res) => {
    try {
        res.json(await PalabraProhibida.find().sort({ palabra: 1 }));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//POST agregar palabra prohibida
router.post('/palabras', async (req, res) => {
    try {
        const palabras = new PalabraProhibida({ palabra: req.body.palabra });
        await palabras.save();
        await registrarAccion(req.usuario, 'Agregó una palabra prohibida', palabras.palabra);
        res.status(201).json(palabras);
    } catch (error) {
        const mensaje = error.message.includes('duplicate') ? "Esa palabra ya está en la lista" : error.message;
        res.status(400).json({ message: mensaje });
    }
});


//DELETE quitar palabra prohibida
router.delete('/palabras/:id', async (req, res) => {
    try {
        const palabras = await PalabraProhibida.findByIdAndDelete(req.params.id);

        if (!palabras) {
            return res.status(404).json({ message: "Palabra no encontrada" });
        }

        await registrarAccion(req.usuario, 'Quitó una palabra prohibida', palabras.palabra);
        res.json({ mensaje: "Palabra eliminada", datos: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET sanciones
router.get('/sanciones', async (req, res) => {
    try {
        const sanciones = await Sancion.find()
            .populate('usuario', 'nombre correo')
            .populate('aplicadaPor', 'nombre')
            .sort({ createdAt: -1 });
        res.json(sanciones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//POST aplicar sanción
router.post('/sanciones', async (req, res) => {
    try {
        const usuarios = await Usuario.findById(req.body.usuario);

        if (!usuarios) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        if (usuarios.rol === 'admin') {
            return res.status(400).json({ message: "No se puede sancionar a un administrador" });
        }

        const sanciones = new Sancion({
            usuario: usuarios._id,
            tipo: req.body.tipo,
            motivo: req.body.motivo,
            hasta: req.body.tipo === 'suspension' ? req.body.hasta : undefined,
            aplicadaPor: req.usuario._id
        });

        if (sanciones.tipo === 'suspension' && !(sanciones.hasta > new Date())) {
            return res.status(400).json({ message: "La suspensión necesita una fecha futura" });
        }

        await sanciones.save();
        await registrarAccion(req.usuario, `Aplicó ${sanciones.tipo}`, `${usuarios.nombre}: ${sanciones.motivo}`);

        res.status(201).json(sanciones);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//PUT levantar sanción
router.put('/sanciones/:id/levantar', async (req, res) => {
    try {
        const sanciones = await Sancion.findByIdAndUpdate(req.params.id, { activa: false }, { new: true }).populate('usuario', 'nombre');

        if (!sanciones) {
            return res.status(404).json({ message: "Sanción no encontrada" });
        }

        await registrarAccion(req.usuario, 'Levantó una sanción', sanciones.usuario?.nombre || '');
        res.json({ mensaje: "Sanción levantada", datos: sanciones });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
