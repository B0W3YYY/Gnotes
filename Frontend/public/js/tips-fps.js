// Tips extra de técnica de shooters (strafe, utilidad, peeks, off-angles). Se agregan a los existentes.
(function (extra) {
    window.TIPS_JUEGOS = window.TIPS_JUEGOS || {};
    Object.keys(extra).forEach(juego => {
        window.TIPS_JUEGOS[juego] = (window.TIPS_JUEGOS[juego] || []).concat(extra[juego]);
    });
})({
    "VALORANT": [
        {
            "titulo": "Counter-strafe en cada jiggle",
            "texto": "Al soltar A o D tu agente sigue deslizándose y las balas salen imprecisas. Pulsa un instante la tecla contraria a tu movimiento para frenar en seco y dispara justo en ese momento. Combínalo con jiggle peeks: asómate, frena con la tecla opuesta y haz tap a la cabeza antes de volver a cubrirte.",
            "imagen": "https://cdn.sanity.io/images/ccckgjf9/production/4d0782abc19b9fb71ae7efb745e96a7441fb7967-480x854.gif",
            "alt": "Comparación de disparos con y sin counter-strafing en VALORANT",
            "fuente": "https://dignitas.gg/articles/positioning-and-movement-101-the-dos-and-don-ts-of-peeking-and-holding-angles",
            "ancho": 480,
            "alto": 854,
            "nivel": "pro"
        },
        {
            "titulo": "Dardo de la jirafa en B de Ascent",
            "texto": "Con Sova en ataque en Ascent, ponte en el extremo izquierdo de la entrada de B Main y apunta al ojo de la jirafa pintada sobre Market. Carga el Recon Bolt al máximo y suéltalo: escanea Market, la zona del interruptor de la puerta y las dos líneas del sitio B, ideal antes de un rush.",
            "imagen": "https://cdn.oneesports.gg/wp-content/uploads/2024/03/valorant_the_famous_giraffe_recon_dart_at_b_site_sova_lineup.jpg",
            "alt": "Posición y punto de mira del lineup de la jirafa de Sova en Ascent",
            "fuente": "https://www.oneesports.gg/valorant/best-valorant-sova-lineups-ascent/",
            "ancho": 1600,
            "alto": 900,
            "nivel": "pro"
        },
        {
            "titulo": "Jiggle primero, wide swing después",
            "texto": "Haz un jiggle peek para que el rival acerque su mira a la esquina esperando otro jiggle y, a continuación, sal con un wide swing: su mira queda mal colocada. Para sostener un ángulo, elige uno con retirada: en B Long de Icebox es mejor estar pegado a la caja verde junto a Tube, desde donde puedes retroceder, que en un ángulo abierto sin salida.",
            "imagen": "https://cdn.sanity.io/images/ccckgjf9/production/9671aaf90e1c970ec0f65c580d0a6cb5acddbe3d-1717x985.png",
            "alt": "Dos posiciones para defender B Long en Icebox",
            "fuente": "https://prosettings.net/blog/how-to-peek-in-valorant/",
            "ancho": 1717,
            "alto": 985,
            "nivel": "pro"
        }
    ],
    "Counter-Strike 2": [
        {
            "titulo": "Comprueba tu counter-strafe con cl_showpos",
            "texto": "Para un counter-strafe a la derecha pulsa D, suéltala y pulsa A a la vez que disparas; tu velocidad cae a cero casi al instante. Activa cl_showpos 1 en un servidor de práctica y mira el valor vel (velocidad) para comprobar que frenas del todo antes de cada disparo.",
            "imagen": "https://profilerr.net/static/content/thumbs/880x/4/c7/oue467-817ec64f73ec981c5f0e59edf3f42c74.png",
            "alt": "Valores de posición y velocidad de cl_showpos en CS2",
            "fuente": "https://profilerr.net/strafing-and-counter-strafing-guide-for-cs-go",
            "ancho": 880,
            "alto": 525,
            "nivel": "pro"
        },
        {
            "titulo": "Humo a Window desde T spawn en Mirage",
            "texto": "Ponte a la izquierda de la papelera de T spawn, apunta a la esquina superior derecha de la puerta, pulsa D un instante y haz un jump throw. El humo tapa Window, desde donde el AWP de los CT controla mid, y se usa al ejecutar A o tomar mid.",
            "imagen": "https://editors.charlieintel.com/wp-content/uploads/2023/09/28/CS2-Window-Smoke-Mirage.jpg",
            "alt": "Punto de mira del lineup de humo a Window en Mirage",
            "fuente": "https://charlieintel.com/counter-strike/cs2-mirage-best-smoke-grenade-flash-lineups-276213",
            "ancho": 1103,
            "alto": 616,
            "nivel": "pro"
        },
        {
            "titulo": "Jiggle peek, luego wide swing o prefire",
            "texto": "Para descubrir a un rival que sostiene un ángulo, entra y sal de la esquina haciendo strafes cortos (jiggle peek). Si lo ves, haz un wide swing, frena con counter-strafe y dispara, o vuelve a salir con un tap al borde de la esquina. A tu favor juegan los off-angles, como subirte a las cajas de B en Mirage para vigilar Apartments: casi nadie lo pre-apunta.",
            "imagen": "https://profilerr.net/static/content/thumbs/880x/6/f4/bbfczw-7d4be6ac8df51284cb969d316e8cdf46.png",
            "alt": "Jugador asomándose a una esquina en CS2",
            "fuente": "https://profilerr.net/strafing-and-counter-strafing-guide-for-cs-go",
            "ancho": 880,
            "alto": 457,
            "nivel": "pro"
        }
    ],
    "Tom Clancy's Rainbow Six Siege": [
        {
            "titulo": "Quick peek con inclinación y strafe",
            "texto": "Para un quick peek a la derecha pulsa E + D y vuelve con E + A; a la izquierda, Q + A y vuelve con Q + D. Sirve para ver si alguien sostiene el ángulo. Si lo ves, no vuelvas a salir igual: cambia de altura agachándote o retrasa el siguiente peek, porque te esperarán con prefire.",
            "imagen": "https://cdn.craft.cloud/0c76127f-918d-4d38-bd51-cd994afa278b/assets/images/article/How-To-Lean-In-Rainbow-Six-Siege2.webp",
            "alt": "Operador apuntando con mira mientras se asoma a una esquina en Siege",
            "fuente": "https://theglobalgaming.com/gaming/how-to-lean-rainbow-six-siege",
            "ancho": 1200,
            "alto": 623,
            "nivel": "pro"
        },
        {
            "titulo": "Cámara de Valkyrie en Warehouse (Nighthaven Labs)",
            "texto": "En Nighthaven Labs coloca una Black Eye junto a la ventana triple de Warehouse: ve a los atacantes que aparecen en Generator. Desde la barricada de Warehouse tienes ángulos a toda la zona de Generator, así que la cámara sirve para cantar spawn peeks.",
            "imagen": "https://gdm-universal-media.b-cdn.net/siege/85187e7ce7f34c3f834a99539b0338d73eb725af-3840x1080.png?width=3840",
            "alt": "Vista de la cámara de Valkyrie desde Warehouse y su colocación en Nighthaven Labs",
            "fuente": "https://siege.gg/news/these-are-the-best-valkyrie-camera-spots-on-nighthaven-labs",
            "ancho": 3840,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Inclínate hacia el peek y usa pixel angles",
            "texto": "Si te asomas desde el lado izquierdo de una puerta, inclínate a la derecha (y al revés). Si te inclinas hacia el lado contrario, enseñas medio cuerpo antes de que tu mira pase el marco. Al defender, túmbate un poco a un lado de la entrada: es un off-angle muy difícil de acertar para quien entra apuntando.",
            "imagen": "https://cdn.craft.cloud/0c76127f-918d-4d38-bd51-cd994afa278b/assets/images/article/How-To-Lean-In-Rainbow-Six-Siege4.webp",
            "alt": "Operador inclinado apuntando junto al marco de una puerta en Siege",
            "fuente": "https://rainbowsix.fandom.com/wiki/Rank_Up_Intermediate_Series:_Mastering_Movement",
            "ancho": 1200,
            "alto": 846,
            "nivel": "pro"
        }
    ],
    "PUBG: BATTLEGROUNDS": [
        {
            "titulo": "Strafe con A/D y frena para rociar",
            "texto": "Moverte mientras disparas abre la dispersión de las balas. Haz strafes con A y D para que el rival tenga que seguirte, pero en el medio segundo en que sueltas la ráfaga deja de moverte: las balas que impactan son las que disparas quieto. Agacharte (C) al empezar el duelo hace que su retroceso pase por encima.",
            "imagen": "https://static.wikia.nocookie.net/battlegrounds_gamepedia_en/images/9/90/Control_map.png/revision/latest?cb=20180908061122",
            "alt": "Guía oficial de teclas de PUBG con movimiento, inclinación y agacharse",
            "fuente": "https://gamertagmythras.com/blog/pubg-battlegrounds/pubg-drop-shot-jiggle-peek-guide",
            "ancho": 1920,
            "alto": 1200,
            "nivel": "pro"
        },
        {
            "titulo": "El humo se disipa antes de lo que parece",
            "texto": "El sonido de la granada de humo se corta 10 segundos antes de que desaparezca, y a partir de ese momento la cortina empieza a desvanecerse: puedes empezar a ser visible a los 5 segundos aunque sigas dentro. Cuando deje de sonar, termina la reanimación o sal del humo en lugar de quedarte esperando.",
            "imagen": "https://static.wikia.nocookie.net/battlegrounds_gamepedia_en/images/7/7d/Smoke_Grenade_New.jpg/revision/latest?cb=20170317184046",
            "alt": "Granada de humo en el inventario de PUBG",
            "fuente": "https://pubg.fandom.com/wiki/Smoke_Grenade",
            "ancho": 300,
            "alto": 391,
            "nivel": "pro"
        },
        {
            "titulo": "Asómate con la cámara en tercera persona",
            "texto": "En partidas en tercera persona la cámara queda por encima de tu personaje: agachado detrás de un muro, como los de la base militar de Sosnovka en Erangel, ves por encima y por las esquinas sin exponerte. Desde ahí sostén un off-angle con la mira a la altura de la cabeza y dispara solo cuando el rival no sepa dónde estás.",
            "imagen": "https://static.wikia.nocookie.net/battlegrounds_gamepedia_en/images/8/8a/Third-person-wall.png/revision/latest?cb=20170725174424",
            "alt": "Jugador agachado detrás de un muro en Sosnovka con la cámara en tercera persona",
            "fuente": "https://pubg.fandom.com/wiki/Person_View",
            "ancho": 1920,
            "alto": 999,
            "nivel": "pro"
        }
    ],
    "Delta Force": [
        {
            "titulo": "El ascensor de Zero Dam tiene dos entradas",
            "texto": "Desde la Season Echo, la extracción del ascensor en Zero Dam tiene un segundo pasaje para flanquear, menos cobertura para quien defiende dentro y ángulos de peek más amplios desde fuera. Si atacas, no entres por una sola puerta: presiona desde las dos y aprovecha los ángulos exteriores.",
            "imagen": "https://media.allpatchnotes.com/media/sha256/28/28b5fd84cfcd1f02a5a1c2234e65b0ead0b771aee676079adffe1e326ae37e30.webp",
            "alt": "Interior del ascensor de extracción de Zero Dam en Delta Force",
            "fuente": "https://allpatchnotes.com/g/delta-force-hawk-ops/zero-dam-gets-a-major-redesign",
            "ancho": 1440,
            "alto": 810,
            "nivel": "pro"
        },
        {
            "titulo": "Los pájaros delatan a quien acampa en el juncal",
            "texto": "El nuevo juncal junto al agua en Zero Dam sirve como off-angle, pero si alguien se queda en él asusta a los pájaros. Si ves una bandada salir de golpe de la hierba, hay alguien ahí. Además, al tumbarte de espaldas a una pared tu operador ya recoge las piernas, así que no se ven al otro lado.",
            "imagen": "https://media.allpatchnotes.com/media/sha256/e4/e41d967240e11e371b32ced7a6891b37086a5bdac9370932f1c2b2ffcf23de7b.webp",
            "alt": "Juncal junto al agua en Zero Dam",
            "fuente": "https://allpatchnotes.com/g/delta-force-hawk-ops/zero-dam-gets-a-major-redesign",
            "ancho": 1440,
            "alto": 810,
            "nivel": "pro"
        }
    ],
    "Apex Legends": [
        {
            "titulo": "Digital Threat contra el humo",
            "texto": "Las miras Digital Threat (calidad legendaria) marcan a los enemigos con una silueta roja aunque estén dentro del humo de Bangalore o del gas de Caustic. Combínala con humo propio: tú ves a través y el rival no.",
            "imagen": "https://static.wikia.nocookie.net/apexlegends_gamepedia_en/images/1/16/1x_DigitalThreat_Highlight.jpg/revision/latest?cb=20200514213146",
            "alt": "Mira 1x Digital Threat resaltando a un enemigo dentro del humo",
            "fuente": "https://apexlegends.fandom.com/wiki/Optic",
            "ancho": 1366,
            "alto": 768,
            "nivel": "pro"
        },
        {
            "titulo": "Francotirador a través del humo",
            "texto": "La 4x-10x Digital Sniper Threat también resalta enemigos en humo y gas, pero solo aparece en las cápsulas de suministro. Si la consigues, defiende desde lejos y usa el humo como pantalla para disparar sin que te vean.",
            "imagen": "https://static.wikia.nocookie.net/apexlegends_gamepedia_en/images/9/92/ADS-4x-10x_4x_Highlight.png/revision/latest?cb=20220802210834",
            "alt": "Vista por la mira 4x-10x Digital Sniper Threat con un enemigo resaltado en el humo",
            "fuente": "https://apexlegends.fandom.com/wiki/Optic",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Rompe o abre puertas al instante",
            "texto": "Una puerta normal cae con dos golpes cuerpo a cuerpo o con un solo explosivo (granada de fragmentación o Arc Star), y la termita la destruye en 2 segundos. Si disparas al pomo con Wingman, 30-30, L-STAR o un rifle de francotirador, se abre de golpe sin acercarte.",
            "imagen": "https://static.wikia.nocookie.net/apexlegends_gamepedia_en/images/4/40/Regular_doors.png/revision/latest?cb=20230222043509",
            "alt": "Puertas estándar en Storm Point",
            "fuente": "https://apexlegends.fandom.com/wiki/Door",
            "ancho": 961,
            "alto": 763,
            "nivel": "pro"
        }
    ],
    "Call of Duty": [
        {
            "titulo": "Usa al enemigo como escudo",
            "texto": "Si llegas por la espalda de un rival puedes agarrarlo como escudo humano y seguir disparando mientras él recibe las balas. El agarrado gana una barra de vida nueva, así que aguanta daño que te mataría a ti solo.",
            "imagen": "https://static.wikia.nocookie.net/callofduty/images/e/e4/Multiplayer_Promo40_BO7.jpg/revision/latest?cb=20251001000615",
            "alt": "Jugador de Black Ops 7 usando a un enemigo como escudo humano",
            "fuente": "https://callofduty.fandom.com/wiki/Body_Shield",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Remate con granada desde el escudo",
            "texto": "Con un enemigo agarrado como escudo, pulsa el botón de granada letal para hacer el remate con granada. La estación de combate cercano del Training Course de Black Ops 7 enseña el ejecutor, el escudo humano y este remate.",
            "imagen": "https://static.wikia.nocookie.net/callofduty/images/4/4f/TrainingCourse_Multiplayer_CQC_BO7.png/revision/latest?cb=20260424122955",
            "alt": "Estación de combate cercano del Training Course de Black Ops 7",
            "fuente": "https://callofduty.fandom.com/wiki/Training_Course",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Estimulante con Overclock Cleanse",
            "texto": "En Black Ops 7 el Stim Shot cura heridas al instante y admite Overclocks. Cleanse le añade quitar efectos negativos como aturdimiento o cegado, y Combat Performance Boost te da velocidad extra para reposicionarte.",
            "imagen": "https://static.wikia.nocookie.net/callofduty/images/9/97/Stim_Shot_Arsenal_BO7.png/revision/latest?cb=20251013022345",
            "alt": "Stim Shot de Black Ops 7 en el arsenal",
            "fuente": "https://callofduty.fandom.com/wiki/Stim_Shot",
            "ancho": 404,
            "alto": 628,
            "nivel": "pro"
        }
    ],
    "Overwatch 2": [
        {
            "titulo": "Muro de hielo para dividir peleas",
            "texto": "El Ice Wall de Mei son 5 pilares de 250 de vida cada uno, hasta 8 m de ancho y 25 m de alcance, que duran hasta 5 segundos. Úsalo para cortar líneas de visión de francotiradores o separar a un tanque de sus apoyos; pulsa la tecla otra vez antes de lanzarlo para girarlo en paralelo.",
            "imagen": "https://blz-contentstack-images.akamaized.net/v3/assets/blt2477dcaf4ebd440c/blt57f7de21edf67a89/6339068d8537f87bfbcdc424/MEI_ICEWALL.jpg",
            "alt": "Muro de hielo de Mei bloqueando una calle",
            "fuente": "https://overwatch.fandom.com/wiki/Mei",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Empuja al vacío con Soundwave",
            "texto": "El Soundwave de Lúcio (7 m, enfriamiento de 5 s) empuja en la dirección en que miras y deja al enemigo sin control de movimiento 0,45 s. Junto a un precipicio es una muerte ambiental; apunta hacia arriba o abajo para cambiar cuánto lo lanzas.",
            "imagen": "https://blz-contentstack-images.akamaized.net/v3/assets/blt2477dcaf4ebd440c/blt8e3d993c6ed7f02f/6339061b64fe5a7d4481a084/LUCIO_SOUNDWAVE.jpg",
            "alt": "Lúcio lanzando Soundwave contra un enemigo junto a una barandilla",
            "fuente": "https://overwatch.fandom.com/wiki/Environmental_kill",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Mina venenosa para cubrir el flanco",
            "texto": "La Venom Mine de Widowmaker se pega a casi cualquier superficie y se arma en 1,4 s. Cuando un enemigo la activa lo ves a través de las paredes un momento, así que colócala en la ruta de flanqueo para que te avise mientras apuntas a otro lado.",
            "imagen": "https://blz-contentstack-images.akamaized.net/v3/assets/blt2477dcaf4ebd440c/blt7d577bd3f76a485b/633908f9e3c2a2741688cbe9/WIDOWMAKER_VENOMMINE.jpg",
            "alt": "Widowmaker colocando una Venom Mine en el suelo",
            "fuente": "https://overwatch.fandom.com/wiki/Widowmaker",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        }
    ],
    "Battlefield 6": [
        {
            "titulo": "Escalera de asalto para ganar altura",
            "texto": "El Tarantula ALX del Asalto se despliega como escalera para subir a posiciones altas o, según el ángulo, como rampa o puente entre edificios. Úsalo para llegar a tejados y ángulos que el enemigo no está vigilando.",
            "imagen": "https://static.wikia.nocookie.net/battlefield/images/1/17/BF6.Assault_Ladder_Ramp.jpg/revision/latest?cb=20251129073516",
            "alt": "Escalera de asalto Tarantula ALX desplegada como rampa",
            "fuente": "https://battlefield.fandom.com/wiki/Tarantula_ALX",
            "ancho": 3840,
            "alto": 2160,
            "nivel": "pro"
        },
        {
            "titulo": "Humo que borra los marcados",
            "texto": "El M320A1 SMK del Apoyo dispara granadas de humo de impacto. Además de tapar la vista, impide marcar objetivos y elimina las marcas de detección de toda la infantería dentro de la nube.",
            "imagen": "https://static.wikia.nocookie.net/battlefield/images/d/df/BF6.M320_SMK_ADS.jpg/revision/latest?cb=20251116061129",
            "alt": "Apuntando con el lanzagranadas M320A1 SMK",
            "fuente": "https://battlefield.fandom.com/wiki/M320",
            "ancho": 3840,
            "alto": 2160,
            "nivel": "pro"
        },
        {
            "titulo": "Flash antes de entrar a una sala",
            "texto": "La M84 del Asalto ciega y ensordece; el efecto depende de la distancia y de si el enemigo mira la explosión. La MK 141 de aturdimiento, en cambio, impide apuntar y esprintar un momento: elige según si vas a entrar o a retener.",
            "imagen": "https://static.wikia.nocookie.net/battlefield/images/4/41/BF6.Flash_Grenade_Throwing.jpg/revision/latest?cb=20251206073241",
            "alt": "Soldado lanzando una granada cegadora M84",
            "fuente": "https://battlefield.fandom.com/wiki/Flashbang",
            "ancho": 3840,
            "alto": 2160,
            "nivel": "pro"
        }
    ],
    "THE FINALS": [
        {
            "titulo": "Humo para quitar los contornos",
            "texto": "La granada de humo bloquea la vista y también los contornos de los enemigos. Clic principal para tiro largo y secundario para tiro bajo; las explosiones pueden mover la nube, y el humo apaga el fuego cercano.",
            "imagen": "https://www.thefinals.wiki/w/images/d/d5/Smoke_Grenade.png",
            "alt": "Granada de humo de THE FINALS",
            "fuente": "https://www.thefinals.wiki/wiki/Smoke_Grenade",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Jump Pad inclinado para cruzar",
            "texto": "El Jump Pad de la clase Media se pega a suelos, paredes y techos y lanza en la dirección a la que mira. Colocado en una superficie inclinada te manda lejos por la arena, y también lanza objetos como la estación de cobro.",
            "imagen": "https://www.thefinals.wiki/w/images/4/4c/Jump_Pad.png",
            "alt": "Jump Pad de THE FINALS",
            "fuente": "https://www.thefinals.wiki/wiki/Jump_Pad",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Sonar antes de entrar",
            "texto": "La granada sonar (Ligera y Media) emite pulsos que atraviesan paredes y revelan a tu equipo a los rivales en un área grande. Lánzala antes de asaltar un objetivo; el enemigo ve un aviso y puede destruirla, así que no te demores.",
            "imagen": "https://www.thefinals.wiki/w/images/e/e8/Mov_l_sonargrenade.gif",
            "alt": "Jugador lanzando una granada sonar en THE FINALS",
            "fuente": "https://www.thefinals.wiki/wiki/Sonar_Grenade",
            "ancho": 348,
            "alto": 196,
            "nivel": "pro"
        }
    ],
    "Marvel Rivals": [
        {
            "titulo": "Escupe a tiempo con Jeff",
            "texto": "Con It's Jeff! tienes 6 segundos para elegir dónde atacar y luego otros 6 para moverte con los tragados dentro antes de escupirlos solo. Puedes escupir enemigos y aliados por separado y antes de tiempo: llévalos a tu equipo o a un borde.",
            "imagen": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2767030/e2dfc14dd3e15094f0ba184c9ec48d9b65f8a0cd/ss_e2dfc14dd3e15094f0ba184c9ec48d9b65f8a0cd.jpg",
            "alt": "Jeff the Land Shark tragándose a Spider-Man con su definitiva",
            "fuente": "https://marvelrivals.fandom.com/wiki/Jeff_the_Land_Shark",
            "ancho": 3840,
            "alto": 2160,
            "nivel": "pro"
        },
        {
            "titulo": "Cellular Corrosion de Venom",
            "texto": "El disparo secundario de Venom engancha tentáculos a los enemigos cercanos, los ralentiza y, si siguen en rango, les hace mucho daño tras un momento. Combinado con su definitiva puede matar a héroes de 250 de vida; si te atrapa a ti, aléjate para romperlo.",
            "imagen": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2767030/87436ac6aa79c7de11e46302eebf13bcd0824a28/ss_87436ac6aa79c7de11e46302eebf13bcd0824a28.jpg",
            "alt": "Venom atrapando a varios enemigos con sus tentáculos",
            "fuente": "https://marvelrivals.fandom.com/wiki/Venom",
            "ancho": 3840,
            "alto": 2160,
            "nivel": "pro"
        },
        {
            "titulo": "Desvía proyectiles con el escudo del Capi",
            "texto": "Living Legend de Captain America bloquea golpes y proyectiles y los desvía con el 50 % del daño, incluso algunas definitivas. Apuntado al suelo bloquea por completo ciertas definitivas de área, pero no frena el daño de salpicadura y tiene 1 s de enfriamiento al bajarlo.",
            "imagen": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2767030/a5a9bed9a945b253b89f2d0177a6b828389d305b/ss_a5a9bed9a945b253b89f2d0177a6b828389d305b.jpg",
            "alt": "Captain America bloqueando ataques con su escudo",
            "fuente": "https://marvelrivals.fandom.com/wiki/Captain_America",
            "ancho": 2560,
            "alto": 1440,
            "nivel": "pro"
        }
    ],
    "ARC Raiders": [
        {
            "titulo": "Humo contra ARC y Raiders",
            "texto": "La granada de humo crea una nube de 7,5 m que dura 20 segundos y bloquea la visión tanto de las máquinas ARC como de otros Raiders. Úsala para cruzar una zona abierta, reanimar o llegar a la extracción.",
            "imagen": "https://arcraiders.wiki/w/images/d/d5/Smoke_Grenade.png",
            "alt": "Granada de humo de ARC Raiders",
            "fuente": "https://arcraiders.wiki/wiki/Smoke_Grenade",
            "ancho": 512,
            "alto": 512,
            "nivel": "pro"
        },
        {
            "titulo": "Snap Hook para el terreno alto",
            "texto": "El Snap Hook (alcance 18 m) te sube a estructuras y hasta encima de ARC grandes como la Queen para atacar su escudo superior. Si caes desde muy alto, engánchate a una pared a mitad de caída para evitar el daño.",
            "imagen": "https://arcraiders.wiki/w/images/5/56/Snap_Hook.png",
            "alt": "Snap Hook de ARC Raiders",
            "fuente": "https://arcraiders.wiki/wiki/Snap_Hook",
            "ancho": 512,
            "alto": 512,
            "nivel": "pro"
        },
        {
            "titulo": "Tirolina para tomar altura",
            "texto": "La tirolina se ancla a casi cualquier superficie y une dos puntos a hasta 60 m. Úsala para subir a un tejado o una torre desde donde dominar la zona, o como ruta de escape rápida.",
            "imagen": "https://arcraiders.wiki/w/images/f/f9/Zipline.png",
            "alt": "Tirolina desplegable de ARC Raiders",
            "fuente": "https://arcraiders.wiki/wiki/Zipline",
            "ancho": 512,
            "alto": 512,
            "nivel": "pro"
        }
    ],
    "Team Fortress 2": [
        {
            "titulo": "Refleja proyectiles con el Pyro",
            "texto": "El aire comprimido del Pyro devuelve cohetes, granadas, flechas y más hacia donde apunta tu mira. Los proyectiles normales reflejados se vuelven minicríticos y los críticos siguen siendo críticos.",
            "imagen": "https://wiki.teamfortress.com/w/images/9/9a/Pyro_compressionblast_usage_reflect.png",
            "alt": "Pyro reflejando un proyectil con aire comprimido",
            "fuente": "https://wiki.teamfortress.com/wiki/Compression_blast",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Rompe la Über con aire comprimido",
            "texto": "El aire comprimido empuja aunque el enemigo sea invulnerable. Ante un avance con ÜberCharge, aleja a los jugadores con Über o separa al Médico de su paciente para cortar el vínculo.",
            "imagen": "https://wiki.teamfortress.com/w/images/f/fd/Pyro_compressionblast_usage_stuffuber.png",
            "alt": "Pyro empujando a un enemigo con ÜberCharge",
            "fuente": "https://wiki.teamfortress.com/wiki/Compression_blast",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        },
        {
            "titulo": "Apaga a tus aliados en llamas",
            "texto": "Un disparo de aire comprimido apaga al instante a un compañero que se quema y te da 20 de vida. Cuesta 20 de munición por defecto y no funciona bajo el agua.",
            "imagen": "https://wiki.teamfortress.com/w/images/e/e0/Pyro_compressionblast_usage_extinguish.png",
            "alt": "Pyro apagando a un compañero en llamas",
            "fuente": "https://wiki.teamfortress.com/wiki/Compression_blast",
            "ancho": 1920,
            "alto": 1080,
            "nivel": "pro"
        }
    ]
});
