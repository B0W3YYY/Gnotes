const express = require('express');
const router = express.Router();
const admin = require('../controllers/AdminController');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');

router.use(requiereSesion, requiereRol('admin'));
router.param('id', validarId);

router.get('/estadisticas', admin.estadisticas);

// Palabras prohibidas
router.get('/palabras', admin.listarPalabras);
router.post('/palabras', admin.agregarPalabra);
router.delete('/palabras/:id', admin.quitarPalabra);

// Sanciones
router.get('/sanciones', admin.listarSanciones);
router.get('/sanciones/:id', admin.obtenerSancion);
router.post('/sanciones', admin.aplicarSancion);
router.put('/sanciones/:id/levantar', admin.levantarSancion);

module.exports = router;
