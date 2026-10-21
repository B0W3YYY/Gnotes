const mongoose = require('mongoose');

const SancionSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    tipo: {
        type: String,
        enum: ['advertencia', 'suspension', 'bloqueo'],
        required: true
    },
    motivo: {
        type: String,
        required: true,
        trim: true
    },
    // Solo para suspensiones: hasta cuándo dura
    hasta: Date,
    activa: {
        type: Boolean,
        default: true
    },
    aplicadaPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sancion', SancionSchema);
