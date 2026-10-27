const express = require('express');
const router = express.Router();
const roles = require('../controllers/RolesController');
const validarId = require('../middlewares/validarId');

router.param('id', validarId);

router.get('/', roles.listar);
router.get('/:id', roles.obtener);
router.post('/', roles.crear);
router.put('/:id', roles.actualizar);
router.delete('/:id', roles.eliminar);

module.exports = router;
