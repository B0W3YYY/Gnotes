const mongoose = require('mongoose');

const GuiaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    juego: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['Acción', 'Aventura', 'Estrategia', 'Competitivo', 'Supervivencia', 'Exploración', 'Jefes', 'Otros']
    },
    dificultad: {
        type: String,
        required: true,
        enum: ['Fácil', 'Media', 'Difícil']
    },
    contenido: {
        type: String,
        required: true,
        trim: true
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Guia', GuiaSchema);
