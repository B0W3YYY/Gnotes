// ===== Componentes compartidos (SCRUM-19) =====

// Menú de navegación según el rol (SCRUM-18)
const MENU = {
    visitante: [
        { texto: 'Inicio', ruta: 'index.html' }
    ],
    usuario: [
        { texto: 'Inicio', ruta: 'index.html' },
        { texto: 'Tips', ruta: 'pages/usuario/tips.html' },
        { texto: 'Mi espacio', ruta: 'pages/usuario/inicio.html' }
    ],
    moderador: [
        { texto: 'Inicio', ruta: 'index.html' },
        { texto: 'Tips', ruta: 'pages/usuario/tips.html' },
        { texto: 'Mi espacio', ruta: 'pages/usuario/inicio.html' },
        { texto: 'Moderación', ruta: 'pages/moderador/panel.html' }
    ],
    admin: [
        { texto: 'Inicio', ruta: 'index.html' },
        { texto: 'Tips', ruta: 'pages/usuario/tips.html' },
        { texto: 'Mi espacio', ruta: 'pages/usuario/inicio.html' },
        { texto: 'Moderación', ruta: 'pages/moderador/panel.html' },
        { texto: 'Administración', ruta: 'pages/admin/panel.html' }
    ]
};

function crearNavbar() {
    const base = obtenerBase();
    const rol = obtenerRol();
    const sesion = obtenerSesion();
    const actual = window.location.pathname;

    const links = MENU[rol].map(item => {
        const activo = actual.endsWith(item.ruta) ? 'active' : '';
        return `<li class="nav-item"><a class="nav-link ${activo}" href="${base}${item.ruta}">${item.texto}</a></li>`;
    }).join('');

    const derecha = sesion
        ? `<span class="navbar-text me-3">${sesion.nombre} <span class="badge bg-secondary">${rol}</span></span>
           <button class="btn btn-outline-light btn-sm" onclick="cerrarSesion()">Salir</button>`
        : `<a class="btn btn-outline-light btn-sm me-2" href="${base}pages/login.html">Iniciar sesión</a>
           <a class="btn btn-secundario btn-sm" href="${base}pages/registro.html">Crear cuenta</a>`;

    return `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-app">
        <div class="container">
            <a class="navbar-brand" href="${base}index.html">GameGuides</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"
                aria-controls="menu" aria-expanded="false" aria-label="Abrir menú">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="menu">
                <ul class="navbar-nav me-auto">${links}</ul>
                <div class="d-flex align-items-center">${derecha}</div>
            </div>
        </div>
    </nav>`;
}

function crearFooter() {
    return `
    <footer class="footer-app py-3 mt-5">
        <div class="container text-center small">
            GameGuides &copy; ${new Date().getFullYear()} · Proyecto Integrador ·
            <a href="${obtenerBase()}pages/ui/documentacion.html" class="link-light">Documentación UI</a>
        </div>
    </footer>`;
}

// Alerta reutilizable: mostrarAlerta('idContenedor', 'success' | 'danger' | 'warning', 'texto')
function mostrarAlerta(idContenedor, tipo, texto) {
    document.getElementById(idContenedor).innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${texto}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>`;
}

document.body.insertAdjacentHTML('afterbegin', crearNavbar());
document.body.insertAdjacentHTML('beforeend', crearFooter());
