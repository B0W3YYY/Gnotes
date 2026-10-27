const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'El nombre no puede pasar de 100 caracteres']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede pasar de 500 caracteres'],
        default: ''
    },
    creditos: {
        type: Number,
        required: [true, 'Los créditos son obligatorios'],
        min: [0, 'Los créditos no pueden ser negativos'],
        max: [10, 'Los créditos no pueden pasar de 10']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Curso', CursoSchema);
