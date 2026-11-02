// ===== Archivos que se pueden subir a una guía =====
// Lista blanca estricta: extensión, tipo MIME y firma real del archivo (los primeros bytes) tienen que coincidir.
// No se acepta SVG (puede llevar JavaScript), ni HTML, ZIP, ejecutables, scripts, etc.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MB = 1024 * 1024;
const LIMITE_IMAGEN = 10 * MB;
const LIMITE_VIDEO = 100 * MB;
const MAX_ARCHIVOS_POR_SUBIDA = 10;
const MAX_MULTIMEDIA_POR_GUIA = 12;

const CARPETA_SUBIDAS = path.join(__dirname, '..', 'uploads');

// formato -> extensiones aceptadas, tipos MIME que puede mandar el navegador, tipo de multimedia y límite
const FORMATOS = {
    jpg: { extensiones: ['jpg', 'jpeg'], mimes: ['image/jpeg', 'image/pjpeg'], tipo: 'imagen', limite: LIMITE_IMAGEN, contentType: 'image/jpeg' },
    png: { extensiones: ['png'], mimes: ['image/png'], tipo: 'imagen', limite: LIMITE_IMAGEN, contentType: 'image/png' },
    webp: { extensiones: ['webp'], mimes: ['image/webp'], tipo: 'imagen', limite: LIMITE_IMAGEN, contentType: 'image/webp' },
    gif: { extensiones: ['gif'], mimes: ['image/gif'], tipo: 'imagen', limite: LIMITE_IMAGEN, contentType: 'image/gif' },
    mp4: { extensiones: ['mp4', 'm4v'], mimes: ['video/mp4', 'video/x-m4v'], tipo: 'video', limite: LIMITE_VIDEO, contentType: 'video/mp4' },
    webm: { extensiones: ['webm'], mimes: ['video/webm'], tipo: 'video', limite: LIMITE_VIDEO, contentType: 'video/webm' },
    mov: { extensiones: ['mov'], mimes: ['video/quicktime'], tipo: 'video', limite: LIMITE_VIDEO, contentType: 'video/quicktime' }
};

// Extensión con la que se guarda cada formato en el disco
const EXTENSION_GUARDADA = { jpg: 'jpg', png: 'png', webp: 'webp', gif: 'gif', mp4: 'mp4', webm: 'webm', mov: 'mov' };

// Content-Type según la extensión guardada (para servir /uploads)
const TIPO_POR_EXTENSION = Object.fromEntries(Object.entries(EXTENSION_GUARDADA).map(([f, ext]) => [ext, FORMATOS[f].contentType]));

// Nombre que tiene un archivo subido: 32 caracteres hexadecimales + extensión permitida
const PATRON_NOMBRE = new RegExp(`^[a-f0-9]{32}\\.(${Object.values(EXTENSION_GUARDADA).join('|')})$`);
const PATRON_URL = new RegExp(`^/uploads/[a-f0-9]{32}\\.(${Object.values(EXTENSION_GUARDADA).join('|')})$`);

function extensionDe(nombreOriginal) {
    return path.extname(String(nombreOriginal || '')).slice(1).toLowerCase();
}

// Busca el formato por extensión y tipo MIME (primer filtro, antes de leer el archivo)
function formatoPorNombre(nombreOriginal, mimetype) {
    const ext = extensionDe(nombreOriginal);
    const formato = Object.keys(FORMATOS).find(f => FORMATOS[f].extensiones.includes(ext));
    if (!formato) return null;
    if (!FORMATOS[formato].mimes.includes(String(mimetype || '').toLowerCase())) return null;
    return formato;
}

// Reconoce el formato real mirando los primeros bytes (firma o "magic bytes")
function formatoPorFirma(bytes) {
    const b = Buffer.from(bytes);
    const ascii = (inicio, fin) => b.subarray(inicio, fin).toString('latin1');

    if (b.length >= 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'jpg';
    if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'png';
    if (b.length >= 6 && (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a')) return 'gif';
    if (b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp';
    if (b.length >= 4 && b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3) return 'webm';  // EBML (Matroska/WebM)

    // MP4 / MOV: caja "ftyp" en los bytes 4-8 y la marca del formato después
    if (b.length >= 12 && ascii(4, 8) === 'ftyp') {
        const marca = ascii(8, 12);
        if (marca === 'qt  ') return 'mov';
        return 'mp4';
    }
    return null;
}

// Comprueba que la firma coincide con lo que dicen la extensión y el MIME
// (un .mov con marca de MP4 o al revés se acepta: son el mismo contenedor)
function firmaCoincide(formatoDeclarado, formatoReal) {
    if (formatoDeclarado === formatoReal) return true;
    const contenedorMp4 = ['mp4', 'mov'];
    return contenedorMp4.includes(formatoDeclarado) && contenedorMp4.includes(formatoReal);
}

// Lee los primeros bytes de un archivo ya guardado
function leerInicio(ruta, cantidad = 32) {
    const descriptor = fs.openSync(ruta, 'r');
    try {
        const buffer = Buffer.alloc(cantidad);
        const leidos = fs.readSync(descriptor, buffer, 0, cantidad, 0);
        return buffer.subarray(0, leidos);
    } finally {
        fs.closeSync(descriptor);
    }
}

// Revisa un archivo completo: { nombreOriginal, mimetype, tamano, bytes }
// Devuelve { ok: true, formato, tipo } o { ok: false, mensaje }
function validarArchivo({ nombreOriginal, mimetype, tamano, bytes }) {
    const formato = formatoPorNombre(nombreOriginal, mimetype);
    if (!formato) {
        return { ok: false, mensaje: `"${nombreSeguro(nombreOriginal)}" no es un formato permitido. Solo imágenes JPG, PNG, WEBP o GIF y vídeos MP4, WEBM o MOV` };
    }
    const real = formatoPorFirma(bytes);
    if (!real || !firmaCoincide(formato, real)) {
        return { ok: false, mensaje: `"${nombreSeguro(nombreOriginal)}" no es realmente un archivo ${formato.toUpperCase()}` };
    }
    const { tipo, limite } = FORMATOS[formato];
    if (tamano > limite) {
        return { ok: false, mensaje: `"${nombreSeguro(nombreOriginal)}" pesa demasiado. Máximo ${limite / MB} MB para ${tipo === 'imagen' ? 'imágenes' : 'vídeos'}` };
    }
    if (tamano === 0) {
        return { ok: false, mensaje: `"${nombreSeguro(nombreOriginal)}" está vacío` };
    }
    return { ok: true, formato, tipo };
}

// El nombre original solo se usa en mensajes, recortado y sin caracteres raros
function nombreSeguro(nombre) {
    return String(nombre || 'archivo').replace(/[^\w.\- ()áéíóúñÁÉÍÓÚÑ]/g, '').slice(0, 60) || 'archivo';
}

// Nombre aleatorio para guardar en el disco (nunca el nombre del usuario)
function nombreAleatorio(formato) {
    return `${crypto.randomBytes(16).toString('hex')}.${EXTENSION_GUARDADA[formato]}`;
}

// Borra un archivo de /uploads a partir de su URL, sin salir de la carpeta (evita path traversal)
function borrarSubida(url) {
    if (!PATRON_URL.test(String(url))) return;
    const ruta = path.join(CARPETA_SUBIDAS, path.basename(url));
    fs.promises.unlink(ruta).catch(() => { });
}

// ¿Alguna guía o juego usa este archivo? (require aquí adentro para no crear un ciclo con los modelos)
async function archivoEnUso(url) {
    const Guia = require('../models/Guia');
    const Juego = require('../models/Juego');
    return !!(await Guia.exists({ 'multimedia.url': url }) ||
        await Juego.exists({ $or: [{ icono: url }, { estandarte: url }] }));
}

function existeSubida(url) {
    if (!PATRON_URL.test(String(url))) return false;
    return fs.existsSync(path.join(CARPETA_SUBIDAS, path.basename(url)));
}

module.exports = {
    FORMATOS, TIPO_POR_EXTENSION, PATRON_NOMBRE, PATRON_URL, CARPETA_SUBIDAS,
    LIMITE_IMAGEN, LIMITE_VIDEO, MAX_ARCHIVOS_POR_SUBIDA, MAX_MULTIMEDIA_POR_GUIA,
    formatoPorNombre, formatoPorFirma, validarArchivo, leerInicio, nombreAleatorio, nombreSeguro,
    borrarSubida, existeSubida, archivoEnUso
};
