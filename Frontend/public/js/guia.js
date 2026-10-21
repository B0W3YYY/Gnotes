// ===== Ver guía (SCRUM-30), eliminar (SCRUM-29), votos, favoritos, compartir, comentarios y reportes =====
const idGuia = new URLSearchParams(location.search).get('id');
const sesion = obtenerSesion();
let guia = null;

if (new URLSearchParams(location.search).get('aviso') === 'pendiente') {
    mostrarAlerta('alerta', 'warning', 'Tu guía quedó en revisión porque contiene palabras no permitidas. Un moderador la revisará.');
}

// Sin sesión, los botones de participar llevan a iniciar sesión
function exigirSesion() {
    if (sesion) return true;
    const volver = encodeURIComponent(location.pathname + location.search);
    window.location.href = `../login.html?volver=${volver}`;
    return false;
}

function pintarGuia() {
    document.title = `GNotes | ${guia.titulo}`;
    document.getElementById('juego').textContent = guia.juego;
    document.getElementById('titulo').textContent = guia.titulo;
    document.getElementById('autor').textContent = guia.autor?.nombre || 'Usuario eliminado';
    document.getElementById('fecha').textContent = formatearFecha(guia.createdAt);
    document.getElementById('categoria').textContent = guia.categoria;
    const dificultad = document.getElementById('dificultad');
    dificultad.textContent = guia.dificultad;
    dificultad.className = `badge bg-${COLOR_DIFICULTAD[guia.dificultad]}`;
    document.getElementById('contenido').textContent = guia.contenido;
    document.getElementById('vistas').textContent = guia.vistas;

    if (guia.estado !== 'publicada') {
        const estado = document.getElementById('estado');
        estado.textContent = guia.estado === 'pendiente' ? 'En revisión' : 'Rechazada';
        estado.className = `badge bg-${COLOR_ESTADO[guia.estado]}`;
    }

    pintarBotones();
    document.getElementById('accionesAutor').classList.toggle('d-none', !guia.esAutor);
    document.getElementById('botonEliminarModerador').classList.toggle('d-none', guia.esAutor || !guia.puedeModerar);
    document.getElementById('botonReportar').classList.toggle('d-none', guia.esAutor);
    document.getElementById('botonVotar').classList.toggle('d-none', guia.esAutor);
    document.getElementById('editar').href = `guia-form.html?id=${guia._id}`;
    document.getElementById('guia').classList.remove('d-none');
}

function pintarBotones() {
    const votar = document.getElementById('botonVotar');
    votar.innerHTML = `▲ ${guia.yaVoto ? 'Votada' : 'Votar'} <span class="badge bg-light text-dark">${guia.totalVotos}</span>`;
    votar.className = `btn ${guia.yaVoto ? 'btn-primario' : 'btn-outline-secondary'}`;
    votar.setAttribute('aria-pressed', guia.yaVoto);

    const favorito = document.getElementById('botonFavorito');
    favorito.textContent = guia.esFavorito ? '★ En favoritos' : '☆ Guardar';
    favorito.className = `btn ${guia.esFavorito ? 'btn-secundario' : 'btn-outline-secondary'}`;
    favorito.setAttribute('aria-pressed', guia.esFavorito);
}

async function cargarGuia() {
    try {
        const { ok, datos } = await llamarAPI(`${API.GUIAS}/${idGuia}`);
        if (!ok) {
            mostrarAlerta('alerta', 'warning', 'No encontramos esta guía. Puede que la hayan eliminado.');
            return;
        }
        guia = datos;
        pintarGuia();
        cargarComentarios();
    } catch (error) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    }
}

document.getElementById('botonVotar').addEventListener('click', async () => {
    if (!exigirSesion()) return;
    const { ok, datos } = await llamarAPI(`${API.GUIAS}/${idGuia}/voto`, 'POST');
    if (ok) {
        guia.yaVoto = datos.yaVoto;
        guia.totalVotos = datos.totalVotos;
        pintarBotones();
    }
});

document.getElementById('botonFavorito').addEventListener('click', async () => {
    if (!exigirSesion()) return;
    const { ok, datos } = await llamarAPI(`${API.GUIAS}/${idGuia}/favorito`, 'POST');
    if (ok) {
        guia.esFavorito = datos.esFavorito;
        pintarBotones();
    }
});

document.getElementById('botonCompartir').addEventListener('click', async () => {
    const enlace = location.origin + location.pathname + `?id=${idGuia}`;
    try {
        if (navigator.share) {
            await navigator.share({ title: guia.titulo, text: `Mira esta guía de ${guia.juego}`, url: enlace });
        } else {
            await navigator.clipboard.writeText(enlace);
            mostrarAlerta('alerta', 'success', 'Enlace copiado. ¡Ya puedes compartirlo!');
        }
        llamarAPI(`${API.GUIAS}/${idGuia}/compartir`, 'POST');
    } catch (error) {
        // El usuario cerró la ventana de compartir
    }
});

async function eliminarGuia() {
    const seguro = await confirmar('Eliminar guía', 'Esta acción no se puede deshacer. ¿Seguro que quieres eliminarla?', 'Eliminar');
    if (!seguro) return;

    const { ok } = await llamarAPI(`${API.GUIAS}/${idGuia}`, 'DELETE');
    if (ok) window.location.href = 'inicio.html?guia=eliminada';
    else mostrarAlerta('alerta', 'danger', 'No pudimos eliminar la guía.');
}

document.getElementById('botonEliminar').addEventListener('click', eliminarGuia);
document.getElementById('botonEliminarModerador').addEventListener('click', eliminarGuia);

// ----- Reportes -----
let reporteActual = null;
const modalReporte = new bootstrap.Modal(document.getElementById('modalReporte'));

function abrirReporte(tipo, objetivo) {
    if (!exigirSesion()) return;
    reporteActual = { tipo, objetivo };
    document.getElementById('formReporte').reset();
    document.getElementById('formReporte').classList.remove('was-validated');
    document.getElementById('alertaReporte').innerHTML = '';
    modalReporte.show();
}

document.getElementById('botonReportar').addEventListener('click', () => abrirReporte('guia', idGuia));

document.getElementById('formReporte').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const { ok, datos } = await llamarAPI(API.REPORTES, 'POST', {
        ...reporteActual,
        motivo: document.getElementById('motivo').value
    });

    if (ok) {
        modalReporte.hide();
        mostrarAlerta('alerta', 'success', 'Gracias. Un moderador revisará tu reporte.');
    } else {
        mostrarAlerta('alertaReporte', 'danger', datos?.message || MENSAJE_FALLA);
    }
});

// ----- Comentarios -----
async function cargarComentarios() {
    const { ok, datos } = await llamarAPI(`${API.COMENTARIOS}/guia/${idGuia}`);
    if (!ok) return;

    document.getElementById('totalComentarios').textContent = datos.length;
    document.getElementById('listaComentarios').innerHTML = datos.length
        ? datos.map(c => {
            const propio = sesion && c.autor && c.autor._id === sesion.id;
            const puedeBorrar = propio || guia.puedeModerar;
            return `
            <div class="border-bottom py-2">
                <div class="d-flex justify-content-between">
                    <strong>${escaparTexto(c.autor?.nombre || 'Usuario eliminado')}</strong>
                    <small class="text-muted">${formatearFecha(c.createdAt)}</small>
                </div>
                <p class="mb-1 texto-guia">${escaparTexto(c.texto)}</p>
                <div class="small">
                    ${puedeBorrar ? `<button class="btn btn-link btn-sm p-0 text-danger me-3" data-borrar="${c._id}">Eliminar</button>` : ''}
                    ${!propio ? `<button class="btn btn-link btn-sm p-0 text-muted" data-reportar="${c._id}">Reportar</button>` : ''}
                </div>
            </div>`;
        }).join('')
        : '<p class="text-muted mb-0">Todavía no hay comentarios. ¡Sé el primero!</p>';
}

document.getElementById('listaComentarios').addEventListener('click', async (e) => {
    const borrar = e.target.dataset.borrar;
    const reportar = e.target.dataset.reportar;

    if (reportar) abrirReporte('comentario', reportar);

    if (borrar && await confirmar('Eliminar comentario', '¿Seguro que quieres eliminar este comentario?', 'Eliminar')) {
        const { ok } = await llamarAPI(`${API.COMENTARIOS}/${borrar}`, 'DELETE');
        if (ok) cargarComentarios();
    }
});

const formComentario = document.getElementById('formComentario');
if (!sesion) {
    formComentario.innerHTML = `<p class="mb-0"><a href="../login.html?volver=${encodeURIComponent(location.pathname + location.search)}">Inicia sesión</a> para comentar.</p>`;
}

formComentario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = document.getElementById('textoComentario');
    if (!texto.value.trim()) return;

    const { ok, datos } = await llamarAPI(`${API.COMENTARIOS}/guia/${idGuia}`, 'POST', { texto: texto.value.trim() });
    if (ok) {
        texto.value = '';
        document.getElementById('alertaComentario').innerHTML = '';
        cargarComentarios();
    } else {
        mostrarAlerta('alertaComentario', 'danger', datos?.message || MENSAJE_FALLA);
    }
});

if (idGuia) cargarGuia();
else mostrarAlerta('alerta', 'warning', 'No encontramos esta guía.');
