const express = require('express');
const router = express.Router();
const juegos = require('../controllers/JuegoController');

// Juegos aprobados desde la web (público)
router.get('/', juegos.listar);

module.exports = router;
