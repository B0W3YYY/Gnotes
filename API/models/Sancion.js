const mongoose = require('mongoose');

const SancionSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    tipo: {
        type: String,
        enum: { values: ['advertencia', 'suspension', 'bloqueo'], message: 'El tipo de sanción no es válido' },
        required: [true, 'El tipo de sanción es obligatorio']
    },
    motivo: {
        type: String,
        required: [true, 'El motivo es obligatorio'],
        trim: true,
        maxlength: [500, 'El motivo no puede pasar de 500 caracteres']
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
