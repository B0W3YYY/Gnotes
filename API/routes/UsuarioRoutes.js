const express = require('express');
const router = express.Router();
const usuarios = require('../controllers/UsuarioController');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');

router.param('id', validarId);

// Cuenta y sesión
router.post('/', usuarios.registrar);
router.post('/login', usuarios.iniciarSesion);
router.post('/recuperar', usuarios.recuperarClave);
router.post('/restablecer', usuarios.restablecerClave);

// Mi perfil
router.get('/perfil', requiereSesion, usuarios.verPerfil);
router.put('/perfil', requiereSesion, usuarios.editarPerfil);
router.put('/perfil/clave', requiereSesion, usuarios.cambiarClave);
router.delete('/perfil', requiereSesion, usuarios.eliminarPerfil);
router.get('/perfil/estadisticas', requiereSesion, usuarios.verEstadisticas);
router.get('/perfil/favoritos', requiereSesion, usuarios.verFavoritos);

// Administración y perfiles públicos
router.get('/', requiereSesion, requiereRol('admin'), usuarios.listar);
router.get('/:id', usuarios.obtener);
router.put('/:id/rol', requiereSesion, requiereRol('admin'), usuarios.cambiarRol);
router.delete('/:id', requiereSesion, requiereRol('admin'), usuarios.eliminar);

module.exports = router;
