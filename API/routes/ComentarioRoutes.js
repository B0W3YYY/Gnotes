const express = require('express');
const router = express.Router();
const comentarios = require('../controllers/ComentarioController');
const { requiereSesion, sinSancion } = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');

router.param('id', validarId);
router.param('guiaId', validarId);

router.get('/guia/:guiaId', comentarios.listarDeGuia);
router.post('/guia/:guiaId', requiereSesion, sinSancion, comentarios.crear);
router.get('/:id', comentarios.obtener);
router.put('/:id', requiereSesion, sinSancion, comentarios.actualizar);
router.delete('/:id', requiereSesion, comentarios.eliminar);

module.exports = router;
