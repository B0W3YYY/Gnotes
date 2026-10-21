const mongoose = require('mongoose');

// Historial de todo lo que hacen moderadores y administradores
const AccionModeracionSchema = new mongoose.Schema({
    realizadaPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    accion: {
        type: String,
        required: true
    },
    detalle: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AccionModeracion', AccionModeracionSchema);
