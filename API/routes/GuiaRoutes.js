const express = require('express');
const router = express.Router();
const Guia = require('../models/Guia');

//GET todas (con búsqueda y filtros: ?q=texto&categoria=...&dificultad=...&autor=id)
router.get('/', async (req, res) => {
    try {
        const filtro = {};

        if (req.query.q) {
            const texto = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filtro.$or = [{ titulo: texto }, { juego: texto }, { contenido: texto }];
        }
        if (req.query.categoria) filtro.categoria = req.query.categoria;
        if (req.query.dificultad) filtro.dificultad = req.query.dificultad;
        if (req.query.autor) filtro.autor = req.query.autor;

        const guias = await Guia.find(filtro).populate('autor', 'nombre').sort({ createdAt: -1 });
        res.json(guias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET por ID
router.get('/:id', async (req, res) => {
    try {
        const guias = await Guia.findById(req.params.id).populate('autor', 'nombre');

        if (!guias) {
            return res.status(404).json({ message: "Guía no encontrada" });
        }

        res.json(guias);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//POST crear
router.post('/', async (req, res) => {
    try {
        const guias = new Guia(req.body);
        await guias.save();
        res.status(201).json(guias);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//PUT por ID (solo el autor)
router.put('/:id', async (req, res) => {
    try {
        const guias = await Guia.findById(req.params.id);

        if (!guias) {
            return res.status(404).json({ message: "Guía no encontrada" });
        }

        if (String(guias.autor) !== String(req.body.autor)) {
            return res.status(403).json({ message: "Solo el autor puede editar esta guía" });
        }

        Object.assign(guias, req.body);
        await guias.save();

        res.json({
            mensaje: "Guía actualizada",
            datos: guias
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//DELETE por ID (solo el autor: ?autor=id)
router.delete('/:id', async (req, res) => {
    try {
        const guias = await Guia.findById(req.params.id);

        if (!guias) {
            return res.status(404).json({ message: "Guía no encontrada" });
        }

        if (String(guias.autor) !== String(req.query.autor)) {
            return res.status(403).json({ message: "Solo el autor puede eliminar esta guía" });
        }

        await guias.deleteOne();

        res.json({
            mensaje: "Guía eliminada",
            datos: req.params.id
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
