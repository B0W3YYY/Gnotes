// ===== Explorar guías: búsqueda (SCRUM-31), orden (SCRUM-32, 33) y filtros (SCRUM-34, 35, 36) =====
const buscador = document.getElementById('buscador');
const filtroJuego = document.getElementById('filtroJuego');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroDificultad = document.getElementById('filtroDificultad');
const orden = document.getElementById('orden');

llenarSelect('filtroCategoria', CATEGORIAS, 'Todas las categorías');
llenarSelect('filtroDificultad', DIFICULTADES, 'Todas las dificultades');

// Mantiene la búsqueda en la URL para poder compartirla o volver atrás
const inicial = new URLSearchParams(location.search);
buscador.value = inicial.get('q') || '';
filtroJuego.value = inicial.get('juego') || '';
filtroCategoria.value = inicial.get('categoria') || '';
filtroDificultad.value = inicial.get('dificultad') || '';
orden.value = inicial.get('orden') || 'recientes';

// ----- Tips esenciales del juego elegido (arriba de las guías) -----
// Los datos vienen de js/tips-juegos-a.js y -b.js (window.TIPS_JUEGOS); si no cargaron, no se muestra nada
function normalizarNombre(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

// Solo se usan direcciones https (nada de javascript:, data:, etc.)
function urlSegura(texto) {
    try {
        const url = new URL(texto);
        return url.protocol === 'https:' ? url.href : null;
    } catch (error) {
        return null;
    }
}

function tipsDelJuego(nombreJuego) {
    const todos = window.TIPS_JUEGOS || {};
    const buscado = normalizarNombre(nombreJuego);
    const clave = Object.keys(todos).find(k => normalizarNombre(k) === buscado);
    return clave && Array.isArray(todos[clave]) ? todos[clave] : [];
}

function tarjetaTip(tip, juego) {
    const imagen = urlSegura(tip.imagen);
    const fuente = urlSegura(tip.fuente);
    const alt = tip.alt || tip.titulo || `Tip de ${juego.nombre}`;
    const estandarte = juego.estandarte ? `../../img/estandartes/${juego.estandarte}` : '';
    return `
        <div class="col-sm-6 col-lg-4">
            <article class="card tarjeta h-100 overflow-hidden tip-esencial">
                ${imagen ? `
                <button type="button" class="tip-imagen" data-ampliar="${escaparAtributo(imagen)}" data-alt="${escaparAtributo(alt)}"
                    data-estandarte="${escaparAtributo(estandarte)}" aria-label="Ampliar imagen: ${escaparAtributo(alt)}">
                    <img src="${escaparAtributo(imagen)}" alt="${escaparAtributo(alt)}" loading="lazy" decoding="async"
                        referrerpolicy="no-referrer" width="640" height="360">
                </button>` : ''}
                <div class="p-3 d-flex flex-column flex-grow-1">
                    <h3 class="h6 mb-2">${tip.nivel === 'pro' ? '<span class="badge text-bg-warning me-1">PRO</span>' : ''}${tip.origen === 'comunidad' ?'<span class="badge text-bg-info me-1">Comunidad</span>' : ''}${escaparTexto(tip.titulo)}</h3>
                    <p class="small text-muted texto-guia mb-2">${escaparTexto(tip.texto)}</p>
                    ${fuente ? `
                    <a class="small mt-auto" href="${escaparAtributo(fuente)}" target="_blank" rel="noopener noreferrer">
                        Fuente<span class="visually-hidden"> (se abre en otra pestaña)</span> ↗
                    </a>` : ''}
                </div>
            </article>
        </div>`;
}

function pintarTipsEsenciales() {
    const seccion = document.getElementById('tipsEsenciales');
    const texto = normalizarNombre(filtroJuego.value);
    const juego = texto && JUEGOS.find(j => normalizarNombre(j.nombre) === texto);
    const tips = juego ? tipsDelJuego(juego.nombre).filter(t => t && t.titulo && t.texto) : [];

    seccion.classList.toggle('d-none', tips.length === 0);
    if (!tips.length) {
        document.getElementById('listaTipsEsenciales').innerHTML = '';
        return;
    }
    document.getElementById('juegoTipsEsenciales').textContent = juego.nombre;
    document.getElementById('listaTipsEsenciales').innerHTML = tips.map(t => tarjetaTip(t, juego)).join('');
}

// Si una imagen externa no carga: primero se usa el estandarte del juego, y si tampoco hay, se quita
document.getElementById('listaTipsEsenciales').addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG') return;
    const boton = img.closest('.tip-imagen');
    const estandarte = boton?.dataset.estandarte;
    if (estandarte && !img.dataset.respaldo) {
        img.dataset.respaldo = 'si';
        img.removeAttribute('referrerpolicy');
        img.src = estandarte;
        boton.dataset.ampliar = estandarte;
    } else {
        boton?.remove();
    }
}, true);   // los errores de <img> no burbujean: se escuchan en la fase de captura

activarVisor(document.getElementById('listaTipsEsenciales'));

async function cargarGuias() {
    const parametros = new URLSearchParams();
    if (buscador.value.trim()) parametros.set('q', buscador.value.trim());
    if (filtroJuego.value.trim()) parametros.set('juego', filtroJuego.value.trim());
    if (filtroCategoria.value) parametros.set('categoria', filtroCategoria.value);
    if (filtroDificultad.value) parametros.set('dificultad', filtroDificultad.value);
    parametros.set('orden', orden.value);

    history.replaceState(null, '', `?${parametros}`);
    pintarTipsEsenciales();
    mostrarCargando('listaTips');

    try {
        const { ok, datos } = await llamarAPI(`${API.GUIAS}?${parametros}`);
        if (!ok) throw new Error();

        // Sin nada escrito no es "sin resultados": se muestran los juegos para elegir
        const sinFiltros = !buscador.value.trim() && !filtroJuego.value.trim() && !filtroCategoria.value && !filtroDificultad.value;
        const vacio = datos.length === 0 && !sinFiltros;
        const lista = document.getElementById('listaTips');
        lista.innerHTML = datos.map(g => tarjetaGuia(g)).join('');
        // Una fila vacía de Bootstrap tiene margen negativo y pegaría el panel a los filtros
        lista.classList.toggle('d-none', datos.length === 0);
        document.getElementById('elegirJuego').classList.toggle('d-none', !sinFiltros);
        document.getElementById('sinResultados').classList.toggle('d-none', !vacio);
        document.getElementById('botonCrear').classList.toggle('d-none', vacio);
        document.getElementById('cabeceraTips').classList.toggle('solo-titulo', vacio);
        document.getElementById('totalResultados').textContent = sinFiltros && !datos.length ? '' :
            `${datos.length} ${datos.length === 1 ? 'guía encontrada' : 'guías encontradas'}`;
    } catch (error) {
        document.getElementById('listaTips').innerHTML = '';
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    }
}

// Espera a que deje de escribir antes de buscar
let espera;
function buscarConEspera() {
    clearTimeout(espera);
    espera = setTimeout(cargarGuias, 350);
}

buscador.addEventListener('input', buscarConEspera);
filtroJuego.addEventListener('input', buscarConEspera);
[filtroCategoria, filtroDificultad, orden].forEach(el => el.addEventListener('change', cargarGuias));

document.getElementById('limpiarFiltros').addEventListener('click', () => {
    buscador.value = '';
    filtroJuego.value = '';
    filtroCategoria.value = '';
    filtroDificultad.value = '';
    orden.value = 'recientes';
    cargarGuias();
});

cargarGuias();

// Elegir un juego filtra Explorar por ese juego (sin recargar la página)
function elegirJuego(e) {
    const enlace = e.target.closest('a[data-juego]');
    if (!enlace) return;
    e.preventDefault();
    buscador.value = '';
    filtroJuego.value = enlace.dataset.juego;
    cargarGuias();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enlaceJuegoExplorar(j) {
    return `?juego=${encodeURIComponent(j.nombre)}`;
}

// Sin búsqueda: todos los juegos, con su estandarte, como en el menú del inicio
document.getElementById('listaElegirJuego').innerHTML = JUEGOS.map(j => `
    <li>
        <a class="juego${j.estandarte ? ' con-estandarte' : ''}" href="${enlaceJuegoExplorar(j)}" data-juego="${escaparAtributo(j.nombre)}"
            ${j.estandarte ? `style="--estandarte: url('../../img/estandartes/${j.estandarte}'); --posicion: ${j.posicion || 'center'}"` : ''}>
            <img src="../../img/juegos/${j.icono}" alt="" width="36" height="36" loading="lazy">
            <span>${escaparTexto(j.nombre)}</span>
        </a>
    </li>`).join('');

// Sin resultados: lleva a las guías de los juegos más jugados
document.getElementById('sugerenciasVacio').innerHTML = JUEGOS.slice(0, 3).map(j => `
    <a class="sugerencia-vacio" href="${enlaceJuegoExplorar(j)}" data-juego="${escaparAtributo(j.nombre)}">
        <img src="../../img/juegos/${j.icono}" alt="" width="44" height="44">
        <span>Guías de ${escaparTexto(j.nombre)}</span>
    </a>`).join('');

document.getElementById('listaElegirJuego').addEventListener('click', elegirJuego);
document.getElementById('sugerenciasVacio').addEventListener('click', elegirJuego);
