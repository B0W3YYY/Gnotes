// ===== Mi panel: dashboard (SCRUM-178) e historial de contribuciones (SCRUM-25) =====
const sesion = obtenerSesion();
const listaMisGuias = document.getElementById('listaMisGuias');
const buscarMisGuias = document.getElementById('buscarMisGuias');

const ESTADOS = { publicada: 'Publicadas', pendiente: 'En revisión', rechazada: 'Rechazadas' };
const ESTADO_INSIGNIA = { pendiente: 'En revisión', rechazada: 'Rechazada' };

let misGuias = [];
let filtroEstado = 'todas';

if (new URLSearchParams(location.search).get('guia') === 'eliminada') {
    mostrarAlerta('alerta', 'success', 'La guía se eliminó.');
}

function plural(n, uno, varios) {
    return `${n} ${n === 1 ? uno : varios}`;
}

// ----- Resumen en una sola franja -----
function pintarResumen() {
    const pendientes = misGuias.filter(g => g.estado === 'pendiente').length;
    const datos = [
        [misGuias.length, misGuias.length === 1 ? 'guía' : 'guías'],
        [misGuias.reduce((t, g) => t + g.totalVotos, 0), 'votos'],
        [misGuias.reduce((t, g) => t + g.vistas, 0), 'vistas'],
        [pendientes, 'en revisión']
    ];
    document.getElementById('resumen').innerHTML = datos.map(([n, texto]) => `
        <div class="dato-resumen"><span class="cifra">${n}</span><small class="text-muted">${texto}</small></div>`).join('');
}

// ----- Avisos: solo cuando hay guías en revisión o rechazadas -----
function pintarAvisos() {
    const avisos = [];
    const pendientes = misGuias.filter(g => g.estado === 'pendiente');
    const rechazadas = misGuias.filter(g => g.estado === 'rechazada');

    if (pendientes.length) {
        avisos.push(`<div class="aviso-panel aviso-revision">
            ${plural(pendientes.length, 'guía está', 'guías están')} en revisión: un moderador la está revisando.
            <a href="guia.html?id=${pendientes[0]._id}">Ver</a></div>`);
    }
    if (rechazadas.length) {
        avisos.push(`<div class="aviso-panel aviso-rechazo">
            ${plural(rechazadas.length, 'guía fue rechazada', 'guías fueron rechazadas')} por moderación y no se muestra al público.
            <a href="guia.html?id=${rechazadas[0]._id}">Ver</a></div>`);
    }
    document.getElementById('avisos').innerHTML = avisos.join('');
}

// ----- Filtro por estado: solo aparece si hay guías en más de un estado -----
function pintarFiltros() {
    const conteo = {};
    misGuias.forEach(g => conteo[g.estado] = (conteo[g.estado] || 0) + 1);
    const estados = Object.keys(ESTADOS).filter(e => conteo[e]);
    const contenedor = document.getElementById('filtrosEstado');

    if (estados.length < 2) {
        contenedor.innerHTML = '';
        filtroEstado = 'todas';
        return;
    }

    const opciones = [['todas', 'Todas', misGuias.length], ...estados.map(e => [e, ESTADOS[e], conteo[e]])];
    contenedor.innerHTML = opciones.map(([valor, texto, n]) => `
        <button type="button" class="filtro-estado${valor === filtroEstado ? ' activo' : ''}" data-estado="${valor}"
            aria-pressed="${valor === filtroEstado}">${texto} <span>${n}</span></button>`).join('');
}

// ----- Lista de guías con el estandarte de su juego -----
function filaGuia(g) {
    const juego = juegoPorNombre(g.juego);
    const fondo = juego?.estandarte
        ? `style="--estandarte: url('/img/estandartes/${juego.estandarte}'); --posicion: ${juego.posicion || 'center'}"`
        : '';
    const icono = juego
        ? `<img src="../../img/juegos/${juego.icono}" alt="" width="40" height="40">`
        : `<span class="icono-letra" aria-hidden="true">${escaparTexto((g.juego || '?').charAt(0).toUpperCase())}</span>`;
    const insignia = ESTADO_INSIGNIA[g.estado]
        ? `<span class="badge bg-${COLOR_ESTADO[g.estado]}">${ESTADO_INSIGNIA[g.estado]}</span>` : '';

    return `
        <li class="guia-fila${juego?.estandarte ? ' con-estandarte' : ''}" ${fondo}>
            <a class="guia-fila-enlace" href="guia.html?id=${g._id}">
                ${icono}
                <div class="guia-fila-texto">
                    <span class="guia-fila-titulo">${escaparTexto(g.titulo)}</span>
                    <small>${escaparTexto(juego?.nombre || g.juego)} · ${formatearFecha(g.createdAt)}</small>
                </div>
                <div class="guia-fila-datos">
                    ${insignia}
                    <small>${plural(g.totalVotos, 'voto', 'votos')} · ${plural(g.vistas, 'vista', 'vistas')}</small>
                </div>
            </a>
            <div class="dropdown">
                <button type="button" class="boton-mas" data-bs-toggle="dropdown" aria-expanded="false"
                    aria-label="Opciones de ${escaparTexto(g.titulo)}">
                    <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="guia-form.html?id=${g._id}">Editar</a></li>
                    <li><button type="button" class="dropdown-item text-danger" data-eliminar="${g._id}">Eliminar</button></li>
                </ul>
            </div>
        </li>`;
}

function pintarLista() {
    const texto = normalizarTexto(buscarMisGuias.value);
    const visibles = misGuias
        .filter(g => filtroEstado === 'todas' || g.estado === filtroEstado)
        .filter(g => !texto || normalizarTexto(`${g.titulo} ${g.juego}`).includes(texto));

    listaMisGuias.innerHTML = visibles.map(filaGuia).join('');
    document.getElementById('sinCoincidencias').classList.toggle('d-none', visibles.length > 0);
}

// ----- Sin guías: sugiere juegos populares para empezar -----
function pintarVacio() {
    document.getElementById('sugerenciasVacio').innerHTML = JUEGOS.slice(0, 3).map(j => `
        <a class="sugerencia-vacio" href="guia-form.html?juego=${encodeURIComponent(j.nombre)}">
            <img src="../../img/juegos/${j.icono}" alt="" width="44" height="44">
            <span>Crear guía de ${escaparTexto(j.nombre)}</span>
        </a>`).join('');
}

async function cargarPanel() {
    const { ok, datos } = await llamarAPI(`${API.GUIAS}?autor=${sesion.id}&orden=recientes`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }
    misGuias = datos;

    const hayGuias = misGuias.length > 0;
    document.getElementById('panelVacio').classList.toggle('d-none', hayGuias);
    document.getElementById('seccionGuias').classList.toggle('d-none', !hayGuias);
    document.getElementById('resumen').classList.toggle('d-none', !hayGuias);
    document.getElementById('botonCrear').classList.toggle('d-none', !hayGuias);
    document.getElementById('cabeceraPanel').classList.toggle('solo-titulo', !hayGuias);
    buscarMisGuias.classList.toggle('d-none', misGuias.length <= 10);

    if (!hayGuias) {
        document.getElementById('avisos').innerHTML = '';
        pintarVacio();
        return;
    }
    pintarResumen();
    pintarAvisos();
    pintarFiltros();
    pintarLista();
}

// ----- Eventos -----
document.getElementById('filtrosEstado').addEventListener('click', (e) => {
    const boton = e.target.closest('[data-estado]');
    if (!boton) return;
    filtroEstado = boton.dataset.estado;
    pintarFiltros();
    pintarLista();
});

buscarMisGuias.addEventListener('input', pintarLista);

listaMisGuias.addEventListener('click', async (e) => {
    const id = e.target.dataset.eliminar;
    if (!id) return;

    if (await confirmar('Eliminar guía', 'Esta acción no se puede deshacer. ¿Seguro que quieres eliminarla?', 'Eliminar')) {
        const { ok } = await llamarAPI(`${API.GUIAS}/${id}`, 'DELETE');
        mostrarAlerta('alerta', ok ? 'success' : 'danger', ok ? 'La guía se eliminó.' : 'No pudimos eliminar la guía.');
        cargarPanel();
    }
});

cargarPanel();
