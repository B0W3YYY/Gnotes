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

async function cargarGuias() {
    const parametros = new URLSearchParams();
    if (buscador.value.trim()) parametros.set('q', buscador.value.trim());
    if (filtroJuego.value.trim()) parametros.set('juego', filtroJuego.value.trim());
    if (filtroCategoria.value) parametros.set('categoria', filtroCategoria.value);
    if (filtroDificultad.value) parametros.set('dificultad', filtroDificultad.value);
    parametros.set('orden', orden.value);

    history.replaceState(null, '', `?${parametros}`);
    mostrarCargando('listaTips');

    try {
        const { ok, datos } = await llamarAPI(`${API.GUIAS}?${parametros}`);
        if (!ok) throw new Error();

        document.getElementById('listaTips').innerHTML = datos.map(g => tarjetaGuia(g)).join('');
        document.getElementById('sinResultados').classList.toggle('d-none', datos.length > 0);
        document.getElementById('totalResultados').textContent =
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
