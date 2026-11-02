const Guia = require('../models/Guia');
const Usuario = require('../models/Usuario');
const Comentario = require('../models/Comentario');
const { buscarProhibidas, registrarAccion } = require('../utils/moderacion');
const { buscarEmojisProhibidos, mensajeEmojis } = require('../utils/emojis');
const { existeSubida, borrarSubida, archivoEnUso } = require('../utils/archivos');
const { juegoExistente, errorNombreJuego } = require('../utils/juegos');

const ORDENES = {
    recientes: { createdAt: -1 },
    antiguas: { createdAt: 1 },
    votadas: { totalVotos: -1, createdAt: -1 },
    vistas: { vistas: -1, createdAt: -1 },
    titulo: { titulo: 1 }
};

function esModerador(usuario) {
    return usuario && ['moderador', 'admin'].includes(usuario.rol);
}

function esAutor(guia, usuario) {
    return usuario && String(guia.autor._id || guia.autor) === String(usuario._id);
}

// Convierte { campo: 1 | -1, ... } en una función para .sort()
function ordenar(orden) {
    return (a, b) => {
        for (const [campo, sentido] of Object.entries(orden)) {
            const x = a[campo] instanceof Date ? a[campo].getTime() : a[campo];
            const y = b[campo] instanceof Date ? b[campo].getTime() : b[campo];
            if (x < y) return -sentido;
            if (x > y) return sentido;
        }
        return 0;
    };
}

function escaparRegex(texto) {
    return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Solo deja guardar los campos que el usuario puede editar
function datosGuia(body) {
    const datos = {};
    for (const campo of ['titulo', 'juego', 'categoria', 'dificultad', 'contenido']) {
        if (body[campo] !== undefined) datos[campo] = body[campo];
    }
    // Multimedia: solo { tipo, url } de cada elemento; el modelo valida y normaliza el resto
    if (Array.isArray(body.multimedia)) {
        datos.multimedia = body.multimedia
            .filter(m => m && typeof m === 'object')
            .map(m => ({ tipo: String(m.tipo || ''), url: String(m.url || '') }));
    }
    return datos;
}

// Si el juego ya existe (lista de fábrica o aprobado) usa su nombre oficial;
// si no, es un juego nuevo: se valida el nombre y la guía espera revisión de un admin
// Devuelve el mensaje de error o ''
async function resolverJuego(guia) {
    if (!guia.juego) return '';
    const oficial = await juegoExistente(guia.juego);
    if (oficial) {
        guia.juego = oficial;
        guia.juegoNuevo = false;
        return '';
    }
    const error = errorNombreJuego(guia.juego);
    if (error) return error;
    guia.juego = guia.juego.trim().replace(/\s+/g, ' ');
    guia.juegoNuevo = true;
    return '';
}

// Archivos subidos (/uploads/...) que usa una lista de multimedia
function urlsSubidas(multimedia = []) {
    return multimedia.filter(m => m.tipo !== 'enlace').map(m => m.url);
}

// Un archivo subido tiene que existir en el servidor para poder usarlo en una guía
function archivoFaltante(multimedia = []) {
    return urlsSubidas(multimedia).find(url => !existeSubida(url));
}

// Borra del disco los archivos que ya no usa ninguna guía
async function borrarSiNoSeUsan(urls) {
    for (const url of new Set(urls)) {
        if (!(await archivoEnUso(url))) borrarSubida(url);
    }
}


//GET opciones (categorías y dificultades)
function opciones(req, res) {
    res.json({ categorias: Guia.CATEGORIAS, dificultades: Guia.DIFICULTADES });
}


//GET todas: búsqueda, filtros y orden
// ?q=texto&juego=...&categoria=...&dificultad=...&orden=recientes|antiguas|votadas|vistas|titulo&autor=id
async function listar(req, res, next) {
    try {
        const filtro = { estado: 'publicada' };

        // El autor puede ver todas sus guías (también pendientes o rechazadas)
        if (req.query.autor) {
            filtro.autor = req.query.autor;
            if (req.usuario && String(req.usuario._id) === String(req.query.autor)) delete filtro.estado;
        }

        if (req.query.q) {
            const texto = new RegExp(escaparRegex(req.query.q), 'i');
            filtro.$or = [{ titulo: texto }, { juego: texto }, { contenido: texto }];
        }
        if (req.query.juego) filtro.juego = new RegExp(escaparRegex(req.query.juego), 'i');
        if (req.query.categoria) filtro.categoria = String(req.query.categoria);
        if (req.query.dificultad) filtro.dificultad = String(req.query.dificultad);

        const orden = ORDENES[req.query.orden] || ORDENES.recientes;

        const guias = (await Guia.find(filtro).select('-contenido').populate('autor', 'nombre'))
            .map(g => {
                const guia = g.toJSON();
                guia.totalVotos = g.votos.length;
                delete guia.votos;
                return guia;
            })
            .sort(ordenar(orden));

        res.json(guias);
    } catch (error) {
        next(error);
    }
}


//GET por ID (suma una vista)
async function obtener(req, res, next) {
    try {
        const guias = await Guia.findById(req.params.id).populate('autor', 'nombre');

        if (!guias) {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }

        if (guias.estado !== 'publicada' && !esAutor(guias, req.usuario) && !esModerador(req.usuario)) {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }

        if (!esAutor(guias, req.usuario)) {
            guias.vistas += 1;
            await guias.save();
        }

        const respuesta = guias.toJSON();
        respuesta.totalVotos = guias.votos.length;
        respuesta.yaVoto = !!req.usuario && guias.votos.some(v => String(v) === String(req.usuario._id));
        respuesta.esFavorito = !!req.usuario && req.usuario.favoritos.some(f => String(f) === String(guias._id));
        respuesta.esAutor = esAutor(guias, req.usuario);
        respuesta.puedeModerar = esModerador(req.usuario);
        delete respuesta.votos;

        res.json(respuesta);
    } catch (error) {
        next(error);
    }
}


//POST crear (si tiene palabras prohibidas queda pendiente de revisión)
async function crear(req, res, next) {
    try {
        const guias = new Guia({ ...datosGuia(req.body), autor: req.usuario._id });

        if (archivoFaltante(guias.multimedia)) {
            return res.status(400).json({ ok: false, message: "Uno de los archivos ya no existe. Vuelve a subirlo" });
        }

        const emojis = buscarEmojisProhibidos(guias.titulo, guias.juego, guias.contenido);
        if (emojis.length) {
            return res.status(400).json({ ok: false, message: mensajeEmojis(emojis) });
        }

        const errorJuego = await resolverJuego(guias);
        if (errorJuego) {
            return res.status(400).json({ ok: false, message: errorJuego });
        }

        const prohibidas = await buscarProhibidas(guias.titulo, guias.contenido);
        if (prohibidas.length || guias.juegoNuevo) guias.estado = 'pendiente';

        await guias.save();
        res.status(201).json(guias);
    } catch (error) {
        next(error);
    }
}


//PUT por ID (solo el autor)
async function actualizar(req, res, next) {
    try {
        const guias = await Guia.findById(req.params.id);

        if (!guias) {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }
        if (!esAutor(guias, req.usuario)) {
            return res.status(403).json({ ok: false, message: "Solo el autor puede editar esta guía" });
        }

        const urlsAntes = urlsSubidas(guias.multimedia);
        Object.assign(guias, datosGuia(req.body));

        if (archivoFaltante(guias.multimedia)) {
            return res.status(400).json({ ok: false, message: "Uno de los archivos ya no existe. Vuelve a subirlo" });
        }

        const emojis = buscarEmojisProhibidos(guias.titulo, guias.juego, guias.contenido);
        if (emojis.length) {
            return res.status(400).json({ ok: false, message: mensajeEmojis(emojis) });
        }

        // El juego se vuelve a revisar si cambió o si seguía esperando aprobación
        if (req.body.juego !== undefined || guias.juegoNuevo) {
            const errorJuego = await resolverJuego(guias);
            if (errorJuego) {
                return res.status(400).json({ ok: false, message: errorJuego });
            }
        }

        const prohibidas = await buscarProhibidas(guias.titulo, guias.contenido);
        if (prohibidas.length || guias.juegoNuevo) guias.estado = 'pendiente';
        else if (guias.estado === 'pendiente') guias.estado = 'publicada';

        // save() corre todas las validaciones del esquema
        await guias.save();

        // Los archivos que se quitaron de la guía se borran del disco
        const urlsAhora = urlsSubidas(guias.multimedia);
        await borrarSiNoSeUsan(urlsAntes.filter(url => !urlsAhora.includes(url)));

        res.json({
            mensaje: "Guía actualizada",
            datos: guias
        });
    } catch (error) {
        next(error);
    }
}


//DELETE por ID (el autor, o un moderador)
async function eliminar(req, res, next) {
    try {
        const guias = await Guia.findById(req.params.id);

        if (!guias) {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }
        if (!esAutor(guias, req.usuario) && !esModerador(req.usuario)) {
            return res.status(403).json({ ok: false, message: "No puedes eliminar esta guía" });
        }

        await Comentario.deleteMany({ guia: guias._id });
        await Usuario.updateMany({}, { $pull: { favoritos: guias._id } });
        await guias.deleteOne();
        await borrarSiNoSeUsan(urlsSubidas(guias.multimedia));

        if (!esAutor(guias, req.usuario)) {
            await registrarAccion(req.usuario, 'Eliminó una guía', guias.titulo);
        }

        res.json({
            mensaje: "Guía eliminada",
            datos: req.params.id
        });
    } catch (error) {
        next(error);
    }
}


//POST subir imágenes o vídeos (multipart, campo "archivos"); devuelve las URL para usarlas en la guía
// La validación de formato, firma y tamaño la hace el middleware subirMultimedia
function subirArchivos(req, res) {
    res.status(201).json({ ok: true, archivos: req.subidos });
}


//POST votar / quitar voto
async function votar(req, res, next) {
    try {
        const guias = await Guia.findById(req.params.id);

        if (!guias || guias.estado !== 'publicada') {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }
        if (esAutor(guias, req.usuario)) {
            return res.status(400).json({ ok: false, message: "No puedes votar tu propia guía" });
        }

        const yaVoto = guias.votos.some(v => String(v) === String(req.usuario._id));
        if (yaVoto) guias.votos.pull(req.usuario._id);
        else guias.votos.push(req.usuario._id);
        await guias.save();

        res.json({ yaVoto: !yaVoto, totalVotos: guias.votos.length });
    } catch (error) {
        next(error);
    }
}


//POST agregar / quitar de favoritos
async function marcarFavorito(req, res, next) {
    try {
        const guias = await Guia.findById(req.params.id);

        if (!guias || guias.estado !== 'publicada') {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }

        const usuarios = req.usuario;
        const esFavorito = usuarios.favoritos.some(f => String(f) === String(guias._id));
        if (esFavorito) usuarios.favoritos.pull(guias._id);
        else usuarios.favoritos.push(guias._id);
        await usuarios.save();

        res.json({ esFavorito: !esFavorito });
    } catch (error) {
        next(error);
    }
}


//POST contar una vez compartida
async function compartir(req, res, next) {
    try {
        const guias = await Guia.findByIdAndUpdate(req.params.id, { $inc: { compartidos: 1 } }, { returnDocument: 'after', runValidators: true });

        if (!guias) {
            return res.status(404).json({ ok: false, message: "Guía no encontrada" });
        }

        res.json({ compartidos: guias.compartidos });
    } catch (error) {
        next(error);
    }
}

module.exports = { opciones, subirArchivos, listar, obtener, crear, actualizar, eliminar, votar, marcarFavorito, compartir };
