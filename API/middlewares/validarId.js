const mongoose = require('mongoose');

// Responde 400 si el :id de la ruta no es un ObjectId válido
function validarId(req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ ok: false, message: "El ID no es válido" });
    }
    next();
}

module.exports = validarId;
