// ===== Datos y funciones compartidas de las guías =====
const CATEGORIAS = ['Acción', 'Aventura', 'Estrategia', 'Competitivo', 'Supervivencia', 'Exploración', 'Jefes', 'Otros'];
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
