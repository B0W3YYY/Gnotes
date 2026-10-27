const Curso = require('../models/Curso');

// Solo se guardan los campos que el cliente puede enviar (nunca _id ni otros internos)
const CAMPOS = ['nombre', 'descripcion', 'creditos'];

function datosCurso(body) {
    const datos = {};
    for (const campo of CAMPOS) {
        if (body[campo] !== undefined) datos[campo] = body[campo];
    }
    return datos;
}


//GET todos
async function listar(req, res, next) {
    try {
        const cursos = await Curso.find().sort({ createdAt: -1 });
        res.json(cursos);
    } catch (error) {
        next(error);
    }
}


//GET por ID
async function obtener(req, res, next) {
    try {
        const cursos = await Curso.findById(req.params.id);

        if (!cursos) {
            return res.status(404).json({ ok: false, message: "Curso no encontrado" });
        }

        res.json(cursos);
    } catch (error) {
        next(error);
    }
}


//POST crear
async function crear(req, res, next) {
    try {
        const cursos = new Curso(datosCurso(req.body));
        await cursos.save();
        res.status(201).json(cursos);
    } catch (error) {
        next(error);
    }
}


//PUT por ID
async function actualizar(req, res, next) {
    try {
        const cursos = await Curso.findByIdAndUpdate(
            req.params.id,
            datosCurso(req.body),
            { returnDocument: 'after', runValidators: true }
        );

        if (!cursos) {
            return res.status(404).json({ ok: false, message: "Curso no encontrado" });
        }

        res.json({
            mensaje: "Curso actualizado",
            datos: cursos
        });
    } catch (error) {
        next(error);
    }
}


//DELETE por ID
async function eliminar(req, res, next) {
    try {
        const cursos = await Curso.findByIdAndDelete(req.params.id);

        if (!cursos) {
            return res.status(404).json({ ok: false, message: "Curso no encontrado" });
        }

        res.json({
            mensaje: "Curso eliminado",
            datos: req.params.id
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
