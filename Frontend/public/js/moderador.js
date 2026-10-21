// ===== Moderación: estados de guías, reportes, pendientes e historial =====

async function cargarResumen() {
    const { ok, datos } = await llamarAPI(`${API.MODERACION}/resumen`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }
    document.getElementById('numReportes').textContent = datos.reportesPendientes;
    document.getElementById('numPendientes').textContent = datos.guiasPendientes;
    document.getElementById('numRechazadas').textContent = datos.guiasRechazadas;
}

function filaVacia(columnas, texto) {
    return `<tr><td colspan="${columnas}" class="text-center text-muted py-3">${texto}</td></tr>`;
}

async function cargarReportes() {
    const { ok, datos } = await llamarAPI(API.REPORTES);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    document.getElementById('tablaReportes').innerHTML = datos.length ? datos.map(r => {
        const c = r.contenido;
        const descripcion = !c
            ? '<em class="text-muted">Ya fue eliminado</em>'
            : r.tipo === 'guia'
                ? `<a href="../usuario/guia.html?id=${c._id}">${escaparTexto(c.titulo)}</a>`
                : `“${escaparTexto(c.texto.slice(0, 100))}” <a href="../usuario/guia.html?id=${c.guia}" class="small">ver guía</a>`;
        return `
        <tr>
            <td><span class="badge bg-secondary">${r.tipo === 'guia' ? 'Guía' : 'Comentario'}</span></td>
            <td>${descripcion}<br><small class="text-muted">Autor: ${escaparTexto(c?.autor?.nombre || '—')}</small></td>
            <td>${escaparTexto(r.motivo)}<br><small class="text-muted">Por ${escaparTexto(r.reportadoPor?.nombre || '—')} · ${formatearFecha(r.createdAt)}</small></td>
            <td class="text-end text-nowrap">
                ${c ? `<button class="btn btn-danger btn-sm" data-reporte="${r._id}" data-accion="ocultar">Ocultar</button>` : ''}
                <button class="btn btn-outline-secondary btn-sm" data-reporte="${r._id}" data-accion="descartar">Descartar</button>
            </td>
        </tr>`;
    }).join('') : filaVacia(4, 'No hay reportes pendientes');
}

async function cargarGuias(estado, idTabla) {
    const { ok, datos } = await llamarAPI(`${API.MODERACION}/guias?estado=${estado}`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    const boton = estado === 'pendiente'
        ? (id) => `<button class="btn btn-success btn-sm" data-guia="${id}" data-estado="publicada">Aprobar</button>
                   <button class="btn btn-outline-danger btn-sm" data-guia="${id}" data-estado="rechazada">Rechazar</button>`
        : (id) => `<button class="btn btn-outline-success btn-sm" data-guia="${id}" data-estado="publicada">Restaurar</button>`;

    document.getElementById(idTabla).innerHTML = datos.length ? datos.map(g => `
        <tr>
            <td><a href="../usuario/guia.html?id=${g._id}">${escaparTexto(g.titulo)}</a><br><small class="text-muted">${escaparTexto(g.juego)}</small></td>
            <td>${escaparTexto(g.autor?.nombre || '—')}</td>
            <td>${formatearFecha(g.updatedAt)}</td>
            <td class="text-end text-nowrap">${boton(g._id)}</td>
        </tr>`).join('') : filaVacia(4, 'No hay guías en este estado');
}

async function cargarHistorial() {
    const { ok, datos } = await llamarAPI(`${API.MODERACION}/historial`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    document.getElementById('tablaHistorial').innerHTML = datos.length ? datos.map(a => `
        <tr>
            <td class="text-nowrap">${new Date(a.createdAt).toLocaleString('es')}</td>
            <td>${escaparTexto(a.realizadaPor?.nombre || '—')} <span class="badge bg-secondary">${a.realizadaPor?.rol || ''}</span></td>
            <td>${escaparTexto(a.accion)}</td>
            <td>${escaparTexto(a.detalle)}</td>
        </tr>`).join('') : filaVacia(4, 'Todavía no hay acciones registradas');
}

function recargarTodo() {
    cargarResumen();
    cargarReportes();
    cargarGuias('pendiente', 'tablaPendientes');
    cargarGuias('rechazada', 'tablaRechazadas');
    cargarHistorial();
}

document.querySelector('main').addEventListener('click', async (e) => {
    const { reporte, accion, guia, estado } = e.target.dataset;

    if (reporte) {
        const { ok } = await llamarAPI(`${API.REPORTES}/${reporte}`, 'PUT', { accion });
        mostrarAlerta('alerta', ok ? 'success' : 'danger', ok ? 'Reporte atendido.' : MENSAJE_FALLA);
        recargarTodo();
    }

    if (guia) {
        const { ok } = await llamarAPI(`${API.MODERACION}/guias/${guia}/estado`, 'PUT', { estado });
        mostrarAlerta('alerta', ok ? 'success' : 'danger', ok ? 'Estado actualizado.' : MENSAJE_FALLA);
        recargarTodo();
    }
});

recargarTodo();
