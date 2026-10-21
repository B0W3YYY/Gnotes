const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    clave: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['usuario', 'moderador', 'admin'],
        default: 'usuario'
    },
    biografia: {
        type: String,
        trim: true,
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
