const mongoose = require('mongoose');

const CATEGORIAS = ['Jefes', 'Misiones', 'Principiantes', 'Builds', 'Armas', 'Personajes', 'Mapas y ubicaciones', 'Coleccionables', 'Logros y trofeos', 'Secretos', 'Trucos y atajos', 'Farmeo y recursos', 'Economía', 'Crafteo', 'Construcción', 'Supervivencia', 'Exploración', 'Estrategia', 'Competitivo', 'PvP', 'Cooperativo', 'Raids y mazmorras', 'Speedrun', 'Puzzles', 'Historia y lore', 'Finales', 'Configuración y rendimiento', 'Mods', 'Acción', 'Aventura', 'Otros'];
const DIFICULTADES = ['Fácil', 'Media', 'Difícil'];

const GuiaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    juego: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        enum: CATEGORIAS
    },
    dificultad: {
        type: String,
        required: true,
        enum: DIFICULTADES
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
    },
    // publicada: visible para todos | pendiente: espera revisión | rechazada: oculta
    estado: {
        type: String,
        enum: ['publicada', 'pendiente', 'rechazada'],
        default: 'publicada'
    },
    votos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    vistas: {
        type: Number,
        default: 0
    },
    compartidos: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

GuiaSchema.statics.CATEGORIAS = CATEGORIAS;
GuiaSchema.statics.DIFICULTADES = DIFICULTADES;

module.exports = mongoose.model('Guia', GuiaSchema);
