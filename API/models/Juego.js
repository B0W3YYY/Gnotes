const mongoose = require('mongoose');
const { PATRON_URL } = require('../utils/archivos');
const { normalizarNombreJuego, PATRON_NOMBRE_JUEGO } = require('../utils/juegos');

// Juegos agregados desde la web (los "de fábrica" están en Frontend/public/js/juegos.js)
// Se crean cuando un admin aprueba una guía que pedía un juego nuevo
const imagenSubida = {
    type: String,
    trim: true,
    validate: {
        validator: url => !url || (PATRON_URL.test(url) && /\.(jpg|png|webp|gif)$/.test(url)),
        message: 'La imagen del juego no es válida'
    }
};

const JuegoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del juego es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre del juego debe tener al menos 2 caracteres'],
        maxlength: [60, 'El nombre del juego no puede pasar de 60 caracteres'],
        match: [PATRON_NOMBRE_JUEGO, 'El nombre del juego tiene caracteres no permitidos']
    },
    // "Elden Ring" y "elden  ring!" son el mismo juego: esto evita duplicados
    nombreNormalizado: {
        type: String,
        unique: true
    },
    icono: imagenSubida,
    estandarte: imagenSubida,
    aprobadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: true
});

JuegoSchema.pre('validate', function () {
    this.nombreNormalizado = normalizarNombreJuego(this.nombre);
});

module.exports = mongoose.model('Juego', JuegoSchema);
