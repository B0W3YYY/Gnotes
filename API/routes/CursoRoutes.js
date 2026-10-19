const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

//GET todos
router.get('/', async (req, res) => {
    try {
        const cursos = await Curso.find();
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET por ID
router.get('/:id', async (req, res) => {
    try {
        const cursos = await Curso.findById(req.params.id);

        if (!cursos) {
            return res.status(404).json({ message: "Curso no encontrado" + req.params.id });
        }

        res.json(cursos);

    } catch (error) {
        res.status(500).json({
            message: error.message,
            otro: "errores"
        });
    }
});


//POST crear
router.post('/', async (req, res) => {
    try {
        const cursos = new Curso(req.body);
        await cursos.save();
        res.status(201).json(cursos);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//PUT por ID
router.put('/:id', async (req, res) => {
    try {
        const cursos = await Curso.findByIdAndUpdate(
            req.params.id,
            req.body, {
            new: true,
            runValidators: true
        }
        );

        if (!cursos) {
            return res.status(404).json({ message: "Curso no encontrado" + req.params.id });
        }

        res.json(
            {
                mensaje: "Curso actualizado",
                datos: cursos
            }
        );

        // {
        //   "message": "curso is not defined",
        //   "otro": "errores"
        // }


    } catch (error) {
        res.status(500).json({
            message: error.message,
            otro: "errores"
        });
    }
});


//DELETE por ID
router.delete('/:id', async (req, res) => {
    try {
        const cursos = await Curso.findByIdAndDelete(req.params.id);

        if (!cursos) {
            return res.status(404).json({ message: "Curso no encontrado" + req.params.id });
        }

        res.json(
            {
                mensaje: "Curso eliminado",
                datos: req.params.id
            }
        );

        // {
        //   "message": "curso is not defined",
        //   "otro": "errores"
        // }


    } catch (error) {
        res.status(500).json({
            message: error.message,
            otro: "errores"
        });
    }
});

module.exports = router;

