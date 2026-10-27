const express = require('express');
const router = express.Router();
const reportes = require('../controllers/ReporteController');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');

const moderacion = [requiereSesion, requiereRol('moderador', 'admin')];

router.param('id', validarId);

router.post('/', requiereSesion, reportes.crear);
router.get('/', moderacion, reportes.listar);
router.get('/:id', moderacion, reportes.obtener);
router.put('/:id', moderacion, reportes.atender);
router.delete('/:id', moderacion, reportes.eliminar);

module.exports = router;
