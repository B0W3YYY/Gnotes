const express = require('express');
const router = express.Router();
const guias = require('../controllers/GuiaController');
const { requiereSesion, sesionOpcional, sinSancion } = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');

router.param('id', validarId);

router.get('/opciones', guias.opciones);
router.get('/', sesionOpcional, guias.listar);
router.get('/:id', sesionOpcional, guias.obtener);
router.post('/', requiereSesion, sinSancion, guias.crear);
router.put('/:id', requiereSesion, sinSancion, guias.actualizar);
router.delete('/:id', requiereSesion, guias.eliminar);

// Acciones sobre una guía
router.post('/:id/voto', requiereSesion, guias.votar);
router.post('/:id/favorito', requiereSesion, guias.marcarFavorito);
router.post('/:id/compartir', guias.compartir);

module.exports = router;
