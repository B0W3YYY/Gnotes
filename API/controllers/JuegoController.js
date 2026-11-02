const Juego = require('../models/Juego');
const Guia = require('../models/Guia');
const { registrarAccion } = require('../utils/moderacion');
const { normalizarNombreJuego, juegoExistente } = require('../utils/juegos');
const { existeSubida } = require('../utils/archivos');


//GET juegos aprobados (los de fábrica están en el frontend)
async function listar(req, res, next) {
    try {
        const juegos = await Juego.find().select('nombre icono estandarte createdAt').sort({ nombre: 1 });
        res.json(juegos);
    } catch (error) {
        next(error);
    }
}


//GET solicitudes: guías pendientes que piden un juego nuevo (solo admin)
async function solicitudes(req, res, next) {
    try {
        const guias = await Guia.find({ juegoNuevo: true, estado: 'pendiente' })
            .select('titulo juego categoria dificultad autor createdAt')
            .populate('autor', 'nombre')
            .sort({ createdAt: 1 });
        res.json(guias);
    } catch (error) {
        next(error);
    }
}


async function guiaSolicitada(id, res) {
    const guias = await Guia.findById(id);
    if (!guias || !guias.juegoNuevo || guias.estado !== 'pendiente') {
        res.status(404).json({ ok: false, message: "Solicitud no encontrada" });
        return null;
    }
    return guias;
}


//PUT aprobar: crea el juego (si aún no existe) y publica la guía
// Body opcional: { nombre, icono, estandarte } (imágenes subidas antes con POST /api/guias/multimedia)
async function aprobar(req, res, next) {
    try {
        const guias = await guiaSolicitada(req.params.id, res);
        if (!guias) return;

        for (const campo of ['icono', 'estandarte']) {
            if (req.body[campo] && !existeSubida(req.body[campo])) {
                return res.status(400).json({ ok: false, message: "La imagen del juego no es válida o ya no existe" });
            }
        }

        // El admin puede corregir el nombre (mayúsculas, erratas) antes de aprobar
        const nombre = String(req.body.nombre || guias.juego).trim().replace(/\s+/g, ' ');

        // Si ya existe (de fábrica o aprobado por otra solicitud) se reutiliza
        let juego = null;
        const existente = await juegoExistente(nombre);
        if (existente) {
            juego = await Juego.findOne({ nombreNormalizado: normalizarNombreJuego(existente) });
        } else {
            juego = await Juego.create({
                nombre,
                icono: req.body.icono || undefined,
                estandarte: req.body.estandarte || undefined,
                aprobadoPor: req.usuario._id
            });
        }

        guias.juego = existente || juego.nombre;
        guias.juegoNuevo = false;
        guias.estado = 'publicada';
        await guias.save();

        await registrarAccion(req.usuario, existente ? 'Aprobó una guía' : 'Aprobó un juego nuevo', `${guias.juego} · ${guias.titulo}`);

        res.json({
            mensaje: existente ? "Guía publicada (el juego ya existía)" : "Juego creado y guía publicada",
            datos: { guia: guias, juego }
        });
    } catch (error) {
        next(error);
    }
}


//PUT rechazar: la guía queda rechazada y no se crea el juego
async function rechazar(req, res, next) {
    try {
        const guias = await guiaSolicitada(req.params.id, res);
        if (!guias) return;

        guias.estado = 'rechazada';
        await guias.save();
        await registrarAccion(req.usuario, 'Rechazó un juego nuevo', `${guias.juego} · ${guias.titulo}`);

        res.json({ mensaje: "Solicitud rechazada", datos: guias });
    } catch (error) {
        next(error);
    }
}

module.exports = { listar, solicitudes, aprobar, rechazar };
