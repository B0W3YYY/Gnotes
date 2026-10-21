// ===== Crear guía (SCRUM-27) y editar guía (SCRUM-28) =====
const formGuia = document.getElementById('formGuia');
const idGuia = new URLSearchParams(location.search).get('id');
const contenido = document.getElementById('contenido');
const contador = document.getElementById('contador');

llenarSelect('categoria', CATEGORIAS, 'Elige una categoría');
llenarSelect('dificultad', DIFICULTADES, 'Elige una dificultad');

contenido.addEventListener('input', () => {
    contador.textContent = `${contenido.value.length} caracteres`;
});

// Modo edición: carga la guía y revisa que sea del usuario
async function cargarParaEditar() {
    document.getElementById('tituloPagina').textContent = 'Editar guía';
    document.getElementById('botonGuardar').textContent = 'Guardar cambios';

    const { ok, datos } = await llamarAPI(`${API.GUIAS}/${idGuia}`);

    if (!ok || !datos.esAutor) {
        formGuia.classList.add('d-none');
        mostrarAlerta('alerta', 'warning', 'No encontramos esa guía o no puedes editarla.');
        return;
    }

    for (const campo of ['titulo', 'juego', 'categoria', 'dificultad', 'contenido']) {
        document.getElementById(campo).value = datos[campo];
    }
    contenido.dispatchEvent(new Event('input'));
}

formGuia.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formGuia.checkValidity()) {
        formGuia.classList.add('was-validated');
        return;
    }

    const datos = {};
    for (const campo of ['titulo', 'juego', 'categoria', 'dificultad', 'contenido']) {
        datos[campo] = document.getElementById(campo).value.trim();
    }

    try {
        const { ok, datos: resultado } = idGuia
            ? await llamarAPI(`${API.GUIAS}/${idGuia}`, 'PUT', datos)
            : await llamarAPI(API.GUIAS, 'POST', datos);

        if (!ok) {
            mostrarAlerta('alerta', 'danger', resultado?.message?.includes('sancionada')
                ? resultado.message
                : 'No pudimos guardar la guía. Revisa los datos e inténtalo de nuevo.');
            return;
        }

        const guia = resultado.datos || resultado;
        const aviso = guia.estado === 'pendiente' ? '&aviso=pendiente' : '';
        window.location.href = `guia.html?id=${guia._id}${aviso}`;
    } catch (error) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    }
});

if (idGuia) cargarParaEditar();
