const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const Guia = require('../models/Guia');
const Comentario = require('../models/Comentario');
const { sancionVigente } = require('../middlewares/auth');
const { registrarAccion } = require('../utils/moderacion');
const { buscarEmojisProhibidos, mensajeEmojis } = require('../utils/emojis');

function crearToken(usuario) {
    return jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function respuestaSesion(usuario) {
    return {
        token: crearToken(usuario),
        usuario: { _id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    };
}

function claveValida(clave) {
    return typeof clave === 'string' && clave.length >= 6;
}

// Borra la cuenta junto con sus guías, comentarios y votos
async function borrarCuenta(usuario) {
    const guias = await Guia.find({ autor: usuario._id }).select('_id');
    await Comentario.deleteMany({ $or: [{ autor: usuario._id }, { guia: { $in: guias } }] });
    await Guia.deleteMany({ autor: usuario._id });
    await Guia.updateMany({}, { $pull: { votos: usuario._id } });
    await usuario.deleteOne();
}


//POST registro
async function registrar(req, res, next) {
    try {
        if (!claveValida(req.body.clave)) {
            return res.status(400).json({ ok: false, message: "La contraseña debe tener al menos 6 caracteres" });
        }

        const emojis = buscarEmojisProhibidos(req.body.nombre);
        if (emojis.length) {
            return res.status(400).json({ ok: false, message: mensajeEmojis(emojis) });
        }

        // Solo se toman nombre y correo: el rol y los demás campos los pone el servidor
        const usuarios = new Usuario({
            nombre: req.body.nombre,
            correo: req.body.correo,
            clave: await bcrypt.hash(req.body.clave, 10)
        });
        await usuarios.save();

        res.status(201).json(respuestaSesion(usuarios));
    } catch (error) {
        next(error);
    }
}


//POST login
async function iniciarSesion(req, res, next) {
    try {
        const usuarios = await Usuario.findOne({ correo: String(req.body.correo || '').toLowerCase().trim() });
        const clave = String(req.body.clave || '');

        let correcta = false;
        if (usuarios) {
            if (usuarios.clave.startsWith('$2')) {
                correcta = await bcrypt.compare(clave, usuarios.clave);
            } else if (usuarios.clave === clave) {
                // Cuentas viejas con la clave sin encriptar: se encripta al entrar
                correcta = true;
                usuarios.clave = await bcrypt.hash(clave, 10);
                await usuarios.save();
            }
        }

        if (!correcta) {
            return res.status(401).json({ ok: false, message: "Correo o contraseña incorrectos" });
        }

        const sancion = await sancionVigente(usuarios._id);
        if (sancion) {
            const hasta = sancion.tipo === 'suspension' ? ` hasta el ${sancion.hasta.toLocaleDateString('es')}` : '';
            return res.status(403).json({ ok: false, message: `Tu cuenta está ${sancion.tipo === 'bloqueo' ? 'bloqueada' : 'suspendida'}${hasta}` });
        }

        res.json(respuestaSesion(usuarios));
    } catch (error) {
        next(error);
    }
}


//POST recuperar contraseña: genera un enlace y lo envía por correo
async function recuperarClave(req, res) {
    // Siempre se responde lo mismo, para no revelar qué correos existen
    const respuesta = { message: "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña" };

    try {
        const usuarios = await Usuario.findOne({ correo: String(req.body.correo || '').toLowerCase().trim() });
        if (!usuarios) return res.json(respuesta);

        const token = crypto.randomBytes(32).toString('hex');
        usuarios.tokenRecuperacion = crypto.createHash('sha256').update(token).digest('hex');
        usuarios.tokenExpira = new Date(Date.now() + 60 * 60 * 1000);
        await usuarios.save();

        const enlace = `${process.env.FRONTEND_URL}/pages/restablecer.html?token=${token}`;

        await fetch(process.env.EMAIL_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: usuarios.correo,
                title: 'GNotes · Restablecer contraseña',
                text: `<h2>Hola, ${usuarios.nombre}</h2>
                       <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                       <p><a href="${enlace}">Haz clic aquí para crear una nueva</a>. El enlace vence en 1 hora.</p>
                       <p>Si no fuiste tú, ignora este correo.</p>`
            })
        }).catch(() => { });

        res.json(respuesta);
    } catch (error) {
        res.json(respuesta);
    }
}


//POST restablecer contraseña con el token del correo
async function restablecerClave(req, res, next) {
    try {
        if (!claveValida(req.body.clave)) {
            return res.status(400).json({ ok: false, message: "La contraseña debe tener al menos 6 caracteres" });
        }

        const hash = crypto.createHash('sha256').update(String(req.body.token || '')).digest('hex');
        const usuarios = await Usuario.findOne({ tokenRecuperacion: hash, tokenExpira: { $gt: new Date() } });

        if (!usuarios) {
            return res.status(400).json({ ok: false, message: "El enlace no es válido o ya venció" });
        }

        usuarios.clave = await bcrypt.hash(req.body.clave, 10);
        usuarios.tokenRecuperacion = undefined;
        usuarios.tokenExpira = undefined;
        await usuarios.save();

        res.json({ message: "Contraseña actualizada" });
    } catch (error) {
        next(error);
    }
}


//GET mi perfil
function verPerfil(req, res) {
    res.json(req.usuario);
}


//PUT editar mi perfil
async function editarPerfil(req, res, next) {
    try {
        const emojis = buscarEmojisProhibidos(req.body.nombre, req.body.biografia);
        if (emojis.length) {
            return res.status(400).json({ ok: false, message: mensajeEmojis(emojis) });
        }

        const usuarios = req.usuario;
        if (req.body.nombre !== undefined) usuarios.nombre = req.body.nombre;
        if (req.body.correo !== undefined) usuarios.correo = req.body.correo;
        if (req.body.biografia !== undefined) usuarios.biografia = req.body.biografia;
        await usuarios.save();

        res.json({
            mensaje: "Perfil actualizado",
            datos: usuarios
        });
    } catch (error) {
        next(error);
    }
}


//PUT cambiar mi contraseña
async function cambiarClave(req, res, next) {
    try {
        const usuarios = await Usuario.findById(req.usuario._id);

        if (!(await bcrypt.compare(String(req.body.actual || ''), usuarios.clave))) {
            return res.status(400).json({ ok: false, message: "La contraseña actual no es correcta" });
        }
        if (!claveValida(req.body.nueva)) {
            return res.status(400).json({ ok: false, message: "La contraseña debe tener al menos 6 caracteres" });
        }

        usuarios.clave = await bcrypt.hash(req.body.nueva, 10);
        await usuarios.save();

        res.json({ message: "Contraseña actualizada" });
    } catch (error) {
        next(error);
    }
}


//DELETE eliminar mi cuenta (pide la contraseña para confirmar)
async function eliminarPerfil(req, res, next) {
    try {
        const usuarios = await Usuario.findById(req.usuario._id);

        if (!(await bcrypt.compare(String(req.body?.clave || ''), usuarios.clave))) {
            return res.status(400).json({ ok: false, message: "La contraseña no es correcta" });
        }

        await borrarCuenta(usuarios);
        res.json({ mensaje: "Cuenta eliminada" });
    } catch (error) {
        next(error);
    }
}


//GET mis estadísticas (dashboard)
async function verEstadisticas(req, res, next) {
    try {
        const guias = await Guia.find({ autor: req.usuario._id });
        const comentarios = await Comentario.countDocuments({ autor: req.usuario._id });

        res.json({
            guias: guias.length,
            publicadas: guias.filter(g => g.estado === 'publicada').length,
            pendientes: guias.filter(g => g.estado === 'pendiente').length,
            votos: guias.reduce((total, g) => total + g.votos.length, 0),
            vistas: guias.reduce((total, g) => total + g.vistas, 0),
            favoritos: req.usuario.favoritos.length,
            comentarios
        });
    } catch (error) {
        next(error);
    }
}


//GET mis favoritos
async function verFavoritos(req, res, next) {
    try {
        const usuarios = await Usuario.findById(req.usuario._id).populate({
            path: 'favoritos',
            match: { estado: 'publicada' },
            populate: { path: 'autor', select: 'nombre' }
        });
        res.json(usuarios.favoritos);
    } catch (error) {
        next(error);
    }
}


//GET todos (solo admin)
async function listar(req, res, next) {
    try {
        const usuarios = await Usuario.find().sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (error) {
        next(error);
    }
}


//GET perfil público por ID
async function obtener(req, res, next) {
    try {
        const usuarios = await Usuario.findById(req.params.id).select('nombre biografia rol createdAt');

        if (!usuarios) {
            return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
        }

        res.json(usuarios);
    } catch (error) {
        next(error);
    }
}


//PUT cambiar rol (solo admin)
async function cambiarRol(req, res, next) {
    try {
        if (String(req.params.id) === String(req.usuario._id)) {
            return res.status(400).json({ ok: false, message: "No puedes cambiar tu propio rol" });
        }

        const usuarios = await Usuario.findByIdAndUpdate(
            req.params.id,
            { rol: req.body.rol },
            { returnDocument: 'after', runValidators: true }
        );

        if (!usuarios) {
            return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
        }

        await registrarAccion(req.usuario, 'Cambio de rol', `${usuarios.nombre} ahora es ${usuarios.rol}`);

        res.json({
            mensaje: "Rol actualizado",
            datos: usuarios
        });
    } catch (error) {
        next(error);
    }
}


//DELETE eliminar una cuenta (solo admin)
async function eliminar(req, res, next) {
    try {
        if (String(req.params.id) === String(req.usuario._id)) {
            return res.status(400).json({ ok: false, message: "Para eliminar tu propia cuenta usa tu perfil" });
        }

        const usuarios = await Usuario.findById(req.params.id);

        if (!usuarios) {
            return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
        }

        await borrarCuenta(usuarios);
        await registrarAccion(req.usuario, 'Eliminó una cuenta', usuarios.nombre);

        res.json({
            mensaje: "Usuario eliminado",
            datos: req.params.id
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registrar, iniciarSesion, recuperarClave, restablecerClave,
    verPerfil, editarPerfil, cambiarClave, eliminarPerfil, verEstadisticas, verFavoritos,
    listar, obtener, cambiarRol, eliminar
};
