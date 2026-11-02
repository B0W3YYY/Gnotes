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

// ----- Juegos nuevos: guías que piden agregar un juego -----
async function cargarSolicitudes() {
    const { ok, datos } = await llamarAPI(`${API.ADMIN}/juegos/solicitudes`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    const total = document.getElementById('totalSolicitudes');
    total.textContent = datos.length;
    total.classList.toggle('d-none', datos.length === 0);

    document.getElementById('tablaSolicitudes').innerHTML = datos.length ? datos.map(g => `
        <tr data-solicitud="${g._id}">
            <td style="min-width: 180px">
                <label for="nombre${g._id}" class="visually-hidden">Nombre del juego</label>
                <input type="text" id="nombre${g._id}" class="form-control form-control-sm" maxlength="60" value="${escaparAtributo(g.juego)}">
            </td>
            <td>
                <a href="../usuario/guia.html?id=${g._id}" target="_blank" rel="noopener">${escaparTexto(g.titulo)}</a>
                <br><small class="text-muted">Por ${escaparTexto(g.autor?.nombre || 'Usuario eliminado')} · ${formatearFecha(g.createdAt)}</small>
            </td>
            <td style="min-width: 160px">
                <label for="icono${g._id}" class="visually-hidden">Ícono del juego (opcional)</label>
                <input type="file" id="icono${g._id}" class="form-control form-control-sm" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif">
            </td>
            <td class="text-end text-nowrap">
                <button class="btn btn-primario btn-sm" data-aprobar="${g._id}">Aprobar</button>
                <button class="btn btn-outline-danger btn-sm" data-rechazar="${g._id}">Rechazar</button>
            </td>
        </tr>`).join('') : filaVacia(4, 'No hay juegos nuevos por revisar');
}

// Sube el ícono elegido con el mismo endpoint de las guías. Devuelve su URL, '' si no hay, o null si falló
async function subirIcono(campo) {
    const archivo = campo.files[0];
    if (!archivo) return '';
    if (!/\.(jpe?g|png|webp|gif)$/i.test(archivo.name) || archivo.size > 10 * 1024 * 1024) {
        mostrarAlerta('alertaJuegos', 'danger', 'El ícono debe ser JPG, PNG, WEBP o GIF de hasta 10 MB.');
        return null;
    }
    const datos = new FormData();
    datos.append('archivos', archivo);
    try {
        const respuesta = await fetch(`${API.GUIAS}/multimedia`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${sesion.token}` },
            body: datos
        });
        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            mostrarAlerta('alertaJuegos', 'danger', resultado.message || MENSAJE_FALLA);
            return null;
        }
        return resultado.archivos[0].url;
    } catch (error) {
        mostrarAlerta('alertaJuegos', 'danger', MENSAJE_FALLA);
        return null;
    }
}

document.getElementById('tablaSolicitudes').addEventListener('click', async (e) => {
    const aprobar = e.target.dataset.aprobar;
    const rechazar = e.target.dataset.rechazar;
    if (!aprobar && !rechazar) return;

    const fila = e.target.closest('tr');
    fila.querySelectorAll('button').forEach(b => b.disabled = true);

    let respuesta;
    if (aprobar) {
        const icono = await subirIcono(document.getElementById(`icono${aprobar}`));
        if (icono === null) {
            fila.querySelectorAll('button').forEach(b => b.disabled = false);
            return;
        }
        respuesta = await llamarAPI(`${API.ADMIN}/juegos/solicitudes/${aprobar}/aprobar`, 'PUT', {
            nombre: document.getElementById(`nombre${aprobar}`).value.trim(),
            icono: icono || undefined
        });
    } else {
        if (!await confirmar('Rechazar juego nuevo', 'La guía quedará rechazada y el juego no se agregará. ¿Continuar?', 'Rechazar')) {
            fila.querySelectorAll('button').forEach(b => b.disabled = false);
            return;
        }
        respuesta = await llamarAPI(`${API.ADMIN}/juegos/solicitudes/${rechazar}/rechazar`, 'PUT');
    }

    const { ok, datos } = respuesta;
    mostrarAlerta('alertaJuegos', ok ? 'success' : 'danger', ok ? datos.mensaje : (datos?.message || MENSAJE_FALLA));
    cargarSolicitudes();
    if (ok) cargarEstadisticas();
});

// ----- Cursos y roles: mismo formulario para crear y editar (el _id oculto dice cuál es) -----
function activarCrud({ url, form, idOculto, tabla, alerta, boton, cancelar, campos, columnas, textoNuevo, nombre }) {
    const formulario = document.getElementById(form);
    let elementos = [];

    function limpiar() {
        formulario.reset();
        formulario.classList.remove('was-validated');
        document.getElementById(idOculto).value = '';
        document.getElementById(boton).textContent = textoNuevo;
        document.getElementById(cancelar).classList.add('d-none');
    }

    async function cargar() {
        const { ok, datos } = await llamarAPI(url);
        elementos = ok ? datos : [];
        document.getElementById(tabla).innerHTML = elementos.length ? elementos.map(e => `
            <tr>
                ${columnas.map(c => `<td>${escaparTexto(e[c] ?? '')}</td>`).join('')}
                <td class="text-end text-nowrap">
                    <button class="btn btn-outline-light btn-sm" data-editar="${e._id}">Editar</button>
                    <button class="btn btn-outline-danger btn-sm" data-eliminar="${e._id}">Eliminar</button>
                </td>
            </tr>`).join('') : filaVacia(columnas.length + 1, ok ? `Todavía no hay ${nombre}s` : MENSAJE_FALLA);
    }

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        formulario.classList.add('was-validated');
        if (!formulario.checkValidity()) return;

        const id = document.getElementById(idOculto).value;
        const cuerpo = {};
        Object.entries(campos).forEach(([campo, idCampo]) => {
            const valor = document.getElementById(idCampo).value.trim();
            cuerpo[campo] = document.getElementById(idCampo).type === 'number' ? Number(valor) : valor;
        });

        const { ok, datos } = await llamarAPI(id ? `${url}/${id}` : url, id ? 'PUT' : 'POST', cuerpo);
        mostrarAlerta(alerta, ok ? 'success' : 'danger',
            ok ? `${nombre[0].toUpperCase() + nombre.slice(1)} ${id ? 'actualizado' : 'agregado'}.` : (datos?.message || MENSAJE_FALLA));
        if (ok) {
            limpiar();
            cargar();
        }
    });

    document.getElementById(cancelar).addEventListener('click', limpiar);

    document.getElementById(tabla).addEventListener('click', async (e) => {
        const { editar, eliminar } = e.target.dataset;
        if (editar) {
            const elegido = elementos.find(x => x._id === editar);
            document.getElementById(idOculto).value = elegido._id;
            Object.entries(campos).forEach(([campo, idCampo]) => {
                document.getElementById(idCampo).value = elegido[campo] ?? '';
            });
            document.getElementById(boton).textContent = 'Guardar cambios';
            document.getElementById(cancelar).classList.remove('d-none');
            document.getElementById(Object.values(campos)[0]).focus();
        }
        if (eliminar && await confirmar(`Eliminar ${nombre}`, `¿Seguro que quieres eliminar este ${nombre}?`, 'Eliminar')) {
            const { ok, datos } = await llamarAPI(`${url}/${eliminar}`, 'DELETE');
            mostrarAlerta(alerta, ok ? 'success' : 'danger', ok ? `${nombre[0].toUpperCase() + nombre.slice(1)} eliminado.` : (datos?.message || MENSAJE_FALLA));
            if (ok) cargar();
        }
    });

    cargar();
}

activarCrud({
    url: API.CURSOS, form: 'formCurso', idOculto: 'cursoId', tabla: 'tablaCursos', alerta: 'alertaCurso',
    boton: 'guardarCurso', cancelar: 'cancelarCurso', textoNuevo: 'Agregar curso', nombre: 'curso',
    campos: { nombre: 'cursoNombre', creditos: 'cursoCreditos', descripcion: 'cursoDescripcion' },
    columnas: ['nombre', 'creditos']
});

activarCrud({
    url: API.ROLES, form: 'formRol', idOculto: 'rolId', tabla: 'tablaRoles', alerta: 'alertaRol',
    boton: 'guardarRol', cancelar: 'cancelarRol', textoNuevo: 'Agregar rol', nombre: 'rol',
    campos: { nombre: 'rolNombre', descripcion: 'rolDescripcion' },
    columnas: ['nombre', 'descripcion']
});

cargarEstadisticas();
cargarSolicitudes();
cargarUsuarios();
cargarSanciones();
cargarPalabras();
