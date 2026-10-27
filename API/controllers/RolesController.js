const Roles = require('../models/Roles');

// Solo se guardan los campos que el cliente puede enviar (nunca _id ni otros internos)
const CAMPOS = ['nombre', 'descripcion'];

function datosRoles(body) {
    const datos = {};
    for (const campo of CAMPOS) {
        if (body[campo] !== undefined) datos[campo] = body[campo];
    }
    return datos;
}


//GET todos
async function listar(req, res, next) {
    try {
        const roles = await Roles.find().sort({ createdAt: -1 });
        res.json(roles);
    } catch (error) {
        next(error);
    }
}


//GET por ID
async function obtener(req, res, next) {
    try {
        const roles = await Roles.findById(req.params.id);

        if (!roles) {
            return res.status(404).json({ ok: false, message: "Rol no encontrado" });
        }

        res.json(roles);
    } catch (error) {
        next(error);
    }
}


//POST crear
async function crear(req, res, next) {
    try {
        const roles = new Roles(datosRoles(req.body));
        await roles.save();
        res.status(201).json(roles);
    } catch (error) {
        next(error);
    }
}


//PUT por ID
async function actualizar(req, res, next) {
    try {
        const roles = await Roles.findByIdAndUpdate(
            req.params.id,
            datosRoles(req.body),
            { returnDocument: 'after', runValidators: true }
        );

        if (!roles) {
            return res.status(404).json({ ok: false, message: "Rol no encontrado" });
        }

        res.json({
            mensaje: "Rol actualizado",
            datos: roles
        });
    } catch (error) {
        next(error);
    }
}


//DELETE por ID
async function eliminar(req, res, next) {
    try {
        const roles = await Roles.findByIdAndDelete(req.params.id);

        if (!roles) {
            return res.status(404).json({ ok: false, message: "Rol no encontrado" });
        }

        res.json({
            mensaje: "Rol eliminado",
            datos: req.params.id
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
