// ===== Datos y funciones compartidas de las guías =====
const CATEGORIAS = ['Acción', 'Aventura', 'Estrategia', 'Competitivo', 'Supervivencia', 'Exploración', 'Jefes', 'Otros'];
const DIFICULTADES = ['Fácil', 'Media', 'Difícil'];
const COLOR_DIFICULTAD = { 'Fácil': 'success', 'Media': 'warning', 'Difícil': 'danger' };

// Evita que el texto que escriben los usuarios se interprete como HTML
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

function llenarSelect(idSelect, opciones, textoVacio) {
    const select = document.getElementById(idSelect);
    select.innerHTML = (textoVacio ? `<option value="">${textoVacio}</option>` : '') +
        opciones.map(o => `<option value="${o}">${o}</option>`).join('');
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Tarjeta de una guía (rutaBase: ruta hacia la carpeta pages/usuario/)
function tarjetaGuia(guia, rutaBase = '') {
    return `
        <div class="col-md-6 col-lg-4">
            <a href="${rutaBase}guia.html?id=${guia._id}" class="card tarjeta h-100 p-3 text-decoration-none text-reset">
                <small class="text-muted">${escaparHTML(guia.juego)}</small>
                <h2 class="h5 mt-1">${escaparHTML(guia.titulo)}</h2>
                <p class="small text-muted mb-2">Por ${escaparHTML(guia.autor?.nombre || 'Anónimo')} · ${formatearFecha(guia.createdAt)}</p>
                <div class="mt-auto">
                    <span class="badge bg-secondary">${guia.categoria}</span>
                    <span class="badge bg-${COLOR_DIFICULTAD[guia.dificultad]}">${guia.dificultad}</span>
                </div>
            </a>
        </div>`;
}

const MENSAJE_FALLA = 'Estamos teniendo problemas en este momento. Inténtalo de nuevo en unos minutos.';
