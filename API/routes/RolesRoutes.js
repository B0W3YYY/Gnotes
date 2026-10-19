const express = require('express');
const router = express.Router();
const Roles = require('../models/Roles');

//GET todos
router.get('/', async (req, res) => {
    try {
        const roles = await Roles.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET por ID
router.get('/:id', async (req, res) => {
    try {
        const roles = await Roles.findById(req.params.id);

        if (!roles) {
            return res.status(404).json({ message: "Rol no encontrado" + req.params.id });
        }

        res.json(roles);

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
        const roles = new Roles(req.body);
        await roles.save();
        res.status(201).json(roles);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//PUT por ID
router.put('/:id', async (req, res) => {
    try {
        const roles = await Roles.findByIdAndUpdate(
            req.params.id,
            req.body, {
            new: true,
            runValidators: true
        }
        );

        if (!roles) {
            return res.status(404).json({ message: "Rol no encontrado" + req.params.id });
        }

        res.json(
            {
                mensaje: "Rol actualizado",
                datos: roles
            }
        );

        // {
        //   "message": "rol is not defined",
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
        const roles = await Roles.findByIdAndDelete(req.params.id);

        if (!roles) {
            return res.status(404).json({ message: "Rol no encontrado" + req.params.id });
        }

        res.json(
            {
                mensaje: "Rol eliminado",
                datos: req.params.id
            }
        );

        // {
        //   "message": "rol is not defined",
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

