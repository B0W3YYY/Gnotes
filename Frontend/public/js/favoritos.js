// ===== Mis guías favoritas =====
async function cargarFavoritos() {
    mostrarCargando('listaFavoritos');
    const { ok, datos } = await llamarAPI(`${API.USUARIOS}/perfil/favoritos`);

    if (!ok) {
        document.getElementById('listaFavoritos').innerHTML = '';
        mostrarAlerta('alerta', 'danger', MENSAJE_FALLA);
        return;
    }

    document.getElementById('listaFavoritos').innerHTML = datos.map(g => tarjetaGuia({ ...g, totalVotos: g.votos?.length })).join('');
    document.getElementById('sinFavoritos').classList.toggle('d-none', datos.length > 0);
}

cargarFavoritos();
