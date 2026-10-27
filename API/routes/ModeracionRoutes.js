const express = require('express');
const router = express.Router();
const moderacion = require('../controllers/ModeracionController');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');

router.use(requiereSesion, requiereRol('moderador', 'admin'));
router.param('id', validarId);

router.get('/resumen', moderacion.resumen);
router.get('/guias', moderacion.listarGuias);
router.put('/guias/:id/estado', moderacion.cambiarEstado);
router.get('/historial', moderacion.historial);

module.exports = router;
