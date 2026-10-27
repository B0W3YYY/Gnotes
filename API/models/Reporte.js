const mongoose = require('mongoose');

const ReporteSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: { values: ['guia', 'comentario'], message: 'El tipo debe ser guia o comentario' },
        required: [true, 'El tipo es obligatorio']
    },
    // Id de la guía o del comentario reportado
    objetivo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    motivo: {
        type: String,
        required: [true, 'El motivo es obligatorio'],
        trim: true,
        maxlength: [500, 'El motivo no puede pasar de 500 caracteres']
    },
    reportadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'resuelto', 'descartado'],
        default: 'pendiente'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reporte', ReporteSchema);
