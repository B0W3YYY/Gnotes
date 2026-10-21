// ===== Registro de nuevo usuario (SCRUM-20) =====
const formRegistro = document.getElementById('formRegistro');

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clave = document.getElementById('clave');
    const confirmar = document.getElementById('confirmar');

    // Las claves deben coincidir
    confirmar.setCustomValidity(clave.value !== confirmar.value ? 'Las contraseñas no coinciden' : '');

    if (!formRegistro.checkValidity()) {
        formRegistro.classList.add('was-validated');
        return;
    }

    try {
        const { ok, datos } = await llamarAPI(API.USUARIOS, 'POST', {
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            clave: clave.value
        });

        if (!ok) {
            const mensaje = (datos?.message || '').includes('duplicate')
                ? 'Ya existe una cuenta con ese correo. Prueba con otro.'
                : 'No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo.';
            mostrarAlerta('alerta', 'danger', mensaje);
            return;
        }

        guardarSesion(datos);

        mostrarAlerta('alerta', 'success', 'Cuenta creada. Redirigiendo...');
        setTimeout(() => {
            window.location.href = 'usuario/inicio.html';
        }, 1200);

    } catch (error) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    }
});
