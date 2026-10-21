// ===== Administración: estadísticas, usuarios y roles, sanciones y palabras prohibidas =====
const sesion = obtenerSesion();
let usuarios = [];

function filaVacia(columnas, texto) {
    return `<tr><td colspan="${columnas}" class="text-center text-muted py-3">${texto}</td></tr>`;
}

async function cargarEstadisticas() {
    const { ok, datos } = await llamarAPI(`${API.ADMIN}/estadisticas`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    const tarjetas = [
        ['usuarios', 'Usuarios'], ['guias', 'Guías publicadas'], ['comentarios', 'Comentarios'],
        ['votos', 'Votos'], ['reportesPendientes', 'Reportes pendientes'], ['sancionesActivas', 'Sanciones activas']
    ];

    document.getElementById('estadisticas').innerHTML = tarjetas.map(([campo, texto]) => `
        <div class="col-6 col-md-4 col-lg-2">
            <div class="card tarjeta p-3 text-center h-100">
                <div class="cifra">${datos[campo]}</div>
                <small class="text-muted">${texto}</small>
            </div>
        </div>`).join('');

    const total = Math.max(1, ...Object.values(datos.porCategoria));
    const categorias = Object.entries(datos.porCategoria).sort((a, b) => b[1] - a[1]);
    document.getElementById('porCategoria').innerHTML = categorias.length ? categorias.map(([cat, n]) => `
        <div class="mb-2">
            <div class="d-flex justify-content-between small"><span>${cat}</span><span>${n}</span></div>
            <div class="progress" role="progressbar" aria-label="${cat}" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${total}">
                <div class="progress-bar barra-categoria" style="width: ${(n / total) * 100}%"></div>
            </div>
        </div>`).join('') : '<p class="text-muted mb-0">Todavía no hay guías publicadas.</p>';
}

async function cargarUsuarios() {
    const { ok, datos } = await llamarAPI(API.USUARIOS);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }
    usuarios = datos;

    document.getElementById('tablaUsuarios').innerHTML = datos.map(u => `
        <tr>
            <td>${escaparTexto(u.nombre)}<br><small class="text-muted">${escaparTexto(u.correo)}</small></td>
            <td>${formatearFecha(u.createdAt)}</td>
            <td>
                ${u._id === sesion.id
                    ? `<span class="badge bg-secondary">${u.rol}</span> <small class="text-muted">(tú)</small>`
                    : `<select class="form-select form-select-sm" data-rol="${u._id}" aria-label="Rol de ${escaparTexto(u.nombre)}">
                        ${['usuario', 'moderador', 'admin'].map(r => `<option ${r === u.rol ? 'selected' : ''}>${r}</option>`).join('')}
                       </select>`}
            </td>
        </tr>`).join('');

    llenarSelect('sancionUsuario', [], 'Elige un usuario');
    document.getElementById('sancionUsuario').innerHTML += datos
        .filter(u => u.rol !== 'admin')
        .map(u => `<option value="${u._id}">${escaparTexto(u.nombre)} (${escaparTexto(u.correo)})</option>`).join('');
}

document.getElementById('tablaUsuarios').addEventListener('change', async (e) => {
    const id = e.target.dataset.rol;
    if (!id) return;
    const { ok } = await llamarAPI(`${API.USUARIOS}/${id}/rol`, 'PUT', { rol: e.target.value });
    mostrarAlerta('alerta', ok ? 'success' : 'danger', ok ? 'Rol actualizado.' : MENSAJE_FALLA);
    cargarUsuarios();
});

// ----- Sanciones -----
const TIPOS = { advertencia: 'Advertencia', suspension: 'Suspensión', bloqueo: 'Bloqueo' };

async function cargarSanciones() {
    const { ok, datos } = await llamarAPI(`${API.ADMIN}/sanciones`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    document.getElementById('tablaSanciones').innerHTML = datos.length ? datos.map(s => {
        const vencida = s.tipo === 'suspension' && new Date(s.hasta) < new Date();
        const vigente = s.activa && !vencida;
        return `
        <tr>
            <td>${escaparTexto(s.usuario?.nombre || 'Usuario eliminado')}</td>
            <td>${TIPOS[s.tipo]}${s.hasta ? `<br><small class="text-muted">hasta ${formatearFecha(s.hasta)}</small>` : ''}</td>
            <td>${escaparTexto(s.motivo)}</td>
            <td><span class="badge bg-${vigente ? 'danger' : 'secondary'}">${vigente ? 'Vigente' : 'Terminada'}</span></td>
            <td class="text-end">${vigente && s.tipo !== 'advertencia' ? `<button class="btn btn-outline-secondary btn-sm" data-levantar="${s._id}">Levantar</button>` : ''}</td>
        </tr>`;
    }).join('') : filaVacia(5, 'No hay sanciones');
}

const sancionTipo = document.getElementById('sancionTipo');
sancionTipo.addEventListener('change', () => {
    const esSuspension = sancionTipo.value === 'suspension';
    document.getElementById('grupoHasta').classList.toggle('d-none', !esSuspension);
    document.getElementById('sancionHasta').required = esSuspension;
});
document.getElementById('sancionHasta').min = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

document.getElementById('formSancion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const { ok, datos } = await llamarAPI(`${API.ADMIN}/sanciones`, 'POST', {
        usuario: document.getElementById('sancionUsuario').value,
        tipo: sancionTipo.value,
        motivo: document.getElementById('sancionMotivo').value.trim(),
        hasta: document.getElementById('sancionHasta').value || undefined
    });

    mostrarAlerta('alertaSancion', ok ? 'success' : 'danger', ok ? 'Sanción aplicada.' : (datos?.message || MENSAJE_FALLA));
    if (ok) {
        form.reset();
        form.classList.remove('was-validated');
        sancionTipo.dispatchEvent(new Event('change'));
        cargarSanciones();
        cargarEstadisticas();
    }
});

document.getElementById('tablaSanciones').addEventListener('click', async (e) => {
    const id = e.target.dataset.levantar;
    if (!id) return;
    const { ok } = await llamarAPI(`${API.ADMIN}/sanciones/${id}/levantar`, 'PUT');
    mostrarAlerta('alertaSancion', ok ? 'success' : 'danger', ok ? 'Sanción levantada.' : MENSAJE_FALLA);
    cargarSanciones();
    cargarEstadisticas();
});

// ----- Palabras prohibidas -----
async function cargarPalabras() {
    const { ok, datos } = await llamarAPI(`${API.ADMIN}/palabras`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    document.getElementById('listaPalabras').innerHTML = datos.length ? datos.map(p => `
        <span class="badge bg-secondary fs-6 fw-normal me-2 mb-2">
            ${escaparTexto(p.palabra)}
            <button class="btn-close btn-close-sm ms-1 align-middle" style="font-size: .6rem" data-palabra="${p._id}" aria-label="Quitar ${escaparTexto(p.palabra)}"></button>
        </span>`).join('') : '<p class="text-muted mb-0">No hay palabras prohibidas.</p>';
}

document.getElementById('formPalabra').addEventListener('submit', async (e) => {
    e.preventDefault();
    const campo = document.getElementById('palabra');
    if (!campo.value.trim()) return;

    const { ok, datos } = await llamarAPI(`${API.ADMIN}/palabras`, 'POST', { palabra: campo.value.trim() });
    if (ok) {
        campo.value = '';
        document.getElementById('alertaPalabra').innerHTML = '';
        cargarPalabras();
    } else {
        mostrarAlerta('alertaPalabra', 'danger', datos?.message || MENSAJE_FALLA);
    }
});

document.getElementById('listaPalabras').addEventListener('click', async (e) => {
    const id = e.target.dataset.palabra;
    if (!id) return;
    await llamarAPI(`${API.ADMIN}/palabras/${id}`, 'DELETE');
    cargarPalabras();
});

cargarEstadisticas();
cargarUsuarios();
cargarSanciones();
cargarPalabras();
