// Mensajes para datos repetidos (índices unique)
const DUPLICADOS = {
    correo: "Ese correo ya está en uso",
    palabra: "Esa palabra ya está en la lista",
    nombre: "Ese nombre ya existe",
    nombreNormalizado: "Ese juego ya existe"
};

// Mensajes para los errores de multer al subir archivos
const MENSAJES_SUBIDA = {
    LIMIT_FILE_SIZE: "Un archivo pesa demasiado. Máximo 10 MB por imagen y 100 MB por vídeo",
    LIMIT_FILE_COUNT: "Demasiados archivos a la vez. Sube como máximo 10",
    LIMIT_UNEXPECTED_FILE: "Los archivos deben enviarse en el campo \"archivos\" (máximo 10)",
    LIMIT_PART_COUNT: "La petición trae demasiadas partes",
    LIMIT_FIELD_COUNT: "La petición trae demasiados campos",
    LIMIT_FIELD_KEY: "El nombre de un campo es demasiado largo",
    LIMIT_FIELD_VALUE: "El valor de un campo es demasiado largo"
};

// Rutas que no existen
function rutaNoEncontrada(req, res) {
    res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
}

// Manejo central de errores: todo error que llegue con next(error) termina aquí
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ ok: false, message: "El cuerpo de la petición no es un JSON válido" });
    }

    if (error.name === 'ValidationError') {
        const errores = [...new Set(Object.values(error.errors).map(e => e.message))];
        return res.status(400).json({ ok: false, message: errores.join('. '), errores });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({ ok: false, message: `El valor de "${error.path}" no es válido` });
    }

    if (error.code === 11000) {
        const campo = Object.keys(error.keyValue || {})[0];
        return res.status(400).json({ ok: false, message: DUPLICADOS[campo] || "Ese registro ya existe", campo });
    }

    // Errores de la subida de archivos (multer)
    if (error.name === 'MulterError') {
        const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({ ok: false, message: MENSAJES_SUBIDA[error.code] || "No pudimos recibir los archivos", codigo: error.code });
    }

    // Errores creados por la API con un mensaje pensado para el usuario
    if (error.mensajePublico && error.status >= 400 && error.status < 500) {
        return res.status(error.status).json({ ok: false, message: error.mensajePublico });
    }

    // Otros errores de la petición que trae Express (por ejemplo, un cuerpo demasiado grande)
    if (error.status >= 400 && error.status < 500) {
        return res.status(error.status).json({ ok: false, message: "La petición no es válida" });
    }

    // Errores inesperados: se registran en el servidor, al cliente no se le dan detalles
    console.error(error);
    res.status(500).json({ ok: false, message: "Ocurrió un error en el servidor" });
}

module.exports = { rutaNoEncontrada, manejarErrores };
