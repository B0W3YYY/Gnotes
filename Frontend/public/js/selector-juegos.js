// ===== Elegir juego: con "Buscar Tips" (todos) o con una tarjeta de categoría =====
// Se pueden combinar varias categorías: solo quedan los juegos que tienen TODAS las marcadas
const modalJuegos = new bootstrap.Modal(document.getElementById('modalJuegos'));
const buscarJuego = document.getElementById('buscarJuego');
const listaJuegos = document.getElementById('listaJuegos');
const tituloJuegos = document.getElementById('tituloJuegos');
const botonCategorias = document.getElementById('botonCategorias');
const panelCategorias = document.getElementById('panelCategorias');
const gridCategorias = document.getElementById('gridCategorias');
const chipsCategorias = document.getElementById('chipsCategorias');
const contadorFiltro = document.getElementById('contadorFiltro');

// Mismo orden que las tarjetas del inicio
const CATEGORIAS_JUEGOS = [...document.querySelectorAll('.foto-juego span')].map(s => s.textContent.trim());

const seleccionadas = new Set();

// A dónde lleva cada juego: con sesión a Explorar filtrado; sin sesión, primero a iniciar sesión
function enlaceJuego(nombre) {
    const explorar = '/pages/usuario/tips.html' + (nombre ? `?juego=${encodeURIComponent(nombre)}` : '');
    return obtenerSesion() ? explorar : `pages/login.html?volver=${encodeURIComponent(explorar)}`;
}

// Quita tildes y mayúsculas para que "pubg" encuentre "PUBG: BATTLEGROUNDS"
function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

// Juegos que cumplen todas las categorías dadas y el texto buscado
// También encuentra por abreviatura ("gta", "cs2", "lol"); si coincide la abreviatura
// exacta o el comienzo del nombre, ese juego sube al principio de la lista
function filtrar(categorias, texto) {
    const buscado = normalizar(texto);
    const prioridad = j => {
        if (!buscado) return 0;
        if (abreviaturasJuego(j).includes(buscado)) return 3;
        if (normalizar(j.nombre).startsWith(buscado)) return 2;
        return 1;
    };
    return JUEGOS
        .filter(j =>
            categorias.every(c => j.categorias.includes(c)) &&
            (normalizar(j.nombre).includes(buscado) || abreviaturasJuego(j).some(a => a.startsWith(buscado))))
        .map((j, i) => ({ j, i, p: prioridad(j) }))
        .sort((x, y) => (y.p - x.p) || (x.i - y.i))
        .map(r => r.j);
}

function mostrarJuegos() {
    const encontrados = filtrar([...seleccionadas], buscarJuego.value);

    listaJuegos.innerHTML = encontrados.map(j => `
        <li>
            <a class="juego${j.estandarte ? ' con-estandarte' : ''}" href="${enlaceJuego(j.nombre)}"
                ${j.estandarte ? `style="--estandarte: url('/img/estandartes/${j.estandarte}'); --posicion: ${j.posicion || 'center'}"` : ''}>
                <img src="img/juegos/${j.icono}" alt="" width="36" height="36" loading="lazy">
                <span>${escaparTexto(j.nombre)}</span>
            </a>
        </li>`).join('');

    const sinJuegos = document.getElementById('sinJuegos');
    sinJuegos.textContent = buscarJuego.value.trim()
        ? 'No encontramos ese juego con los filtros elegidos.'
        : 'No hay juegos que tengan todas esas categorías.';
    sinJuegos.classList.toggle('d-none', encontrados.length > 0);

    actualizarCategorias();
}

// Marca, desactiva y cuenta cada categoría según lo que ya está elegido
function actualizarCategorias() {
    const elegidas = [...seleccionadas];

    gridCategorias.querySelectorAll('input').forEach(casilla => {
        const categoria = casilla.value;
        const marcada = seleccionadas.has(categoria);
        // Cuántos juegos quedarían si también se marca esta categoría
        const quedarian = filtrar(marcada ? elegidas : [...elegidas, categoria], buscarJuego.value).length;

        casilla.checked = marcada;
        // Las marcadas nunca se desactivan, para poder quitarlas
        casilla.disabled = !marcada && quedarian === 0;
        casilla.closest('.opcion-categoria').classList.toggle('sin-resultados', casilla.disabled);
        casilla.closest('.opcion-categoria').querySelector('.cantidad').textContent = quedarian;
    });

    // Etiquetas con las categorías elegidas
    chipsCategorias.innerHTML = elegidas.map(c => `
        <span class="chip-categoria">
            ${escaparTexto(c)}
            <button type="button" data-quitar="${escaparTexto(c)}" aria-label="Quitar ${escaparTexto(c)}">&times;</button>
        </span>`).join('');

    contadorFiltro.textContent = elegidas.length;
    contadorFiltro.classList.toggle('d-none', elegidas.length === 0);

    tituloJuegos.textContent = elegidas.length
        ? `Juegos de ${elegidas.join(' + ')}`
        : '¿De qué juego buscas tips?';
}

function crearCasillas() {
    gridCategorias.innerHTML = CATEGORIAS_JUEGOS.map((c, i) => `
        <label class="opcion-categoria" for="cat${i}">
            <input type="checkbox" class="form-check-input" id="cat${i}" value="${escaparTexto(c)}">
            <span class="nombre">${escaparTexto(c)}</span>
            <span class="cantidad"></span>
        </label>`).join('');
}

function abrirPanel(abrir) {
    panelCategorias.classList.toggle('abierto', abrir);
    panelCategorias.setAttribute('aria-hidden', !abrir);
    botonCategorias.setAttribute('aria-expanded', abrir);
    botonCategorias.setAttribute('aria-label', abrir ? 'Ocultar categorías' : 'Filtrar por categorías');
    // Mientras está cerrado, las casillas no se alcanzan con Tab
    gridCategorias.querySelectorAll('input').forEach(c => c.tabIndex = abrir ? 0 : -1);
    document.getElementById('limpiarCategorias').tabIndex = abrir ? 0 : -1;
}

// categoria = null: todos los juegos ("Buscar Tips")
function abrirSelector(categoria) {
    seleccionadas.clear();
    if (categoria) seleccionadas.add(categoria);
    buscarJuego.value = '';
    abrirPanel(false);
    mostrarJuegos();
    listaJuegos.closest('.modal-body').scrollTop = 0;
    modalJuegos.show();
}

// ----- Eventos -----
document.getElementById('botonTips').addEventListener('click', (e) => {
    e.preventDefault();
    abrirSelector(null);
});

// Tarjetas de categoría del inicio: abren con esa categoría ya marcada
document.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('.foto-juego');
    if (!tarjeta) return;
    e.preventDefault();
    abrirSelector(tarjeta.querySelector('span').textContent.trim());
});

botonCategorias.addEventListener('click', () => abrirPanel(!panelCategorias.classList.contains('abierto')));

gridCategorias.addEventListener('change', (e) => {
    if (e.target.checked) seleccionadas.add(e.target.value);
    else seleccionadas.delete(e.target.value);
    mostrarJuegos();
});

chipsCategorias.addEventListener('click', (e) => {
    const quitar = e.target.dataset.quitar;
    if (!quitar) return;
    seleccionadas.delete(quitar);
    mostrarJuegos();
});

document.getElementById('limpiarCategorias').addEventListener('click', () => {
    seleccionadas.clear();
    mostrarJuegos();
});

document.getElementById('modalJuegos').addEventListener('shown.bs.modal', () => buscarJuego.focus());

buscarJuego.addEventListener('input', mostrarJuegos);

// Enter abre el primer resultado
buscarJuego.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const primero = listaJuegos.querySelector('a');
        if (primero) window.location.href = primero.href;
    }
});

document.getElementById('verTodos').href = enlaceJuego('');
crearCasillas();
abrirPanel(false);
