const express = require('express');
const router = express.Router();
const Guia = require('../models/Guia');
const Reporte = require('../models/Reporte');
const AccionModeracion = require('../models/AccionModeracion');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const { registrarAccion } = require('../utils/moderacion');

router.use(requiereSesion, requiereRol('moderador', 'admin'));


//GET resumen de pendientes
router.get('/resumen', async (req, res) => {
    try {
        res.json({
            guiasPendientes: await Guia.countDocuments({ estado: 'pendiente' }),
            reportesPendientes: await Reporte.countDocuments({ estado: 'pendiente' }),
            guiasRechazadas: await Guia.countDocuments({ estado: 'rechazada' })
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET guías por estado (?estado=pendiente|rechazada)
router.get('/guias', async (req, res) => {
    try {
        const guias = await Guia.find({ estado: req.query.estado || 'pendiente' })
            .populate('autor', 'nombre')
            .sort({ updatedAt: -1 });
        res.json(guias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//PUT cambiar estado de una guía (publicada | rechazada)
router.put('/guias/:id/estado', async (req, res) => {
    try {
        if (!['publicada', 'rechazada'].includes(req.body.estado)) {
            return res.status(400).json({ message: "Estado no válido" });
        }

        const guias = await Guia.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { new: true });

        if (!guias) {
            return res.status(404).json({ message: "Guía no encontrada" });
        }

        await registrarAccion(req.usuario, req.body.estado === 'publicada' ? 'Aprobó una guía' : 'Rechazó una guía', guias.titulo);

        res.json({
            mensaje: "Estado actualizado",
            datos: guias
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET historial de moderación
router.get('/historial', async (req, res) => {
    try {
        const historial = await AccionModeracion.find()
            .populate('realizadaPor', 'nombre rol')
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
