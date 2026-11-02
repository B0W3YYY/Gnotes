// ===== Subida de imágenes y vídeos para las guías (multer) =====
// 1. multer guarda cada archivo en uploads/tmp con un nombre aleatorio (nunca el original)
// 2. fileFilter rechaza de entrada lo que no tenga extensión y MIME permitidos
// 3. Al terminar se lee la firma real de cada archivo; si algo falla se borran TODOS los de esa subida
// 4. Los válidos se mueven a uploads/ con su nombre definitivo y se devuelven sus URL
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const {
    CARPETA_SUBIDAS, LIMITE_VIDEO, MAX_ARCHIVOS_POR_SUBIDA,
    formatoPorNombre, validarArchivo, leerInicio, nombreAleatorio, nombreSeguro
} = require('../utils/archivos');

const CARPETA_TEMPORAL = path.join(CARPETA_SUBIDAS, 'tmp');
fs.mkdirSync(CARPETA_TEMPORAL, { recursive: true });

// Error con un mensaje que sí se le puede mostrar al usuario
function errorSubida(mensaje, status = 400) {
    const error = new Error(mensaje);
    error.status = status;
    error.mensajePublico = mensaje;
    return error;
}

const subir = multer({
    storage: multer.diskStorage({
        destination: CARPETA_TEMPORAL,
        filename: (req, archivo, cb) => cb(null, crypto.randomBytes(16).toString('hex'))
    }),
    limits: {
        fileSize: LIMITE_VIDEO,           // el límite más alto; las imágenes se revisan después (10 MB)
        files: MAX_ARCHIVOS_POR_SUBIDA,
        fields: 5,
        parts: MAX_ARCHIVOS_POR_SUBIDA + 5,
        fieldNameSize: 50
    },
    fileFilter: (req, archivo, cb) => {
        if (formatoPorNombre(archivo.originalname, archivo.mimetype)) return cb(null, true);
        cb(errorSubida(`"${nombreSeguro(archivo.originalname)}" no es un formato permitido. Solo imágenes JPG, PNG, WEBP o GIF y vídeos MP4, WEBM o MOV`, 415));
    }
}).array('archivos', MAX_ARCHIVOS_POR_SUBIDA);

function borrarTemporales(archivos = []) {
    for (const archivo of archivos) fs.promises.unlink(archivo.path).catch(() => { });
}

// Middleware: deja en req.subidos la lista [{ tipo, url, nombre }]
function subirMultimedia(req, res, next) {
    subir(req, res, async (error) => {
        // Si multer cortó a mitad, borra lo que alcanzó a guardar
        if (error) {
            borrarTemporales(req.files);
            // Formulario multipart cortado o mal armado (error del lector, sin código HTTP)
            // (los errores del disco, como ENOSPC, siguen siendo errores del servidor)
            if (error.name !== 'MulterError' && !error.status && !/^E[A-Z]+$/.test(error.code || '')) {
                return next(errorSubida('El envío de archivos llegó incompleto o mal formado'));
            }
            return next(error);
        }

        const archivos = req.files || [];
        if (!archivos.length) {
            return next(errorSubida('No se recibió ningún archivo. Envíalos en el campo "archivos"'));
        }

        // Primero se revisan todos; si uno falla no se guarda ninguno
        const revisados = [];
        for (const archivo of archivos) {
            let bytes;
            try {
                bytes = leerInicio(archivo.path);
            } catch (e) {
                bytes = Buffer.alloc(0);
            }
            const resultado = validarArchivo({
                nombreOriginal: archivo.originalname,
                mimetype: archivo.mimetype,
                tamano: archivo.size,
                bytes
            });
            if (!resultado.ok) {
                borrarTemporales(archivos);
                return next(errorSubida(resultado.mensaje, resultado.mensaje.includes('pesa demasiado') ? 413 : 415));
            }
            revisados.push({ archivo, ...resultado });
        }

        try {
            req.subidos = [];
            for (const { archivo, formato, tipo } of revisados) {
                const nombre = nombreAleatorio(formato);
                await fs.promises.rename(archivo.path, path.join(CARPETA_SUBIDAS, nombre));
                req.subidos.push({ tipo, url: `/uploads/${nombre}`, nombre: nombreSeguro(archivo.originalname) });
            }
            next();
        } catch (e) {
            borrarTemporales(archivos);
            next(e);
        }
    });
}

module.exports = { subirMultimedia, CARPETA_TEMPORAL };
