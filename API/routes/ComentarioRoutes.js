const express = require('express');
const router = express.Router();
const Comentario = require('../models/Comentario');
const Guia = require('../models/Guia');
const { requiereSesion, sinSancion } = require('../middlewares/auth');
const { buscarProhibidas, registrarAccion } = require('../utils/moderacion');
const { buscarEmojisProhibidos, mensajeEmojis } = require('../utils/emojis');


//GET comentarios de una guía
router.get('/guia/:guiaId', async (req, res) => {
    try {
        const comentarios = await Comentario.find({ guia: req.params.guiaId, estado: 'publicado' })
            .populate('autor', 'nombre')
            .sort({ createdAt: 1 });
        res.json(comentarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//POST comentar una guía (no se permiten palabras prohibidas)
router.post('/guia/:guiaId', requiereSesion, sinSancion, async (req, res) => {
    try {
        const guias = await Guia.findById(req.params.guiaId);

        if (!guias || guias.estado !== 'publicada') {
            return res.status(404).json({ message: "Guía no encontrada" });
        }

        const emojis = buscarEmojisProhibidos(req.body.texto || '');
        if (emojis.length) {
            return res.status(400).json({ message: mensajeEmojis(emojis) });
        }

        if ((await buscarProhibidas(req.body.texto || '')).length) {
            return res.status(400).json({ message: "Tu comentario tiene palabras que no están permitidas" });
        }

        const comentarios = new Comentario({ guia: guias._id, autor: req.usuario._id, texto: req.body.texto });
        await comentarios.save();
        await comentarios.populate('autor', 'nombre');

        res.status(201).json(comentarios);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//DELETE comentario (el autor, o un moderador)
router.delete('/:id', requiereSesion, async (req, res) => {
    try {
        const comentarios = await Comentario.findById(req.params.id);

        if (!comentarios) {
            return res.status(404).json({ message: "Comentario no encontrado" });
        }

        const esAutor = String(comentarios.autor) === String(req.usuario._id);
        const esModerador = ['moderador', 'admin'].includes(req.usuario.rol);

        if (!esAutor && !esModerador) {
            return res.status(403).json({ message: "No puedes eliminar este comentario" });
        }

        await comentarios.deleteOne();
        if (!esAutor) await registrarAccion(req.usuario, 'Eliminó un comentario', comentarios.texto.slice(0, 80));

        res.json({
            mensaje: "Comentario eliminado",
            datos: req.params.id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
