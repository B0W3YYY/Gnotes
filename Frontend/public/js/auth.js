// ===== Sesión, roles y llamadas a la API (SCRUM-18, SCRUM-177) =====
const ROLES = ['visitante', 'usuario', 'moderador', 'admin'];

function obtenerSesion() {
    try {
        return JSON.parse(localStorage.getItem('sesion'));
    } catch (error) {
        return null;
    }
}

// respuesta = { token, usuario } tal como la devuelve la API
function guardarSesion(respuesta) {
    const { _id, nombre, correo, rol } = respuesta.usuario;
    localStorage.setItem('sesion', JSON.stringify({ id: _id, nombre, correo, rol, token: respuesta.token }));
}

function actualizarSesion(cambios) {
    localStorage.setItem('sesion', JSON.stringify({ ...obtenerSesion(), ...cambios }));
}

function cerrarSesion() {
    localStorage.removeItem('sesion');
    window.location.href = obtenerBase() + 'index.html';
}

function obtenerRol() {
    const sesion = obtenerSesion();
    return sesion ? sesion.rol : 'visitante';
}

// Ruta hacia la carpeta public desde la página actual (se define en <body data-base="...">)
function obtenerBase() {
    return document.body.dataset.base || '';
}

// Llama a la API con el token de la sesión. Devuelve { ok, status, datos }
async function llamarAPI(url, metodo = 'GET', cuerpo) {
    const sesion = obtenerSesion();
    let respuesta;
    try {
        respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {})
            },
            body: cuerpo ? JSON.stringify(cuerpo) : undefined
        });
    } catch (error) {
        // No hay conexión con el servidor: cada página muestra su mensaje de error
        return { ok: false, status: 0, datos: null };
    }

    // La sesión venció o ya no es válida
    if (respuesta.status === 401 && sesion) {
        localStorage.removeItem('sesion');
        window.location.href = `${obtenerBase()}pages/login.html?sesion=vencida`;
    }

    let datos = null;
    try { datos = await respuesta.json(); } catch (error) { }
    return { ok: respuesta.ok, status: respuesta.status, datos };
}

// Si la página tiene <body data-roles="usuario,admin">, solo esos roles pueden entrar
function protegerPagina() {
    const permitidos = document.body.dataset.roles;
    if (!permitidos) return;

    const rol = obtenerRol();
    if (permitidos.split(',').includes(rol)) return;

    // Sin sesión: a iniciar sesión y luego de vuelta a esta página
    if (rol === 'visitante') {
        const volver = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `${obtenerBase()}pages/login.html?volver=${volver}`;
    } else {
        window.location.href = obtenerBase() + 'index.html?acceso=denegado';
    }
}

protegerPagina();
