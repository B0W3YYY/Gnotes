// ===== Nombres de juegos: lista de fábrica del frontend + juegos aprobados en la base =====
const path = require('path');

// Letras (con tildes), números, espacios y signos comunes en títulos: Baldur's Gate 3, PUBG: BATTLEGROUNDS, Half-Life 2
const PATRON_NOMBRE_JUEGO = /^[\p{L}\p{N}][\p{L}\p{N} :'’&!.,+\-()]*$/u;

// "Elden Ring!" -> "eldenring"
function normalizarNombreJuego(nombre) {
    return String(nombre || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

// La lista de fábrica vive en el frontend; si no se puede leer, se sigue solo con la base
let JUEGOS_FABRICA = [];
try {
    JUEGOS_FABRICA = require(path.join(__dirname, '..', '..', 'Frontend', 'public', 'js', 'juegos.js')).JUEGOS.map(j => j.nombre);
} catch (error) {
    console.warn('No se pudo leer la lista de juegos del frontend; solo se usarán los aprobados');
}

// Busca el nombre "oficial" de un juego ya existente (fábrica o aprobado), o null si es nuevo
async function juegoExistente(nombre) {
    const buscado = normalizarNombreJuego(nombre);
    if (!buscado) return null;
    const deFabrica = JUEGOS_FABRICA.find(n => normalizarNombreJuego(n) === buscado);
    if (deFabrica) return deFabrica;
    const Juego = require('../models/Juego');
    const aprobado = await Juego.findOne({ nombreNormalizado: buscado });
    return aprobado ? aprobado.nombre : null;
}

// Revisa el nombre de un juego nuevo. Devuelve el mensaje de error o ''
function errorNombreJuego(nombre) {
    const texto = String(nombre || '').trim();
    if (texto.length < 2 || texto.length > 60) return 'El nombre del juego debe tener entre 2 y 60 caracteres';
    if (!PATRON_NOMBRE_JUEGO.test(texto)) return 'El nombre del juego solo puede tener letras, números, espacios y signos como : \' - & ! . , + ( )';
    if (normalizarNombreJuego(texto).length < 2) return 'El nombre del juego debe tener al menos 2 letras o números';
    return '';
}

module.exports = { PATRON_NOMBRE_JUEGO, normalizarNombreJuego, juegoExistente, errorNombreJuego, JUEGOS_FABRICA };
