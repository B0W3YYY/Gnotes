// Emojis que no se permiten en lo que escriben los usuarios, porque se usan
// con doble sentido sexual u ofensivo
const EMOJIS_PROHIBIDOS = [
    '🍆', '🍑', '🥒', '🍌', '🌭', '🌮', '🍒', '🍈', '🥥',
    '💦', '👅', '🫦', '👄', '🥵', '🤤', '😏', '🥴', '😈',
    '🔞', '🖕', '👙', '🩲', '🍼', '🤰', '🫃'
];

// Combinaciones que por separado son normales pero juntas no
const COMBINACIONES_PROHIBIDAS = [
    ['👉', '👌'],
    ['👌', '👈']
];

// Quita los modificadores de tono de piel y variación para comparar el emoji base
function limpiarEmojis(texto) {
    return texto.replace(/[\u{1F3FB}-\u{1F3FF}️‍]/gu, '');
}

// Devuelve la lista de emojis prohibidos que aparecen en los textos (vacía si no hay)
function buscarEmojisProhibidos(...textos) {
    const contenido = limpiarEmojis(textos.filter(Boolean).join(' '));
    const encontrados = EMOJIS_PROHIBIDOS.filter(e => contenido.includes(e));

    for (const combinacion of COMBINACIONES_PROHIBIDAS) {
        const juntos = combinacion.join('');
        const separados = new RegExp(combinacion.join('\\s*'), 'u');
        if (contenido.includes(juntos) || separados.test(contenido)) encontrados.push(juntos);
    }
    return [...new Set(encontrados)];
}

// Mensaje para responder cuando se encuentran
function mensajeEmojis(encontrados) {
    return `Tu texto tiene emojis que no están permitidos: ${encontrados.join(' ')}`;
}

module.exports = { EMOJIS_PROHIBIDOS, buscarEmojisProhibidos, mensajeEmojis };
