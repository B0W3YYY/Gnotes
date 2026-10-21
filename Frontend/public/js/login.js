// ===== Inicio de sesión (SCRUM-21) =====
const formLogin = document.getElementById('formLogin');
const parametros = new URLSearchParams(location.search);

if (parametros.get('sesion') === 'vencida') {
    mostrarAlerta('alerta', 'warning', 'Tu sesión venció. Inicia sesión de nuevo.');
}
if (parametros.get('clave') === 'actualizada') {
    mostrarAlerta('alerta', 'success', 'Tu contraseña se actualizó. Ya puedes iniciar sesión.');
}

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formLogin.checkValidity()) {
        formLogin.classList.add('was-validated');
        return;
    }

    try {
        const { ok, status, datos } = await llamarAPI(`${API.USUARIOS}/login`, 'POST', {
            correo: document.getElementById('correo').value,
            clave: document.getElementById('clave').value
        });

        if (status === 401) {
            mostrarAlerta('alerta', 'danger', 'Correo o contraseña incorrectos.');
            return;
        }
        if (status === 403) {
            mostrarAlerta('alerta', 'danger', datos.message);
            return;
        }
        if (!ok) {
            mostrarAlerta('alerta', 'danger', 'No pudimos iniciar tu sesión. Inténtalo de nuevo.');
            return;
        }

        guardarSesion(datos);

        // Regresa a la página que pidió iniciar sesión (solo rutas de este sitio)
        const volver = parametros.get('volver');
        if (volver === 'tips') window.location.href = 'usuario/tips.html';
        else if (volver && volver.startsWith('/') && !volver.startsWith('//')) window.location.href = volver;
        else window.location.href = 'usuario/inicio.html';

    } catch (error) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    }
});
