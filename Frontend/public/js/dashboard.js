// ===== Mi panel: dashboard (SCRUM-178) e historial de contribuciones (SCRUM-25) =====
const sesion = obtenerSesion();
document.getElementById('saludo').textContent = `¡Hola, ${sesion.nombre}!`;

if (new URLSearchParams(location.search).get('guia') === 'eliminada') {
    mostrarAlerta('alerta', 'success', 'La guía se eliminó.');
}

const TARJETAS = [
    { campo: 'guias', texto: 'Guías creadas' },
    { campo: 'votos', texto: 'Votos recibidos' },
    { campo: 'vistas', texto: 'Vistas totales' },
    { campo: 'favoritos', texto: 'Guías guardadas' },
    { campo: 'comentarios', texto: 'Comentarios hechos' },
    { campo: 'pendientes', texto: 'En revisión' }
];

async function cargarEstadisticas() {
    const { ok, datos } = await llamarAPI(`${API.USUARIOS}/perfil/estadisticas`);
    if (!ok) return;

    document.getElementById('estadisticas').innerHTML = TARJETAS.map(t => `
        <div class="col-6 col-md-4 col-lg-2">
            <div class="card tarjeta p-3 text-center h-100">
                <div class="cifra">${datos[t.campo]}</div>
                <small class="text-muted">${t.texto}</small>
            </div>
        </div>`).join('');
}

const ESTADOS = { publicada: 'Publicada', pendiente: 'En revisión', rechazada: 'Rechazada' };

async function cargarHistorial() {
    const { ok, datos } = await llamarAPI(`${API.GUIAS}?autor=${sesion.id}&orden=recientes`);
    const cuerpo = document.getElementById('historial');

    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    document.getElementById('sinGuias').classList.toggle('d-none', datos.length > 0);
    document.getElementById('tablaHistorial').classList.toggle('d-none', datos.length === 0);

    cuerpo.innerHTML = datos.map(g => `
        <tr>
            <td><a href="guia.html?id=${g._id}">${escaparTexto(g.titulo)}</a><br><small class="text-muted">${escaparTexto(g.juego)}</small></td>
            <td><span class="badge bg-${COLOR_ESTADO[g.estado]}">${ESTADOS[g.estado]}</span></td>
            <td class="text-center">${g.totalVotos}</td>
            <td class="text-center">${g.vistas}</td>
            <td>${formatearFecha(g.createdAt)}</td>
            <td class="text-end text-nowrap">
                <a class="btn btn-outline-secondary btn-sm" href="guia-form.html?id=${g._id}">Editar</a>
                <button class="btn btn-outline-danger btn-sm" data-eliminar="${g._id}">Eliminar</button>
            </td>
        </tr>`).join('');
}

document.getElementById('historial').addEventListener('click', async (e) => {
    const id = e.target.dataset.eliminar;
    if (!id) return;

    if (await confirmar('Eliminar guía', 'Esta acción no se puede deshacer. ¿Seguro que quieres eliminarla?', 'Eliminar')) {
        const { ok } = await llamarAPI(`${API.GUIAS}/${id}`, 'DELETE');
        mostrarAlerta('alerta', ok ? 'success' : 'danger', ok ? 'La guía se eliminó.' : 'No pudimos eliminar la guía.');
        cargarEstadisticas();
        cargarHistorial();
    }
});

cargarEstadisticas();
cargarHistorial();
