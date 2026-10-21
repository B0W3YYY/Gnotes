const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Sancion = require('../models/Sancion');

// Busca si el usuario tiene una suspensión o bloqueo vigente
async function sancionVigente(usuarioId) {
    return Sancion.findOne({
        usuario: usuarioId,
        activa: true,
        $or: [
            { tipo: 'bloqueo' },
            { tipo: 'suspension', hasta: { $gt: new Date() } }
        ]
    });
}

// Exige sesión iniciada (token en el encabezado Authorization: Bearer ...)
async function requiereSesion(req, res, next) {
    try {
        const encabezado = req.headers.authorization || '';
        const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const datos = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(datos.id);

        if (!usuario) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(401).json({ message: "Debes iniciar sesión" });
    }
}

// Igual que requiereSesion, pero si no hay token deja pasar sin usuario
async function sesionOpcional(req, res, next) {
    if (!req.headers.authorization) return next();
    return requiereSesion(req, res, next);
}

// Solo deja pasar a los roles indicados
function requiereRol(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ message: "No tienes permiso para hacer esto" });
        }
        next();
    };
}

// Bloquea publicar si el usuario está suspendido o bloqueado
async function sinSancion(req, res, next) {
    const sancion = await sancionVigente(req.usuario._id);
    if (sancion) {
        return res.status(403).json({ message: "Tu cuenta está sancionada y no puede publicar por ahora" });
    }
    next();
}

module.exports = { requiereSesion, sesionOpcional, requiereRol, sinSancion, sancionVigente };
