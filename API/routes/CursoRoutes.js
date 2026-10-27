const express = require('express');
const router = express.Router();
const cursos = require('../controllers/CursoController');
const validarId = require('../middlewares/validarId');

router.param('id', validarId);

router.get('/', cursos.listar);
router.get('/:id', cursos.obtener);
router.post('/', cursos.crear);
router.put('/:id', cursos.actualizar);
router.delete('/:id', cursos.eliminar);

module.exports = router;
