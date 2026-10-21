const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const Guia = require('../models/Guia');
const Comentario = require('../models/Comentario');
const { requiereSesion, requiereRol, sancionVigente } = require('../middlewares/auth');
const { registrarAccion } = require('../utils/moderacion');

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


//POST registro
router.post('/', async (req, res) => {
    try {
        if (!claveValida(req.body.clave)) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }

        const usuarios = new Usuario({
            nombre: req.body.nombre,
            correo: req.body.correo,
            clave: await bcrypt.hash(req.body.clave, 10)
        });
        await usuarios.save();

        res.status(201).json(respuestaSesion(usuarios));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//POST login
router.post('/login', async (req, res) => {
    try {
        const usuarios = await Usuario.findOne({ correo: (req.body.correo || '').toLowerCase().trim() });
        const clave = req.body.clave || '';

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
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        const sancion = await sancionVigente(usuarios._id);
        if (sancion) {
            const hasta = sancion.tipo === 'suspension' ? ` hasta el ${sancion.hasta.toLocaleDateString('es')}` : '';
            return res.status(403).json({ message: `Tu cuenta está ${sancion.tipo === 'bloqueo' ? 'bloqueada' : 'suspendida'}${hasta}` });
        }

        res.json(respuestaSesion(usuarios));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//POST recuperar contraseña: genera un enlace y lo envía por correo
router.post('/recuperar', async (req, res) => {
    // Siempre se responde lo mismo, para no revelar qué correos existen
    const respuesta = { message: "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña" };

    try {
        const usuarios = await Usuario.findOne({ correo: (req.body.correo || '').toLowerCase().trim() });
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
});


//POST restablecer contraseña con el token del correo
router.post('/restablecer', async (req, res) => {
    try {
        if (!claveValida(req.body.clave)) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }

        const hash = crypto.createHash('sha256').update(req.body.token || '').digest('hex');
        const usuarios = await Usuario.findOne({ tokenRecuperacion: hash, tokenExpira: { $gt: new Date() } });

        if (!usuarios) {
            return res.status(400).json({ message: "El enlace no es válido o ya venció" });
        }

        usuarios.clave = await bcrypt.hash(req.body.clave, 10);
        usuarios.tokenRecuperacion = undefined;
        usuarios.tokenExpira = undefined;
        await usuarios.save();

        res.json({ message: "Contraseña actualizada" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET mi perfil
router.get('/perfil', requiereSesion, (req, res) => {
    res.json(req.usuario);
});


//PUT editar mi perfil
router.put('/perfil', requiereSesion, async (req, res) => {
    try {
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
        const mensaje = error.message.includes('duplicate') ? "Ese correo ya está en uso" : error.message;
        res.status(400).json({ message: mensaje });
    }
});


//PUT cambiar mi contraseña
router.put('/perfil/clave', requiereSesion, async (req, res) => {
    try {
        const usuarios = await Usuario.findById(req.usuario._id);

        if (!(await bcrypt.compare(req.body.actual || '', usuarios.clave))) {
            return res.status(400).json({ message: "La contraseña actual no es correcta" });
        }
        if (!claveValida(req.body.nueva)) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }

        usuarios.clave = await bcrypt.hash(req.body.nueva, 10);
        await usuarios.save();

        res.json({ message: "Contraseña actualizada" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//DELETE eliminar mi cuenta (pide la contraseña para confirmar)
router.delete('/perfil', requiereSesion, async (req, res) => {
    try {
        const usuarios = await Usuario.findById(req.usuario._id);

        if (!(await bcrypt.compare(req.body.clave || '', usuarios.clave))) {
            return res.status(400).json({ message: "La contraseña no es correcta" });
        }

        const guias = await Guia.find({ autor: usuarios._id }).select('_id');
        await Comentario.deleteMany({ $or: [{ autor: usuarios._id }, { guia: { $in: guias } }] });
        await Guia.deleteMany({ autor: usuarios._id });
        await Guia.updateMany({}, { $pull: { votos: usuarios._id } });
        await usuarios.deleteOne();

        res.json({ mensaje: "Cuenta eliminada" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET mis estadísticas (dashboard)
router.get('/perfil/estadisticas', requiereSesion, async (req, res) => {
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
        res.status(500).json({ message: error.message });
    }
});


//GET mis favoritos
router.get('/perfil/favoritos', requiereSesion, async (req, res) => {
    try {
        const usuarios = await Usuario.findById(req.usuario._id).populate({
            path: 'favoritos',
            match: { estado: 'publicada' },
            populate: { path: 'autor', select: 'nombre' }
        });
        res.json(usuarios.favoritos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET todos (solo admin)
router.get('/', requiereSesion, requiereRol('admin'), async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//GET perfil público por ID
router.get('/:id', async (req, res) => {
    try {
        const usuarios = await Usuario.findById(req.params.id).select('nombre biografia rol createdAt');

        if (!usuarios) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//PUT cambiar rol (solo admin)
router.put('/:id/rol', requiereSesion, requiereRol('admin'), async (req, res) => {
    try {
        if (String(req.params.id) === String(req.usuario._id)) {
            return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
        }

        const usuarios = await Usuario.findByIdAndUpdate(
            req.params.id,
            { rol: req.body.rol },
            { new: true, runValidators: true }
        );

        if (!usuarios) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        await registrarAccion(req.usuario, 'Cambio de rol', `${usuarios.nombre} ahora es ${usuarios.rol}`);

        res.json({
            mensaje: "Rol actualizado",
            datos: usuarios
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
