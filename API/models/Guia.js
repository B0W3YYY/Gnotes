const mongoose = require('mongoose');

const CATEGORIAS = ['Jefes', 'Misiones', 'Principiantes', 'Builds', 'Armas', 'Personajes', 'Mapas y ubicaciones', 'Coleccionables', 'Logros y trofeos', 'Secretos', 'Trucos y atajos', 'Farmeo y recursos', 'Economía', 'Crafteo', 'Construcción', 'Supervivencia', 'Exploración', 'Estrategia', 'Competitivo', 'PvP', 'Cooperativo', 'Raids y mazmorras', 'Speedrun', 'Puzzles', 'Historia y lore', 'Finales', 'Configuración y rendimiento', 'Mods', 'Acción', 'Aventura', 'Otros'];
const DIFICULTADES = ['Fácil', 'Media', 'Difícil'];

const GuiaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
        maxlength: [120, 'El título no puede pasar de 120 caracteres']
    },
    juego: {
        type: String,
        required: [true, 'El juego es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre del juego no puede pasar de 100 caracteres']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        enum: { values: CATEGORIAS, message: 'La categoría no es válida' }
    },
    dificultad: {
        type: String,
        required: [true, 'La dificultad es obligatoria'],
        enum: { values: DIFICULTADES, message: 'La dificultad no es válida' }
    },
    contenido: {
        type: String,
        required: [true, 'El contenido es obligatorio'],
        trim: true,
        maxlength: [20000, 'El contenido no puede pasar de 20000 caracteres']
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El autor es obligatorio']
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
        default: 0,
        min: 0
    },
    compartidos: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

GuiaSchema.statics.CATEGORIAS = CATEGORIAS;
GuiaSchema.statics.DIFICULTADES = DIFICULTADES;

module.exports = mongoose.model('Guia', GuiaSchema);
