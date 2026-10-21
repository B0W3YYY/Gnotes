const mongoose = require('mongoose');

const ReporteSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['guia', 'comentario'],
        required: true
    },
    // Id de la guía o del comentario reportado
    objetivo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    motivo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
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
