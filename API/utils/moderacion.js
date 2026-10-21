const PalabraProhibida = require('../models/PalabraProhibida');
const AccionModeracion = require('../models/AccionModeracion');

// Devuelve las palabras prohibidas que aparecen en los textos
async function buscarProhibidas(...textos) {
    const palabras = await PalabraProhibida.find();
    const contenido = textos.join(' ').toLowerCase();
    return palabras.map(p => p.palabra).filter(p => contenido.includes(p));
}

// Guarda una acción en el historial de moderación
function registrarAccion(usuario, accion, detalle = '') {
    return AccionModeracion.create({ realizadaPor: usuario._id, accion, detalle });
}

module.exports = { buscarProhibidas, registrarAccion };
