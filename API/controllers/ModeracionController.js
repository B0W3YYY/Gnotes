const Guia = require('../models/Guia');
const Reporte = require('../models/Reporte');
const AccionModeracion = require('../models/AccionModeracion');
const { registrarAccion } = require('../utils/moderacion');


//GET resumen de pendientes
async function resumen(req, res, next) {
    try {
        res.json({
            guiasPendientes: await Guia.countDocuments({ estado: 'pendiente' }),
            reportesPendientes: await Reporte.countDocuments({ estado: 'pendiente' }),
            guiasRechazadas: await Guia.countDocuments({ estado: 'rechazada' })
        });
    } catch (error) {
        next(error);
    }
}


//GET guías por estado (?estado=pendiente|rechazada)
async function listarGuias(req, res, next) {
    try {
        const guias = await Guia.find({ estado: String(req.query.estado || 'pendiente') })
            .populate('autor', 'nombre')
            .sort({ updatedAt: -1 });
        res.json(guias);
    } catch (error) {
        next(error);
    }
}


//PUT cambiar estado de una guía (publicada | rechazada)
async function cambiarEstado(req, res, next) {
    try {
        if (!['publicada', 'rechazada'].includes(req.body.estado)) {
            return res.status(400).json({ ok: false, message: "Estado no válido" });
        }

        const guias = await Guia.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { returnDocument: 'after', runValidators: true });

        if (!guias) {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }

        await registrarAccion(req.usuario, req.body.estado === 'publicada' ? 'Aprobó una guía' : 'Rechazó una guía', guias.titulo);

        res.json({
            mensaje: "Estado actualizado",
            datos: guias
        });
    } catch (error) {
        next(error);
    }
}


//GET historial de moderación
async function historial(req, res, next) {
    try {
        const acciones = await AccionModeracion.find()
            .populate('realizadaPor', 'nombre rol')
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(acciones);
    } catch (error) {
        next(error);
    }
}

module.exports = { resumen, listarGuias, cambiarEstado, historial };
