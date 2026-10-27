const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [50, 'El nombre no puede pasar de 50 caracteres']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no es válido']
    },
    // Siempre encriptada con bcrypt: nunca se guarda ni se devuelve en texto plano
    clave: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    rol: {
        type: String,
        enum: { values: ['usuario', 'moderador', 'admin'], message: 'El rol no es válido' },
        default: 'usuario'
    },
    biografia: {
        type: String,
        trim: true,
        maxlength: [500, 'La biografía no puede pasar de 500 caracteres'],
        default: ''
    },
    favoritos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guia'
    }],
    // Recuperación de contraseña
    tokenRecuperacion: String,
    tokenExpira: Date
}, {
    timestamps: true
});

// Nunca devolver la clave ni el token al convertir a JSON
UsuarioSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.clave;
        delete ret.tokenRecuperacion;
        delete ret.tokenExpira;
        return ret;
    }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
