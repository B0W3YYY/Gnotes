const mongoose = require('mongoose');

const RolesSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [30, 'El nombre no puede pasar de 30 caracteres']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [200, 'La descripción no puede pasar de 200 caracteres'],
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Roles', RolesSchema);
