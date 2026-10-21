// ===== Recuperar contraseña (SCRUM-22) =====
const formRecuperar = document.getElementById('formRecuperar');
const formRestablecer = document.getElementById('formRestablecer');

// Paso 1: pedir el enlace por correo
formRecuperar?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formRecuperar.checkValidity()) {
        formRecuperar.classList.add('was-validated');
        return;
    }

    try {
        const { ok, datos } = await llamarAPI(`${API.USUARIOS}/recuperar`, 'POST', {
            correo: document.getElementById('correo').value
        });
        mostrarAlerta('alerta', ok ? 'success' : 'danger', ok ? datos.message : MENSAJE_FALLA);
        if (ok) formRecuperar.reset();
    } catch (error) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    }
});

// Paso 2: crear la contraseña nueva con el enlace del correo
formRestablecer?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clave = document.getElementById('clave');
    const confirmar = document.getElementById('confirmar');
    confirmar.setCustomValidity(clave.value !== confirmar.value ? 'Las contraseñas no coinciden' : '');

    if (!formRestablecer.checkValidity()) {
        formRestablecer.classList.add('was-validated');
        return;
    }

    try {
        const { ok, datos } = await llamarAPI(`${API.USUARIOS}/restablecer`, 'POST', {
            token: new URLSearchParams(location.search).get('token'),
            clave: clave.value
        });

        if (!ok) {
            mostrarAlerta('alerta', 'danger', datos?.message || MENSAJE_FALLA);
            return;
        }

        window.location.href = 'login.html?clave=actualizada';
    } catch (error) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    }
});
