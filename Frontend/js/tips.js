// ===== Buscar tips =====
// Tips de ejemplo (después vendrán de la API)
const TIPS = [
    { juego: 'Minecraft', titulo: 'Sobrevive tu primera noche', categoria: 'Supervivencia', dificultad: 'Fácil' },
    { juego: 'Fortnite', titulo: 'Construye rápido en combate', categoria: 'Competitivo', dificultad: 'Media' },
    { juego: 'Elden Ring', titulo: 'Cómo vencer a Margit', categoria: 'Jefes', dificultad: 'Difícil' },
    { juego: 'Zelda: Tears of the Kingdom', titulo: 'Encuentra todos los santuarios', categoria: 'Exploración', dificultad: 'Media' },
    { juego: 'League of Legends', titulo: 'Farmeo eficiente en línea', categoria: 'Competitivo', dificultad: 'Media' },
    { juego: 'Stardew Valley', titulo: 'Gana dinero el primer año', categoria: 'Estrategia', dificultad: 'Fácil' }
];

const COLOR_DIFICULTAD = { 'Fácil': 'success', 'Media': 'warning', 'Difícil': 'danger' };

function mostrarTips(lista) {
    document.getElementById('listaTips').innerHTML = lista.map(tip => `
        <div class="col-md-6 col-lg-4">
            <div class="card tarjeta h-100 p-3">
                <small class="text-muted">${tip.juego}</small>
                <h2 class="h5 mt-1">${tip.titulo}</h2>
                <div class="mt-auto">
                    <span class="badge bg-secondary">${tip.categoria}</span>
                    <span class="badge bg-${COLOR_DIFICULTAD[tip.dificultad]}">${tip.dificultad}</span>
                </div>
            </div>
        </div>`).join('');

    document.getElementById('sinResultados').classList.toggle('d-none', lista.length > 0);
}

document.getElementById('buscador').addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    mostrarTips(TIPS.filter(tip =>
        `${tip.juego} ${tip.titulo} ${tip.categoria}`.toLowerCase().includes(texto)
    ));
});

mostrarTips(TIPS);
