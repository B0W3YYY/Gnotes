const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Guia = require('../models/Guia');
const Comentario = require('../models/Comentario');
const Reporte = require('../models/Reporte');
const PalabraProhibida = require('../models/PalabraProhibida');
const Sancion = require('../models/Sancion');
const { registrarAccion } = require('../utils/moderacion');


//GET estadísticas generales
async function estadisticas(req, res, next) {
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
        next(error);
    }
}


//GET palabras prohibidas
async function listarPalabras(req, res, next) {
    try {
        res.json(await PalabraProhibida.find().sort({ palabra: 1 }));
    } catch (error) {
        next(error);
    }
}


//POST agregar palabra prohibida
async function agregarPalabra(req, res, next) {
    try {
        const palabras = new PalabraProhibida({ palabra: req.body.palabra });
        await palabras.save();
        await registrarAccion(req.usuario, 'Agregó una palabra prohibida', palabras.palabra);
        res.status(201).json(palabras);
    } catch (error) {
        next(error);
    }
}


//DELETE quitar palabra prohibida
async function quitarPalabra(req, res, next) {
    try {
        const palabras = await PalabraProhibida.findByIdAndDelete(req.params.id);

        if (!palabras) {
            return res.status(404).json({ ok: false, message: "Palabra no encontrada" });
        }

        await registrarAccion(req.usuario, 'Quitó una palabra prohibida', palabras.palabra);
        res.json({ mensaje: "Palabra eliminada", datos: req.params.id });
    } catch (error) {
        next(error);
    }
}


//GET sanciones
async function listarSanciones(req, res, next) {
    try {
        const sanciones = await Sancion.find()
            .populate('usuario', 'nombre correo')
            .populate('aplicadaPor', 'nombre')
            .sort({ createdAt: -1 });
        res.json(sanciones);
    } catch (error) {
        next(error);
    }
}


//GET una sanción por ID
async function obtenerSancion(req, res, next) {
    try {
        const sanciones = await Sancion.findById(req.params.id)
            .populate('usuario', 'nombre correo')
            .populate('aplicadaPor', 'nombre');

        if (!sanciones) {
            return res.status(404).json({ ok: false, message: "Sanción no encontrada" });
        }

        res.json(sanciones);
    } catch (error) {
        next(error);
    }
}


//POST aplicar sanción
async function aplicarSancion(req, res, next) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.usuario)) {
            return res.status(400).json({ ok: false, message: "El usuario no es un ID válido" });
        }

        const usuarios = await Usuario.findById(req.body.usuario);

        if (!usuarios) {
            return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
        }
        if (usuarios.rol === 'admin') {
            return res.status(400).json({ ok: false, message: "No se puede sancionar a un administrador" });
        }

        const sanciones = new Sancion({
            usuario: usuarios._id,
            tipo: req.body.tipo,
            motivo: req.body.motivo,
            hasta: req.body.tipo === 'suspension' ? req.body.hasta : undefined,
            aplicadaPor: req.usuario._id
        });

        if (sanciones.tipo === 'suspension' && !(sanciones.hasta > new Date())) {
            return res.status(400).json({ ok: false, message: "La suspensión necesita una fecha futura" });
        }

        await sanciones.save();
        await registrarAccion(req.usuario, `Aplicó ${sanciones.tipo}`, `${usuarios.nombre}: ${sanciones.motivo}`);

        res.status(201).json(sanciones);
    } catch (error) {
        next(error);
    }
}


//PUT levantar sanción
async function levantarSancion(req, res, next) {
    try {
        const sanciones = await Sancion.findByIdAndUpdate(req.params.id, { activa: false }, { returnDocument: 'after', runValidators: true }).populate('usuario', 'nombre');

        if (!sanciones) {
            return res.status(404).json({ ok: false, message: "Sanción no encontrada" });
        }

        await registrarAccion(req.usuario, 'Levantó una sanción', sanciones.usuario?.nombre || '');
        res.json({ mensaje: "Sanción levantada", datos: sanciones });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    estadisticas, listarPalabras, agregarPalabra, quitarPalabra,
    listarSanciones, obtenerSancion, aplicarSancion, levantarSancion
};
