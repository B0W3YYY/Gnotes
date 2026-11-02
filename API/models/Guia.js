const mongoose = require('mongoose');
const { PATRON_URL, MAX_MULTIMEDIA_POR_GUIA, FORMATOS } = require('../utils/archivos');
const { normalizarEnlaceVideo, NOMBRES_PROVEEDORES } = require('../utils/enlacesVideo');

// Imagen o vídeo subido (url: /uploads/<nombre aleatorio>) o enlace de vídeo de una plataforma permitida
const MultimediaSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: [true, 'El tipo de multimedia es obligatorio'],
        enum: { values: ['imagen', 'video', 'enlace'], message: 'El tipo de multimedia no es válido' }
    },
    url: {
        type: String,
        required: [true, 'La dirección de la multimedia es obligatoria'],
        trim: true,
        maxlength: [500, 'La dirección de la multimedia es demasiado larga']
    },
    proveedor: {
        type: String,
        enum: { values: NOMBRES_PROVEEDORES, message: 'La plataforma de vídeo no está permitida' }
    }
}, { _id: false });

// Antes de validar: los enlaces se vuelven a analizar y se guardan como URL de embed normalizada
MultimediaSchema.pre('validate', function () {
    if (this.tipo === 'enlace') {
        const enlace = normalizarEnlaceVideo(this.url);
        if (!enlace) {
            this.invalidate('url', 'Solo se aceptan enlaces https de YouTube, Vimeo, Twitch, Streamable o Kick');
            return;
        }
        this.url = enlace.url;
        this.proveedor = enlace.proveedor;
        return;
    }

    this.proveedor = undefined;
    if (!PATRON_URL.test(this.url)) {
        this.invalidate('url', 'El archivo de multimedia no es válido');
        return;
    }
    // La extensión del archivo tiene que corresponder al tipo (imagen o vídeo)
    // (los archivos se guardan con la extensión igual al nombre del formato: jpg, png, mp4...)
    const formato = FORMATOS[this.url.split('.').pop()];
    if (!formato || formato.tipo !== this.tipo) {
        this.invalidate('tipo', 'El tipo no coincide con el archivo subido');
    }
});

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
    // true cuando el juego no existía en la web: la guía espera a que un admin apruebe el juego
    juegoNuevo: {
        type: Boolean,
        default: false
    },
    multimedia: {
        type: [MultimediaSchema],
        default: [],
        validate: {
            validator: lista => lista.length <= MAX_MULTIMEDIA_POR_GUIA,
            message: `Una guía puede tener como máximo ${MAX_MULTIMEDIA_POR_GUIA} imágenes, vídeos o enlaces`
        }
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
