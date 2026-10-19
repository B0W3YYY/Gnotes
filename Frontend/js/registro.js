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

    const datos = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        clave: clave.value
    };

    try {
        const respuesta = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            const mensaje = (resultado.message || '').includes('duplicate')
                ? 'Ya existe una cuenta con ese correo. Prueba con otro.'
                : 'No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo.';
            mostrarAlerta('alerta', 'danger', mensaje);
            return;
        }

        guardarSesion({
            id: resultado._id,
            nombre: resultado.nombre,
            correo: resultado.correo,
            rol: 'usuario'
        });

        mostrarAlerta('alerta', 'success', '¡Cuenta creada! Redirigiendo...');
        setTimeout(() => {
            window.location.href = 'usuario/inicio.html';
        }, 1200);

    } catch (error) {
        mostrarAlerta('alerta', 'danger', 'Estamos teniendo problemas en este momento. Inténtalo de nuevo en unos minutos.');
    }
});
