// ===== Datos y funciones compartidas de las guías =====
// Categorías de las guías, con palabras clave para encontrarlas aunque se escriban distinto
const CATEGORIAS_GUIA = [
    { nombre: "Jefes", claves: ["jefe", "jefes", "jefe final", "final boss", "boss final", "boss", "bosses", "mini jefe", "minijefe", "miniboss", "enemigo", "pelea"] },
    { nombre: "Misiones", claves: ["mision", "misiones", "quest", "quests", "encargo", "tarea", "objetivo", "campaña", "historia principal", "secundaria"] },
    { nombre: "Principiantes", claves: ["principiante", "novato", "empezar", "inicio", "comienzo", "basico", "tutorial", "primeros pasos", "beginner", "noob", "nuevo"] },
    { nombre: "Builds", claves: ["build", "builds", "equipamiento", "equipo", "set", "loadout", "clase", "atributos", "stats", "estadisticas", "armadura"] },
    { nombre: "Armas", claves: ["arma", "armas", "weapon", "espada", "pistola", "rifle", "escopeta", "arco", "mejora de arma"] },
    { nombre: "Personajes", claves: ["personaje", "personajes", "heroe", "heroes", "agente", "leyenda", "campeon", "campeones", "champion", "main", "operador"] },
    { nombre: "Mapas y ubicaciones", claves: ["mapa", "mapas", "ubicacion", "ubicaciones", "zona", "lugar", "donde", "localizacion", "region", "location"] },
    { nombre: "Coleccionables", claves: ["coleccionable", "coleccionables", "objetos ocultos", "collectible", "cofres", "tesoro", "tesoros", "reliquias"] },
    { nombre: "Logros y trofeos", claves: ["logro", "logros", "trofeo", "trofeos", "achievement", "platino", "100%", "completar todo", "completo"] },
    { nombre: "Secretos", claves: ["secreto", "secretos", "easter egg", "oculto", "escondido", "curiosidad", "misterio"] },
    { nombre: "Trucos y atajos", claves: ["truco", "trucos", "atajo", "atajos", "tip", "tips", "consejo", "consejos", "glitch", "bug", "exploit", "hack"] },
    { nombre: "Farmeo y recursos", claves: ["farmeo", "farmear", "farm", "grindeo", "grind", "recursos", "materiales", "experiencia", "xp", "subir de nivel", "nivelar", "loot", "botin"] },
    { nombre: "Economía", claves: ["dinero", "oro", "monedas", "economia", "comercio", "vender", "comprar", "ganar dinero", "creditos", "riqueza"] },
    { nombre: "Crafteo", claves: ["crafteo", "craftear", "crafting", "fabricar", "fabricacion", "crear objetos", "recetas", "forja", "alquimia"] },
    { nombre: "Construcción", claves: ["construccion", "construir", "base", "bases", "casa", "edificio", "fortaleza", "diseño", "build base"] },
    { nombre: "Supervivencia", claves: ["supervivencia", "sobrevivir", "survival", "hambre", "refugio", "primera noche", "aguantar"] },
    { nombre: "Exploración", claves: ["exploracion", "explorar", "descubrir", "viaje", "recorrer", "mundo abierto"] },
    { nombre: "Estrategia", claves: ["estrategia", "estrategias", "tactica", "tacticas", "plan", "macro", "micro", "composicion"] },
    { nombre: "Competitivo", claves: ["competitivo", "ranked", "clasificatoria", "rango", "subir rango", "esports", "torneo", "meta", "elo"] },
    { nombre: "PvP", claves: ["pvp", "jugador contra jugador", "duelo", "duelos", "combate contra jugadores", "arena"] },
    { nombre: "Cooperativo", claves: ["cooperativo", "coop", "co-op", "en equipo", "con amigos", "escuadron", "squad", "grupo", "multijugador"] },
    { nombre: "Raids y mazmorras", claves: ["raid", "raids", "mazmorra", "mazmorras", "dungeon", "dungeons", "incursion", "calabozo"] },
    { nombre: "Speedrun", claves: ["speedrun", "speedrunning", "rapido", "record", "tiempo", "skip", "any%"] },
    { nombre: "Puzzles", claves: ["puzzle", "puzzles", "acertijo", "acertijos", "rompecabezas", "enigma", "solucion"] },
    { nombre: "Historia y lore", claves: ["historia", "lore", "trama", "argumento", "narrativa", "explicacion", "mitologia"] },
    { nombre: "Finales", claves: ["final", "finales", "ending", "endings", "final secreto", "final verdadero", "final alternativo"] },
    { nombre: "Configuración y rendimiento", claves: ["configuracion", "ajustes", "settings", "rendimiento", "fps", "graficos", "controles", "sensibilidad", "optimizar", "lag"] },
    { nombre: "Mods", claves: ["mod", "mods", "modificacion", "modding", "addon", "complemento"] },
    { nombre: "Acción", claves: ["accion", "combate", "pelear", "combos", "esquivar", "parry"] },
    { nombre: "Aventura", claves: ["aventura", "recorrido", "paso a paso", "walkthrough", "guia completa"] },
    { nombre: "Otros", claves: ["otro", "otros", "varios", "general", "miscelaneo"] }
];
const CATEGORIAS = CATEGORIAS_GUIA.map(c => c.nombre);

// ----- Búsqueda de categorías tolerante a errores -----
// Quita tildes y signos: "Jefe Final!" -> "jefe final"
function normalizarTexto(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9%]+/g, ' ').trim();
}

// Cuántas letras hay que cambiar para pasar de una palabra a otra
function distanciaEntre(a, b) {
    const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let anterior = fila[0];
        fila[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const guardado = fila[j];
            fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
            anterior = guardado;
        }
    }
    return fila[b.length];
}

// Qué tan bien se parece una palabra buscada a una palabra de la categoría (0 = nada)
function parecidoPalabra(buscada, palabra) {
    if (buscada === palabra) return 3;
    if (buscada.length >= 2 && palabra.startsWith(buscada)) return 2.5;      // "jef" -> "jefe"
    if (palabra.length >= 3 && buscada.startsWith(palabra)) return 2;       // "jefecito" -> "jefe"
    const tolerancia = buscada.length >= 7 ? 2 : buscada.length >= 4 ? 1 : 0;
    if (tolerancia && distanciaEntre(buscada, palabra) <= tolerancia) return 1.5;  // "jeffe"
    // Palabras cortas: un error solo si empiezan con la misma letra ("jfe" -> "jefe")
    if (buscada.length === 3 && buscada[0] === palabra[0] && palabra.length <= 5 &&
        distanciaEntre(buscada, palabra) <= 1) return 1;
    return 0;
}

const PALABRAS_CATEGORIA = CATEGORIAS_GUIA.map(c => ({
    nombre: c.nombre,
    frases: [c.nombre, ...c.claves].map(normalizarTexto),
    palabras: [...new Set([c.nombre, ...c.claves].map(normalizarTexto).join(' ').split(' '))]
}));

// Devuelve las categorías que se parecen al texto, de la más parecida a la menos
// "jefe final", "final boss" o "boss final" encuentran "Jefes" sin importar el orden
function buscarCategorias(texto) {
    const buscado = normalizarTexto(texto);
    if (!buscado) return CATEGORIAS.map(nombre => ({ nombre, puntaje: 0, completa: true }));
    const palabras = buscado.split(' ');

    return PALABRAS_CATEGORIA.map(c => {
        let puntaje = 0, coinciden = 0;
        for (const buscada of palabras) {
            const mejor = Math.max(...c.palabras.map(p => parecidoPalabra(buscada, p)));
            if (mejor > 0) { coinciden++; puntaje += mejor; }
        }
        // Premio si la frase completa aparece tal cual en alguna palabra clave
        if (c.frases.some(f => f.includes(buscado))) puntaje += 3;
        // Palabras escritas separadas que van juntas: "speed run" -> "speedrun"
        const junto = palabras.join('');
        if (palabras.length > 1 && junto.length >= 4 && c.palabras.some(p => p.startsWith(junto))) {
            coinciden = palabras.length;
            puntaje += 3;
        }
        return { nombre: c.nombre, puntaje, completa: coinciden === palabras.length, coinciden };
    })
        .filter(c => c.coinciden > 0)
        .sort((a, b) => (b.completa - a.completa) || (b.puntaje - a.puntaje));
}
const DIFICULTADES = ['Fácil', 'Media', 'Difícil'];
const COLOR_DIFICULTAD = { 'Fácil': 'success', 'Media': 'warning', 'Difícil': 'danger' };
const COLOR_ESTADO = { publicada: 'success', pendiente: 'warning', rechazada: 'danger' };

function llenarSelect(idSelect, opciones, textoVacio) {
    const select = document.getElementById(idSelect);
    select.innerHTML = (textoVacio ? `<option value="">${textoVacio}</option>` : '') +
        opciones.map(o => `<option value="${o}">${o}</option>`).join('');
}

function formatearFecha(fecha) {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Tarjeta de una guía (rutaUsuario: ruta hacia la carpeta pages/usuario/)
function tarjetaGuia(guia, rutaUsuario = '') {
    return `
        <div class="col-md-6 col-lg-4">
            <a href="${rutaUsuario}guia.html?id=${guia._id}" class="card tarjeta h-100 p-3 text-decoration-none text-reset">
                <small class="text-muted">${escaparTexto(guia.juego)}</small>
                <h2 class="h5 mt-1">${escaparTexto(guia.titulo)}</h2>
                <p class="small text-muted mb-2">Por ${escaparTexto(guia.autor?.nombre || 'Usuario eliminado')} · ${formatearFecha(guia.createdAt)}</p>
                <div class="mt-auto d-flex flex-wrap gap-1 align-items-center">
                    <span class="badge bg-secondary">${guia.categoria}</span>
                    <span class="badge bg-${COLOR_DIFICULTAD[guia.dificultad]}">${guia.dificultad}</span>
                    <span class="ms-auto small text-muted">${guia.totalVotos ?? 0} votos · ${guia.vistas ?? 0} vistas</span>
                </div>
            </a>
        </div>`;
}

function mostrarCargando(idContenedor) {
    document.getElementById(idContenedor).innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-secondary" role="status"><span class="visually-hidden">Cargando...</span></div>
        </div>`;
}
