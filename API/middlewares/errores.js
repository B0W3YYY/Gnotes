// Mensajes para datos repetidos (índices unique)
const DUPLICADOS = {
    correo: "Ese correo ya está en uso",
    palabra: "Esa palabra ya está en la lista",
    nombre: "Ese nombre ya existe"
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
        const errores = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ ok: false, message: errores.join('. '), errores });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({ ok: false, message: `El valor de "${error.path}" no es válido` });
    }

    if (error.code === 11000) {
        const campo = Object.keys(error.keyValue || {})[0];
        return res.status(400).json({ ok: false, message: DUPLICADOS[campo] || "Ese registro ya existe", campo });
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
