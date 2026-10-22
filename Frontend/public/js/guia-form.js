// ===== Crear guía (SCRUM-27) y editar guía (SCRUM-28) =====
const formGuia = document.getElementById('formGuia');
const idGuia = new URLSearchParams(location.search).get('id');
const campoJuego = document.getElementById('juego');
const campoTitulo = document.getElementById('titulo');
const campoContenido = document.getElementById('contenido');
const sugerencias = document.getElementById('sugerenciasJuego');

const MINIMO_CONTENIDO = 20;
const CLAVE_BORRADOR = 'borradorGuia';
let hayCambios = false;
let enviando = false;

// ----- Opciones de categoría y dificultad como botones -----
const buscarCategoria = document.getElementById('buscarCategoria');
const botonCategoria = document.getElementById('botonCategoriaGuia');
const panelCategoria = document.getElementById('panelCategoriaGuia');

document.getElementById('opcionesCategoria').innerHTML = CATEGORIAS.map((c, i) => `
    <span class="opcion-cat" data-nombre="${c}">
        <input type="radio" class="btn-check" name="categoria" id="categoria${i}" value="${c}" autocomplete="off">
        <label class="pastilla" for="categoria${i}">${c}</label>
    </span>`).join('');

document.getElementById('opcionesDificultad').innerHTML = DIFICULTADES.map((d, i) => `
    <input type="radio" class="btn-check" name="dificultad" id="dificultad${i}" value="${d}" autocomplete="off">
    <label class="opcion-dificultad dificultad-${COLOR_DIFICULTAD[d]}" for="dificultad${i}">${d}</label>`).join('');

function valorRadio(nombre) {
    return formGuia.querySelector(`input[name="${nombre}"]:checked`)?.value || '';
}

function marcarRadio(nombre, valor) {
    const opcion = [...formGuia.querySelectorAll(`input[name="${nombre}"]`)].find(r => r.value === valor);
    if (opcion) opcion.checked = true;
}

function leerFormulario() {
    return {
        titulo: campoTitulo.value.trim(),
        juego: campoJuego.value.trim(),
        categoria: valorRadio('categoria'),
        dificultad: valorRadio('dificultad'),
        contenido: campoContenido.value.trim()
    };
}

function llenarFormulario(datos) {
    campoTitulo.value = datos.titulo || '';
    campoJuego.value = datos.juego || '';
    campoContenido.value = datos.contenido || '';
    marcarRadio('categoria', datos.categoria);
    marcarRadio('dificultad', datos.dificultad);
    actualizarTodo();
}

// ----- Juego: buscador con íconos de la lista de juegos -----
function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

function juegoConocido(nombre) {
    return JUEGOS.find(j => normalizar(j.nombre) === normalizar(nombre));
}

let indiceActivo = -1;

// ----- Parecido entre nombres de juegos (sirve para cualquier nombre, no hay casos escritos a mano) -----

// Cuántas letras comparten al inicio: "fortnite" y "forza" -> 3
function prefijoComun(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
}

// Pedazos de 2 letras en común (coeficiente de Dice): 0 = nada parecido, 1 = igual
function paresEnComun(a, b) {
    if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
    const pares = new Map();
    for (let i = 0; i < a.length - 1; i++) {
        const par = a.slice(i, i + 2);
        pares.set(par, (pares.get(par) || 0) + 1);
    }
    let comunes = 0;
    for (let i = 0; i < b.length - 1; i++) {
        const par = b.slice(i, i + 2);
        if (pares.get(par) > 0) {
            comunes++;
            pares.set(par, pares.get(par) - 1);
        }
    }
    return (2 * comunes) / (a.length + b.length - 2);
}

// Puntaje de parecido entre lo escrito (o el juego elegido) y el nombre de otro juego
function parecidoJuego(base, nombre) {
    const a = normalizar(base);
    const b = normalizar(nombre);
    if (!a) return 0;
    if (a === b) return 1000;

    let puntaje = 0;

    // Abreviaturas: "gta", "cs2", "lol", "rdr2"...
    const juego = JUEGOS.find(j => j.nombre === nombre);
    if (juego) {
        for (const abreviatura of abreviaturasJuego(juego)) {
            if (abreviatura === a) puntaje = Math.max(puntaje, 900);
            else if (a.length >= 2 && abreviatura.startsWith(a)) puntaje = Math.max(puntaje, 250);
        }
    }

    if (b.startsWith(a)) puntaje += 200;          // escribió el comienzo del nombre
    else if (b.includes(a)) puntaje += 100;       // escribió una parte del nombre
    puntaje += prefijoComun(a, b) * 12;           // mismo comienzo: "For"tnite / "For"za
    puntaje += paresEnComun(a, b) * 60;           // letras parecidas en cualquier lugar

    // Alguna palabra del otro juego empieza igual que alguna palabra del base
    const palabrasBase = base.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(p => p.length >= 3);
    const palabrasNombre = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(Boolean);
    if (palabrasBase.some(pb => palabrasNombre.some(pn => prefijoComun(pb, pn) >= 3))) puntaje += 25;

    return puntaje;
}

function mostrarSugerencias() {
    const texto = campoJuego.value.trim();
    const elegido = juegoConocido(texto);
    let encontrados;

    if (!texto) {
        // Campo vacío: los 18 más populares
        encontrados = JUEGOS.slice(0, 18);
    } else if (elegido) {
        // Ya hay un juego elegido: aparece primero y después todos los demás, del más parecido al menos
        encontrados = [...JUEGOS].sort((x, y) => parecidoJuego(elegido.nombre, y.nombre) - parecidoJuego(elegido.nombre, x.nombre));
    } else {
        // Escribiendo: primero lo que coincide y después los de nombre parecido
        encontrados = JUEGOS
            .map(j => ({ j, puntaje: parecidoJuego(texto, j.nombre) }))
            .filter(r => r.puntaje >= 20)
            .sort((x, y) => y.puntaje - x.puntaje)
            .slice(0, 8)
            .map(r => r.j);
    }
    indiceActivo = -1;

    sugerencias.innerHTML = encontrados.map((j, i) => `
        <li role="option" id="sugerencia${i}" data-nombre="${escaparTexto(j.nombre)}"
            ${elegido && j === elegido ? 'class="elegido" aria-selected="true"' : ''}>
            <img src="../../img/juegos/${j.icono}" alt="" width="28" height="28">
            <span>${escaparTexto(j.nombre)}</span>
        </li>`).join('');
    sugerencias.scrollTop = 0;

    const visible = encontrados.length > 0;
    sugerencias.classList.toggle('d-none', !visible);
    campoJuego.setAttribute('aria-expanded', visible);
}

function ocultarSugerencias() {
    sugerencias.classList.add('d-none');
    campoJuego.setAttribute('aria-expanded', 'false');
    campoJuego.removeAttribute('aria-activedescendant');
}

function elegirJuego(nombre) {
    campoJuego.value = nombre;
    ocultarSugerencias();
    alCambiar();
    campoTitulo.focus();
}

function resaltarSugerencia(nuevo) {
    const opciones = [...sugerencias.querySelectorAll('li')];
    if (!opciones.length) return;
    indiceActivo = (nuevo + opciones.length) % opciones.length;
    opciones.forEach((o, i) => o.classList.toggle('activa', i === indiceActivo));
    campoJuego.setAttribute('aria-activedescendant', opciones[indiceActivo].id);
    opciones[indiceActivo].scrollIntoView({ block: 'nearest' });
}

// Al entrar al campo se selecciona el texto: si escribes, reemplazas el juego sin tener que borrarlo
let recienEnfocado = false;
campoJuego.addEventListener('focus', () => {
    campoJuego.select();
    recienEnfocado = true;
    mostrarSugerencias();
});
// Al soltar el clic el navegador quitaría la selección; se evita solo en ese primer clic
campoJuego.addEventListener('mouseup', (e) => {
    if (recienEnfocado) e.preventDefault();
    recienEnfocado = false;
});
// Un clic con el campo ya activo también vuelve a mostrar la lista
campoJuego.addEventListener('click', () => {
    if (sugerencias.classList.contains('d-none')) mostrarSugerencias();
});
campoJuego.addEventListener('input', () => { mostrarSugerencias(); alCambiar(); });
campoJuego.addEventListener('keydown', (e) => {
    if (sugerencias.classList.contains('d-none')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); resaltarSugerencia(indiceActivo + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); resaltarSugerencia(indiceActivo - 1); }
    if (e.key === 'Enter' && indiceActivo >= 0) {
        e.preventDefault();
        elegirJuego(sugerencias.querySelectorAll('li')[indiceActivo].dataset.nombre);
    }
    if (e.key === 'Escape') ocultarSugerencias();
});

// mousedown para elegir antes de que el campo pierda el foco
sugerencias.addEventListener('mousedown', (e) => {
    const opcion = e.target.closest('li');
    if (!opcion) return;
    e.preventDefault();
    elegirJuego(opcion.dataset.nombre);
});
campoJuego.addEventListener('blur', ocultarSugerencias);

// ----- Encabezado, ícono y vista previa -----
function actualizarJuego() {
    const juego = juegoConocido(campoJuego.value);
    const encabezado = document.getElementById('encabezadoGuia');
    const previa = document.getElementById('previaEstandarte');

    for (const id of ['iconoEncabezado', 'iconoJuego', 'previaIcono']) {
        const img = document.getElementById(id);
        img.classList.toggle('d-none', !juego);
        if (juego) img.src = `../../img/juegos/${juego.icono}`;
    }

    // Si el juego tiene estandarte, se usa de fondo en el encabezado y en la vista previa
    for (const el of [encabezado, previa]) {
        if (juego?.estandarte) {
            el.style.setProperty('--estandarte', `url('/img/estandartes/${juego.estandarte}')`);
            el.style.setProperty('--posicion', juego.posicion || 'center');
            el.classList.add('con-estandarte');
        } else {
            el.classList.remove('con-estandarte');
        }
    }

    const nombre = juego?.nombre || campoJuego.value.trim();
    document.getElementById('juegoEncabezado').textContent = nombre || 'Nueva guía';
    document.getElementById('previaJuego').textContent = nombre || 'Juego';
}

function actualizarTodo() {
    const datos = leerFormulario();
    actualizarJuego();

    document.getElementById('contadorTitulo').textContent = `${campoTitulo.value.length} / 120`;
    document.getElementById('previaTitulo').textContent = datos.titulo || 'Título de tu guía';

    const categoria = document.getElementById('previaCategoria');
    categoria.textContent = datos.categoria;
    categoria.classList.toggle('d-none', !datos.categoria);

    const dificultad = document.getElementById('previaDificultad');
    dificultad.textContent = datos.dificultad;
    dificultad.className = `badge bg-${COLOR_DIFICULTAD[datos.dificultad] || 'secondary'}${datos.dificultad ? '' : ' d-none'}`;

    mostrarCategoriaElegida();
    ajustarAltoContenido();

    // Contenido: contador hacia el mínimo
    const largo = campoContenido.value.trim().length;
    document.getElementById('contador').textContent = largo < MINIMO_CONTENIDO
        ? `${largo} / ${MINIMO_CONTENIDO} caracteres mínimos`
        : `${largo} caracteres`;

    document.getElementById('previaContenido').textContent = datos.contenido
        ? (datos.contenido.length > 280 ? datos.contenido.slice(0, 280) + '…' : datos.contenido)
        : 'Aquí aparecerá el contenido mientras escribes.';
}

// ----- Categoría: buscador con palabras clave y lista desplegable -----
function abrirPanelCategoria(abrir) {
    panelCategoria.classList.toggle('abierto', abrir);
    panelCategoria.setAttribute('aria-hidden', !abrir);
    botonCategoria.setAttribute('aria-expanded', abrir);
    botonCategoria.setAttribute('aria-label', abrir ? 'Ocultar categorías' : 'Ver todas las categorías');
    panelCategoria.querySelectorAll('input').forEach(r => r.tabIndex = abrir ? 0 : -1);
}

// Muestra solo las categorías que se parecen a lo escrito, de la más parecida a la menos
function filtrarCategorias() {
    const resultados = buscarCategorias(buscarCategoria.value);
    const orden = new Map(resultados.map((r, i) => [r.nombre, i]));

    panelCategoria.querySelectorAll('.opcion-cat').forEach(opcion => {
        const posicion = orden.get(opcion.dataset.nombre);
        opcion.classList.toggle('d-none', posicion === undefined);
        opcion.style.order = posicion ?? 999;
    });
    document.getElementById('sinCategoria').classList.toggle('d-none', resultados.length > 0);
    return resultados;
}

// La categoría elegida se ve como una etiqueta con ✕, sin tener que abrir la lista
function mostrarCategoriaElegida() {
    const elegida = valorRadio('categoria');
    document.getElementById('categoriaElegida').innerHTML = elegida ? `
        <span class="chip-categoria">
            ${escaparTexto(elegida)}
            <button type="button" id="quitarCategoria" aria-label="Quitar ${escaparTexto(elegida)}">&times;</button>
        </span>` : '';
}

buscarCategoria.addEventListener('input', () => {
    filtrarCategorias();
    abrirPanelCategoria(true);
});

// Enter elige la categoría más parecida
buscarCategoria.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const [primera] = filtrarCategorias();
    if (primera) {
        marcarRadio('categoria', primera.nombre);
        alCategoriaElegida();
    }
});

botonCategoria.addEventListener('click', () => {
    filtrarCategorias();
    abrirPanelCategoria(!panelCategoria.classList.contains('abierto'));
});

function alCategoriaElegida() {
    buscarCategoria.value = '';
    filtrarCategorias();
    abrirPanelCategoria(false);
    alCambiar();
}

panelCategoria.addEventListener('change', alCategoriaElegida);

document.getElementById('categoriaElegida').addEventListener('click', (e) => {
    if (e.target.id !== 'quitarCategoria') return;
    formGuia.querySelectorAll('input[name="categoria"]').forEach(r => r.checked = false);
    alCambiar();
    buscarCategoria.focus();
});

// ----- Contenido: empieza pequeño y crece con el texto -----
function ajustarAltoContenido() {
    campoContenido.style.height = 'auto';
    campoContenido.style.height = `${campoContenido.scrollHeight + 2}px`;
}

// ----- Validación con mensajes propios -----
function validar() {
    const datos = leerFormulario();
    const reglas = [
        ['errorJuego', campoJuego, !datos.juego],
        ['errorTitulo', campoTitulo, datos.titulo.length < 5],
        ['errorCategoria', buscarCategoria, !datos.categoria],
        ['errorDificultad', null, !datos.dificultad],
        ['errorContenido', campoContenido, datos.contenido.length < MINIMO_CONTENIDO]
    ];

    let primero = null;
    for (const [idError, campo, falla] of reglas) {
        document.getElementById(idError).classList.toggle('d-none', !falla);
        if (campo !== buscarCategoria) campo?.classList.toggle('is-invalid', falla);
        if (falla && !primero) primero = campo || document.querySelector('input[name="dificultad"]');
    }

    if (primero) {
        primero.focus();
        primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return !primero;
}

// ----- Borrador automático (solo al crear) -----
let esperaBorrador;
function guardarBorrador() {
    if (idGuia) return;
    clearTimeout(esperaBorrador);
    esperaBorrador = setTimeout(() => {
        try {
            const datos = leerFormulario();
            const vacio = !Object.values(datos).some(Boolean);
            if (vacio) localStorage.removeItem(CLAVE_BORRADOR);
            else localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(datos));
            document.getElementById('estadoBorrador').textContent = vacio ? '' : 'Borrador guardado';
        } catch (error) {
            // Sin almacenamiento disponible: simplemente no se guarda el borrador
        }
    }, 600);
}

function leerBorrador() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_BORRADOR));
    } catch (error) {
        return null;
    }
}

function borrarBorrador() {
    try { localStorage.removeItem(CLAVE_BORRADOR); } catch (error) { }
}

function alCambiar() {
    hayCambios = true;
    actualizarTodo();
    guardarBorrador();
    quitarErroresCorregidos();
}

// Quita el mensaje y la marca roja de los campos que ya cumplen su regla
function quitarErroresCorregidos() {
    const datos = leerFormulario();
    const corregidos = [
        ['errorJuego', campoJuego, datos.juego],
        ['errorTitulo', campoTitulo, datos.titulo.length >= 5],
        ['errorCategoria', null, datos.categoria],
        ['errorDificultad', null, datos.dificultad],
        ['errorContenido', campoContenido, datos.contenido.length >= MINIMO_CONTENIDO]
    ];
    for (const [idError, campo, bien] of corregidos) {
        if (!bien) continue;
        document.getElementById(idError).classList.add('d-none');
        campo?.classList.remove('is-invalid');
    }
}

formGuia.addEventListener('input', (e) => { if (e.target !== campoJuego) alCambiar(); });
formGuia.addEventListener('change', (e) => {
    if (e.target.type === 'radio') alCambiar();
});

document.getElementById('recuperarBorrador').addEventListener('click', () => {
    llenarFormulario(leerBorrador() || {});
    document.getElementById('avisoBorrador').classList.add('d-none');
});

document.getElementById('descartarBorrador').addEventListener('click', () => {
    borrarBorrador();
    document.getElementById('avisoBorrador').classList.add('d-none');
});

// Avisa antes de salir si hay cambios sin publicar
window.addEventListener('beforeunload', (e) => {
    if (hayCambios && !enviando) e.preventDefault();
});

// ----- Modo edición: carga la guía y revisa que sea del usuario -----
async function cargarParaEditar() {
    document.title = 'GNotes | Editar guía';
    document.getElementById('tituloPagina').textContent = 'Editar guía';
    document.getElementById('botonGuardar').textContent = 'Guardar cambios';
    document.getElementById('botonCancelar').href = `guia.html?id=${idGuia}`;

    const { ok, datos } = await llamarAPI(`${API.GUIAS}/${idGuia}`);

    if (!ok || !datos.esAutor) {
        formGuia.closest('.row').classList.add('d-none');
        mostrarAlerta('alerta', 'warning', 'No encontramos esa guía o no puedes editarla.');
        return;
    }

    llenarFormulario(datos);
}

// ----- Publicar -----
formGuia.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validar()) return;

    const boton = document.getElementById('botonGuardar');
    const textoBoton = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Guardando...';

    try {
        const datos = leerFormulario();
        const { ok, datos: resultado } = idGuia
            ? await llamarAPI(`${API.GUIAS}/${idGuia}`, 'PUT', datos)
            : await llamarAPI(API.GUIAS, 'POST', datos);

        if (!ok) {
            mostrarAlerta('alerta', 'danger', /sancionada|emojis/.test(resultado?.message || '')
                ? resultado.message
                : 'No pudimos guardar la guía. Revisa los datos e inténtalo de nuevo.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        enviando = true;
        borrarBorrador();
        const guia = resultado.datos || resultado;
        const aviso = guia.estado === 'pendiente' ? '&aviso=pendiente' : '';
        window.location.href = `guia.html?id=${guia._id}${aviso}`;
    } catch (error) {
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
    } finally {
        boton.disabled = false;
        boton.textContent = textoBoton;
    }
});

// ----- Inicio -----
if (idGuia) {
    cargarParaEditar();
} else {
    // Si se llega desde un juego (guia-form.html?juego=...), ya viene elegido
    const juegoInicial = new URLSearchParams(location.search).get('juego');
    if (juegoInicial) campoJuego.value = juegoInicial;
    if (leerBorrador()) document.getElementById('avisoBorrador').classList.remove('d-none');
}
abrirPanelCategoria(false);
filtrarCategorias();
actualizarTodo();
