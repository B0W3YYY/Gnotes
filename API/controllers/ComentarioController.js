const Comentario = require('../models/Comentario');
const Guia = require('../models/Guia');
const { buscarProhibidas, registrarAccion } = require('../utils/moderacion');
const { buscarEmojisProhibidos, mensajeEmojis } = require('../utils/emojis');

function esModerador(usuario) {
    return ['moderador', 'admin'].includes(usuario.rol);
}

// Revisa emojis y palabras prohibidas; devuelve el mensaje de error o null
async function revisarTexto(texto) {
    const emojis = buscarEmojisProhibidos(texto || '');
    if (emojis.length) return mensajeEmojis(emojis);

    if ((await buscarProhibidas(String(texto || ''))).length) {
        return "Tu comentario tiene palabras que no están permitidas";
    }
    return null;
}


//GET comentarios de una guía
async function listarDeGuia(req, res, next) {
    try {
        const comentarios = await Comentario.find({ guia: req.params.guiaId, estado: 'publicado' })
            .populate('autor', 'nombre')
            .sort({ createdAt: 1 });
        res.json(comentarios);
    } catch (error) {
        next(error);
    }
}


//GET un comentario por ID
async function obtener(req, res, next) {
    try {
        const comentarios = await Comentario.findOne({ _id: req.params.id, estado: 'publicado' })
            .populate('autor', 'nombre');

        if (!comentarios) {
            return res.status(404).json({ ok: false, message: "Comentario no encontrado" });
        }

        res.json(comentarios);
    } catch (error) {
        next(error);
    }
}


//POST comentar una guía (no se permiten palabras prohibidas)
async function crear(req, res, next) {
    try {
        const guias = await Guia.findById(req.params.guiaId);

        if (!guias || guias.estado !== 'publicada') {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }

        const problema = await revisarTexto(req.body.texto);
        if (problema) {
            return res.status(400).json({ ok: false, message: problema });
        }

        const comentarios = new Comentario({ guia: guias._id, autor: req.usuario._id, texto: req.body.texto });
        await comentarios.save();
        await comentarios.populate('autor', 'nombre');

        res.status(201).json(comentarios);
    } catch (error) {
        next(error);
    }
}


//PUT editar un comentario (solo el autor)
async function actualizar(req, res, next) {
    try {
        const comentarios = await Comentario.findById(req.params.id);

        if (!comentarios) {
            return res.status(404).json({ ok: false, message: "Comentario no encontrado" });
        }
        if (String(comentarios.autor) !== String(req.usuario._id)) {
            return res.status(403).json({ ok: false, message: "Solo el autor puede editar este comentario" });
        }

        const problema = await revisarTexto(req.body.texto);
        if (problema) {
            return res.status(400).json({ ok: false, message: problema });
        }

        comentarios.texto = req.body.texto;
        await comentarios.save();
        await comentarios.populate('autor', 'nombre');

        res.json({
            mensaje: "Comentario actualizado",
            datos: comentarios
        });
    } catch (error) {
        next(error);
    }
}


//DELETE comentario (el autor, o un moderador)
async function eliminar(req, res, next) {
    try {
        const comentarios = await Comentario.findById(req.params.id);

        if (!comentarios) {
            return res.status(404).json({ ok: false, message: "Comentario no encontrado" });
        }

        const esAutor = String(comentarios.autor) === String(req.usuario._id);

        if (!esAutor && !esModerador(req.usuario)) {
            return res.status(403).json({ ok: false, message: "No puedes eliminar este comentario" });
        }

        await comentarios.deleteOne();
        if (!esAutor) await registrarAccion(req.usuario, 'Eliminó un comentario', comentarios.texto.slice(0, 80));

        res.json({
            mensaje: "Comentario eliminado",
            datos: req.params.id
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { listarDeGuia, obtener, crear, actualizar, eliminar };
