const mongoose = require('mongoose');
const Reporte = require('../models/Reporte');
const Guia = require('../models/Guia');
const Comentario = require('../models/Comentario');
const { registrarAccion } = require('../utils/moderacion');

// Agrega al reporte la guía o el comentario reportado
async function conContenido(reporte) {
    reporte.contenido = reporte.tipo === 'guia'
        ? await Guia.findById(reporte.objetivo).select('titulo estado autor').populate('autor', 'nombre').lean()
        : await Comentario.findById(reporte.objetivo).select('texto estado guia autor').populate('autor', 'nombre').lean();
    return reporte;
}


//POST reportar una guía o un comentario
async function crear(req, res, next) {
    try {
        if (!['guia', 'comentario'].includes(req.body.tipo)) {
            return res.status(400).json({ ok: false, message: "El tipo debe ser guia o comentario" });
        }
        if (!mongoose.Types.ObjectId.isValid(req.body.objetivo)) {
            return res.status(400).json({ ok: false, message: "El objetivo no es un ID válido" });
        }

        const Modelo = req.body.tipo === 'comentario' ? Comentario : Guia;
        if (!(await Modelo.exists({ _id: req.body.objetivo }))) {
            return res.status(404).json({ ok: false, message: "Lo que intentas reportar ya no existe" });
        }

        const repetido = await Reporte.exists({ objetivo: req.body.objetivo, reportadoPor: req.usuario._id, estado: 'pendiente' });
        if (repetido) {
            return res.status(400).json({ ok: false, message: "Ya reportaste esto, lo estamos revisando" });
        }

        const reportes = new Reporte({
            tipo: req.body.tipo,
            objetivo: req.body.objetivo,
            motivo: req.body.motivo,
            reportadoPor: req.usuario._id
        });
        await reportes.save();

        res.status(201).json({ mensaje: "Reporte enviado", datos: reportes });
    } catch (error) {
        next(error);
    }
}


//GET reportes por estado, con lo reportado (moderador o admin)
async function listar(req, res, next) {
    try {
        const reportes = await Reporte.find({ estado: String(req.query.estado || 'pendiente') })
            .populate('reportadoPor', 'nombre')
            .sort({ createdAt: -1 })
            .lean();

        for (const r of reportes) await conContenido(r);

        res.json(reportes);
    } catch (error) {
        next(error);
    }
}


//GET un reporte por ID (moderador o admin)
async function obtener(req, res, next) {
    try {
        const reportes = await Reporte.findById(req.params.id).populate('reportadoPor', 'nombre').lean();

        if (!reportes) {
            return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
        }

        res.json(await conContenido(reportes));
    } catch (error) {
        next(error);
    }
}


//PUT atender un reporte: accion = "ocultar" (oculta lo reportado) o "descartar"
async function atender(req, res, next) {
    try {
        if (!['ocultar', 'descartar'].includes(req.body.accion)) {
            return res.status(400).json({ ok: false, message: "La acción debe ser ocultar o descartar" });
        }

        const reportes = await Reporte.findById(req.params.id);

        if (!reportes) {
            return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
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
        next(error);
    }
}


//DELETE borrar un reporte (moderador o admin)
async function eliminar(req, res, next) {
    try {
        const reportes = await Reporte.findByIdAndDelete(req.params.id);

        if (!reportes) {
            return res.status(404).json({ ok: false, message: "Reporte no encontrado" });
        }

        await registrarAccion(req.usuario, 'Borró un reporte', reportes.motivo);
        res.json({ mensaje: "Reporte eliminado", datos: req.params.id });
    } catch (error) {
        next(error);
    }
}

module.exports = { crear, listar, obtener, atender, eliminar };
