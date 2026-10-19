// ===== Inicio de sesión =====
const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formLogin.checkValidity()) {
        formLogin.classList.add('was-validated');
        return;
    }

    const datos = {
        correo: document.getElementById('correo').value,
        clave: document.getElementById('clave').value
    };

    try {
        const respuesta = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.status === 401) {
            mostrarAlerta('alerta', 'danger', 'Correo o contraseña incorrectos.');
            return;
        }

        if (!respuesta.ok) {
            mostrarAlerta('alerta', 'danger', 'No pudimos iniciar tu sesión. Inténtalo de nuevo.');
            return;
        }

        const resultado = await respuesta.json();

        guardarSesion({
            id: resultado._id,
            nombre: resultado.nombre,
            correo: resultado.correo,
            rol: 'usuario'
        });

        // Si venía de "Buscar Tips", lo regresa a los tips
        const volver = new URLSearchParams(location.search).get('volver');
        window.location.href = volver === 'tips' ? 'usuario/tips.html' : 'usuario/inicio.html';

    } catch (error) {
        mostrarAlerta('alerta', 'danger', 'Estamos teniendo problemas en este momento. Inténtalo de nuevo en unos minutos.');
    }
});
