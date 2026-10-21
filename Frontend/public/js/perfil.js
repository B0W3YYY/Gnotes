// ===== Perfil: ver (SCRUM-23), editar (SCRUM-24), cambiar contraseña y eliminar cuenta =====
const formPerfil = document.getElementById('formPerfil');
const formClave = document.getElementById('formClave');
const formEliminar = document.getElementById('formEliminar');

async function cargarPerfil() {
    const { ok, datos } = await llamarAPI(`${API.USUARIOS}/perfil`);
    if (!ok) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    document.getElementById('verNombre').textContent = datos.nombre;
    document.getElementById('verCorreo').textContent = datos.correo;
    document.getElementById('verRol').textContent = datos.rol;
    document.getElementById('verDesde').textContent = formatearFecha(datos.createdAt);
    document.getElementById('verBiografia').textContent = datos.biografia || 'Todavía no escribiste nada sobre ti.';
    document.getElementById('inicial').textContent = datos.nombre.charAt(0).toUpperCase();

    document.getElementById('nombre').value = datos.nombre;
    document.getElementById('correo').value = datos.correo;
    document.getElementById('biografia').value = datos.biografia || '';
}

formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formPerfil.checkValidity()) {
        formPerfil.classList.add('was-validated');
        return;
    }

    const { ok, datos } = await llamarAPI(`${API.USUARIOS}/perfil`, 'PUT', {
        nombre: document.getElementById('nombre').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        biografia: document.getElementById('biografia').value.trim()
    });

    if (!ok) {
        mostrarAlerta('alerta', 'danger', datos?.message === 'Ese correo ya está en uso'
            ? 'Ese correo ya está en uso por otra cuenta.'
            : 'No pudimos guardar los cambios. Revisa los datos.');
        return;
    }

    actualizarSesion({ nombre: datos.datos.nombre, correo: datos.datos.correo });
    mostrarAlerta('alerta', 'success', 'Tu perfil se actualizó.');
    formPerfil.classList.remove('was-validated');
    cargarPerfil();
    // Actualiza el nombre en el menú
    document.querySelector('.navbar-app').outerHTML = crearNavbar();
    document.getElementById('botonSalir')?.addEventListener('click', cerrarSesion);
});

formClave.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nueva = document.getElementById('claveNueva');
    const confirmarClave = document.getElementById('claveConfirmar');
    confirmarClave.setCustomValidity(nueva.value !== confirmarClave.value ? 'No coinciden' : '');

    if (!formClave.checkValidity()) {
        formClave.classList.add('was-validated');
        return;
    }

    const { ok, datos } = await llamarAPI(`${API.USUARIOS}/perfil/clave`, 'PUT', {
        actual: document.getElementById('claveActual').value,
        nueva: nueva.value
    });

    mostrarAlerta('alertaClave', ok ? 'success' : 'danger', ok ? 'Tu contraseña se actualizó.' : (datos?.message || MENSAJE_FALLA));
    if (ok) {
        formClave.reset();
        formClave.classList.remove('was-validated');
    }
});

formEliminar.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formEliminar.checkValidity()) {
        formEliminar.classList.add('was-validated');
        return;
    }

    const seguro = await confirmar('Eliminar cuenta',
        'Se borrarán tu cuenta, tus guías y tus comentarios. Esta acción no se puede deshacer.', 'Eliminar mi cuenta');
    if (!seguro) return;

    const { ok, datos } = await llamarAPI(`${API.USUARIOS}/perfil`, 'DELETE', {
        clave: document.getElementById('claveEliminar').value
    });

    if (ok) {
        localStorage.removeItem('sesion');
        window.location.href = '../../index.html';
    } else {
        mostrarAlerta('alertaEliminar', 'danger', datos?.message || MENSAJE_FALLA);
    }
});

cargarPerfil();
