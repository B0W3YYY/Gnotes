const mongoose = require('mongoose');

const ComentarioSchema = new mongoose.Schema({
    guia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guia',
        required: true
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    texto: {
        type: String,
        required: [true, 'El comentario no puede estar vacío'],
        trim: true,
        maxlength: [1000, 'El comentario no puede pasar de 1000 caracteres']
    },
    estado: {
        type: String,
        enum: ['publicado', 'oculto'],
        default: 'publicado'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comentario', ComentarioSchema);
