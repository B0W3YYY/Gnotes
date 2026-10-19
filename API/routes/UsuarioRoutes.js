const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

//GET todos
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET por ID
router.get('/:id', async (req, res) => {
    try {
        const usuarios = await Usuario.findById(req.params.id);

        if (!usuarios) {
            return res.status(404).json({ message: "Usuario no encontrado" + req.params.id });
        }

        res.json(usuarios);

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
        const usuarios = new Usuario(req.body);
        await usuarios.save();
        res.status(201).json(usuarios);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//POST login
router.post('/login', async (req, res) => {
    try {
        const usuarios = await Usuario.findOne({ correo: (req.body.correo || '').toLowerCase().trim() });

        if (!usuarios || usuarios.clave !== req.body.clave) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        res.json({
            _id: usuarios._id,
            nombre: usuarios.nombre,
            correo: usuarios.correo
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            otro: "errores"
        });
    }
});


//PUT por ID
router.put('/:id', async (req, res) => {
    try {
        const usuarios = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body, {
            new: true,
            runValidators: true
        }
        );

        if (!usuarios) {
            return res.status(404).json({ message: "Usuario no encontrado" + req.params.id });
        }

        res.json(
            {
                mensaje: "Usuario actualizado",
                datos: usuarios
            }
        );

        // {
        //   "message": "usuario is not defined",
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
        const usuarios = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuarios) {
            return res.status(404).json({ message: "Usuario no encontrado" + req.params.id });
        }

        res.json(
            {
                mensaje: "Usuario eliminado",
                datos: req.params.id
            }
        );

        // {
        //   "message": "usuario is not defined",
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
