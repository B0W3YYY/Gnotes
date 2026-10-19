const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    creditos: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = mongoose.model('Curso', CursoSchema);
