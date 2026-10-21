const express = require('express');
const router = express.Router();
const Reporte = require('../models/Reporte');
const Guia = require('../models/Guia');
const Comentario = require('../models/Comentario');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const { registrarAccion } = require('../utils/moderacion');


//POST reportar una guía o un comentario
router.post('/', requiereSesion, async (req, res) => {
    try {
        const Modelo = req.body.tipo === 'comentario' ? Comentario : Guia;
        if (!(await Modelo.exists({ _id: req.body.objetivo }))) {
            return res.status(404).json({ message: "Lo que intentas reportar ya no existe" });
        }

        const repetido = await Reporte.exists({ objetivo: req.body.objetivo, reportadoPor: req.usuario._id, estado: 'pendiente' });
        if (repetido) {
            return res.status(400).json({ message: "Ya reportaste esto, lo estamos revisando" });
        }

        const reportes = new Reporte({
            tipo: req.body.tipo,
            objetivo: req.body.objetivo,
            motivo: req.body.motivo,
            reportadoPor: req.usuario._id
        });
        await reportes.save();

        res.status(201).json({ mensaje: "Reporte enviado" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//GET reportes pendientes, con lo reportado (moderador o admin)
router.get('/', requiereSesion, requiereRol('moderador', 'admin'), async (req, res) => {
    try {
        const reportes = await Reporte.find({ estado: req.query.estado || 'pendiente' })
            .populate('reportadoPor', 'nombre')
            .sort({ createdAt: -1 })
            .lean();

        for (const r of reportes) {
            r.contenido = r.tipo === 'guia'
                ? await Guia.findById(r.objetivo).select('titulo estado autor').populate('autor', 'nombre').lean()
                : await Comentario.findById(r.objetivo).select('texto estado guia autor').populate('autor', 'nombre').lean();
        }

        res.json(reportes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//PUT atender un reporte: accion = "ocultar" (oculta lo reportado) o "descartar"
router.put('/:id', requiereSesion, requiereRol('moderador', 'admin'), async (req, res) => {
    try {
        const reportes = await Reporte.findById(req.params.id);

        if (!reportes) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }

        if (req.body.accion === 'ocultar') {
            if (reportes.tipo === 'guia') await Guia.findByIdAndUpdate(reportes.objetivo, { estado: 'rechazada' });
            else await Comentario.findByIdAndUpdate(reportes.objetivo, { estado: 'oculto' });

            // Todos los reportes sobre lo mismo quedan resueltos
            await Reporte.updateMany({ objetivo: reportes.objetivo, estado: 'pendiente' }, { estado: 'resuelto' });
            await registrarAccion(req.usuario, `Ocultó ${reportes.tipo === 'guia' ? 'una guía' : 'un comentario'} reportado`, reportes.motivo);
        } else {
            reportes.estado = 'descartado';
            await reportes.save();
            await registrarAccion(req.usuario, 'Descartó un reporte', reportes.motivo);
        }

        res.json({ mensaje: "Reporte atendido" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
