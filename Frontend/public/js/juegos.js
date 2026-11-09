// ===== Juegos para elegir al buscar tips =====
// Los más jugados, en orden de popularidad. Íconos de 128x128 en img/juegos/
// "categorias" usa los mismos nombres que las tarjetas del inicio
// "alias" (opcional): abreviaturas que no salen de las iniciales del nombre (ej. "lol", "cs2")
// "estandarte" (opcional): imagen de fondo de la fila, en img/estandartes/; "posicion" elige qué parte se ve
const JUEGOS = [
    { nombre: 'Minecraft', icono: 'minecraft.png', categorias: ['Supervivencia', 'Construcción', 'Mundo abierto', 'Aventura', 'Consolas', 'Cooperativo'], estandarte: 'minecraft.jpg', posicion: 'center 40%', alias: ['mc'] },
    { nombre: 'Fortnite', icono: 'fortnite.png', categorias: ['Battle Royale', 'Shooter', 'Competitivo', 'Construcción', 'Consolas'], estandarte: 'fortnite.jpg', posicion: 'center 30%', alias: ['fn', 'fort'] },
    { nombre: 'Roblox', icono: 'roblox.png', categorias: ['Construcción', 'Consolas'], estandarte: 'roblox.jpg', posicion: 'center 12%', alias: ['rbx'] },
    { nombre: 'League of Legends', icono: 'league-of-legends.png', categorias: ['Estrategia', 'Competitivo'], estandarte: 'league-of-legends.jpg', alias: ['lol', 'league'] },
    { nombre: 'VALORANT', icono: 'valorant.png', categorias: ['Shooter', 'Táctico', 'Competitivo', 'Consolas'], estandarte: 'valorant.jpg', alias: ['valo', 'val'] },
    { nombre: 'Counter-Strike 2', icono: 'counter-strike-2.png', categorias: ['Shooter', 'Táctico', 'Competitivo'], estandarte: 'counter-strike-2.jpg', alias: ['cs2', 'cs', 'csgo', 'counter'] },
    { nombre: 'Dota 2', icono: 'dota-2.png', categorias: ['Estrategia', 'Competitivo'], estandarte: 'dota-2.jpg', alias: ['dota'] },
    { nombre: 'PUBG: BATTLEGROUNDS', icono: 'pubg-battlegrounds.png', categorias: ['Battle Royale', 'Shooter', 'Competitivo', 'Consolas'], estandarte: 'pubg-battlegrounds.jpg' },
    { nombre: 'ARC Raiders', icono: 'arc-raiders.png', categorias: ['Shooter', 'Cooperativo', 'Acción', 'Consolas'], estandarte: 'arc-raiders.jpg', alias: ['arc'] },
    { nombre: 'Apex Legends', icono: 'apex-legends.png', categorias: ['Battle Royale', 'Shooter', 'Competitivo', 'Consolas'], estandarte: 'apex-legends.jpg' },
    { nombre: 'Grand Theft Auto V', icono: 'grand-theft-auto-v.png', categorias: ['Mundo abierto', 'Acción', 'Consolas'], estandarte: 'grand-theft-auto-v.jpg', alias: ['gta', 'gta5', 'gtao', 'gta online'] },
    { nombre: 'Marvel Rivals', icono: 'marvel-rivals.png', categorias: ['Shooter', 'Competitivo', 'Acción', 'Consolas'], estandarte: 'marvel-rivals.jpg', alias: ['rivals'] },
    { nombre: 'Call of Duty', icono: 'call-of-duty.png', categorias: ['Shooter', 'Battle Royale', 'Competitivo', 'Consolas'], estandarte: 'call-of-duty.jpg', alias: ['cod', 'warzone', 'wz'] },
    { nombre: 'Rust', icono: 'rust.png', categorias: ['Supervivencia', 'Construcción', 'Mundo abierto', 'Shooter', 'Consolas'], estandarte: 'rust.jpg' },
    { nombre: 'Overwatch 2', icono: 'overwatch-2.png', categorias: ['Shooter', 'Competitivo', 'Consolas'], estandarte: 'overwatch-2.jpg', alias: ['ow', 'ow2'] },
    { nombre: 'Genshin Impact', icono: 'genshin-impact.png', categorias: ['RPG', 'Mundo abierto', 'Aventura', 'Consolas'], estandarte: 'genshin-impact.jpg', alias: ['genshin'] },
    { nombre: 'Rocket League', icono: 'rocket-league.png', categorias: ['Deportes', 'Competitivo', 'Consolas'], estandarte: 'rocket-league.jpg', alias: ['rl'] },
    { nombre: 'Battlefield 6', icono: 'battlefield-6.png', categorias: ['Shooter', 'Consolas'], estandarte: 'battlefield-6.jpg', alias: ['bf6', 'bf'] },
    { nombre: "Tom Clancy's Rainbow Six Siege", icono: 'tom-clancy-s-rainbow-six-siege.png', categorias: ['Shooter', 'Táctico', 'Competitivo', 'Consolas'], estandarte: 'tom-clancy-s-rainbow-six-siege.jpg', alias: ['r6', 'r6s', 'siege', 'rainbow six'] },
    { nombre: 'HELLDIVERS 2', icono: 'helldivers-2.png', categorias: ['Shooter', 'Cooperativo', 'Acción', 'Consolas'], estandarte: 'helldivers-2.jpg', alias: ['hd2', 'helldivers'] },
    { nombre: "Baldur's Gate 3", icono: 'baldur-s-gate-3.png', categorias: ['RPG', 'Estrategia', 'Aventura', 'Cooperativo', 'Consolas'], estandarte: 'baldur-s-gate-3.jpg' },
    { nombre: 'ELDEN RING', icono: 'elden-ring.png', categorias: ['Soulslike', 'RPG', 'Mundo abierto', 'Acción', 'Consolas'], estandarte: 'elden-ring.jpg', alias: ['er'] },
    { nombre: 'Monster Hunter Wilds', icono: 'monster-hunter-wilds.png', categorias: ['Acción', 'RPG', 'Cooperativo', 'Consolas'], estandarte: 'monster-hunter-wilds.jpg', alias: ['mhwilds', 'wilds'] },
    { nombre: 'Delta Force', icono: 'delta-force.png', categorias: ['Shooter', 'Táctico', 'Competitivo', 'Consolas'], estandarte: 'delta-force.jpg' },
    { nombre: 'Dead by Daylight', icono: 'dead-by-daylight.png', categorias: ['Terror', 'Competitivo', 'Consolas'], estandarte: 'dead-by-daylight.jpg', alias: ['dbd'] },
    { nombre: 'Path of Exile 2', icono: 'path-of-exile-2.png', categorias: ['RPG', 'Acción', 'Consolas'], estandarte: 'path-of-exile-2.jpg', alias: ['poe'] },
    { nombre: 'Team Fortress 2', icono: 'team-fortress-2.png', categorias: ['Shooter', 'Competitivo'], estandarte: 'team-fortress-2.jpg', alias: ['tf'] },
    { nombre: 'Destiny 2', icono: 'destiny-2.png', categorias: ['Shooter', 'RPG', 'Cooperativo', 'Consolas'], estandarte: 'destiny-2.jpg', alias: ['d2'] },
    { nombre: 'Warframe', icono: 'warframe.png', categorias: ['Shooter', 'Acción', 'Cooperativo', 'Consolas'], estandarte: 'warframe.jpg' },
    { nombre: 'Terraria', icono: 'terraria.png', categorias: ['Supervivencia', 'Construcción', 'Aventura', 'Indie', 'Retro', 'Consolas', 'Cooperativo'], estandarte: 'terraria.jpg' },
    { nombre: 'Stardew Valley', icono: 'stardew-valley.png', categorias: ['Simulación', 'Indie', 'Retro', 'Consolas', 'Cooperativo'], estandarte: 'stardew-valley.jpg', alias: ['sdv', 'stardew'] },
    { nombre: 'Cyberpunk 2077', icono: 'cyberpunk-2077.png', categorias: ['RPG', 'Mundo abierto', 'Shooter', 'Consolas'], estandarte: 'cyberpunk-2077.jpg', alias: ['cp2077', 'cyberpunk'] },
    { nombre: 'Red Dead Redemption 2', icono: 'red-dead-redemption-2.png', categorias: ['Mundo abierto', 'Aventura', 'Acción', 'Consolas'], estandarte: 'red-dead-redemption-2.jpg', alias: ['rdr', 'red dead'] },
    { nombre: 'Palworld', icono: 'palworld.png', categorias: ['Supervivencia', 'Construcción', 'Mundo abierto', 'Cooperativo', 'Consolas'], estandarte: 'palworld.jpg' },
    { nombre: 'Schedule I', icono: 'schedule-i.png', categorias: ['Simulación', 'Indie'], estandarte: 'schedule-i.jpg' },
    { nombre: 'R.E.P.O.', icono: 'r-e-p-o.png', categorias: ['Terror', 'Cooperativo', 'Indie'], estandarte: 'r-e-p-o.jpg' },
    { nombre: 'PEAK', icono: 'peak.png', categorias: ['Aventura', 'Cooperativo', 'Indie'], estandarte: 'peak.jpg' },
    { nombre: 'Lethal Company', icono: 'lethal-company.png', categorias: ['Terror', 'Cooperativo', 'Indie'], estandarte: 'lethal-company.jpg', alias: ['lethal'] },
    { nombre: 'Phasmophobia', icono: 'phasmophobia.png', categorias: ['Terror', 'Cooperativo', 'Indie', 'Consolas'], estandarte: 'phasmophobia.jpg', alias: ['phasmo'] },
    { nombre: 'Sea of Thieves', icono: 'sea-of-thieves.png', categorias: ['Aventura', 'Mundo abierto', 'Cooperativo', 'Consolas'], estandarte: 'sea-of-thieves.jpg', alias: ['sot'] },
    { nombre: 'Among Us', icono: 'among-us.png', categorias: ['Indie', 'Consolas', 'Cooperativo'], estandarte: 'among-us.jpg' },
    { nombre: 'Fall Guys', icono: 'fall-guys.png', categorias: ['Battle Royale', 'Consolas'], estandarte: 'fall-guys.jpg' },
    { nombre: 'Black Myth: Wukong', icono: 'black-myth-wukong.png', categorias: ['Soulslike', 'Acción', 'Consolas'], estandarte: 'black-myth-wukong.jpg', alias: ['wukong'] },
    { nombre: 'Clair Obscur: Expedition 33', icono: 'clair-obscur-expedition-33.png', categorias: ['RPG', 'Aventura', 'Consolas'], estandarte: 'clair-obscur-expedition-33.jpg', alias: ['e33', 'expedition 33'] },
    { nombre: 'Split Fiction', icono: 'split-fiction.png', categorias: ['Aventura', 'Cooperativo', 'Consolas'], estandarte: 'split-fiction.jpg' },
    { nombre: 'Kingdom Come: Deliverance II', icono: 'kingdom-come-deliverance-ii.png', categorias: ['RPG', 'Mundo abierto', 'Consolas'], estandarte: 'kingdom-come-deliverance-ii.jpg', alias: ['kcd', 'kcd2'] },
    { nombre: 'Hogwarts Legacy', icono: 'hogwarts-legacy.png', categorias: ['RPG', 'Mundo abierto', 'Aventura', 'Consolas'], estandarte: 'hogwarts-legacy.jpg' },
    { nombre: 'THE FINALS', icono: 'the-finals.png', categorias: ['Shooter', 'Competitivo', 'Consolas'], estandarte: 'the-finals.jpg' },
    { nombre: 'Deep Rock Galactic', icono: 'deep-rock-galactic.png', categorias: ['Shooter', 'Cooperativo', 'Indie', 'Consolas'], estandarte: 'deep-rock-galactic.jpg', alias: ['drg'] },
    { nombre: 'Valheim', icono: 'valheim.png', categorias: ['Supervivencia', 'Construcción', 'Mundo abierto', 'Cooperativo', 'Indie', 'Consolas'], estandarte: 'valheim.jpg' },
    { nombre: '7 Days to Die', icono: '7-days-to-die.png', categorias: ['Supervivencia', 'Construcción', 'Terror', 'Cooperativo', 'Consolas'], estandarte: '7-days-to-die.jpg', alias: ['7dtd'] },
    { nombre: 'ARK: Survival Ascended', icono: 'ark-survival-ascended.png', categorias: ['Supervivencia', 'Construcción', 'Mundo abierto', 'Consolas'], estandarte: 'ark-survival-ascended.jpg', alias: ['ark', 'asa'] },
    { nombre: 'FINAL FANTASY XIV Online', icono: 'final-fantasy-xiv-online.png', categorias: ['RPG', 'Consolas', 'MMO'], estandarte: 'final-fantasy-xiv-online.jpg', alias: ['ff14', 'ffxiv', 'ff'] },
    { nombre: 'Brawlhalla', icono: 'brawlhalla.png', categorias: ['Lucha', 'Competitivo', 'Consolas'], estandarte: 'brawlhalla.jpg' },
    { nombre: 'Satisfactory', icono: 'satisfactory.png', categorias: ['Construcción', 'Simulación', 'Cooperativo', 'Indie', 'Consolas'], estandarte: 'satisfactory.jpg' },
    { nombre: "Sid Meier's Civilization VI", icono: 'sid-meier-s-civilization-vi.png', categorias: ['Estrategia', 'Consolas'], estandarte: 'sid-meier-s-civilization-vi.jpg', alias: ['civ', 'civ6'] },
    { nombre: 'Left 4 Dead 2', icono: 'left-4-dead-2.png', categorias: ['Shooter', 'Cooperativo', 'Terror'], estandarte: 'left-4-dead-2.jpg', alias: ['l4d', 'l4d2'] },
    { nombre: "Garry's Mod", icono: 'garry-s-mod.png', categorias: ['Construcción', 'Indie'], estandarte: 'garry-s-mod.jpg', alias: ['gmod'] },
    { nombre: "Don't Starve Together", icono: 'don-t-starve-together.png', categorias: ['Supervivencia', 'Cooperativo', 'Indie', 'Consolas'], estandarte: 'don-t-starve-together.jpg', alias: ['dst'] },
    { nombre: 'New World: Aeternum', icono: 'new-world-aeternum.png', categorias: ['RPG', 'Mundo abierto', 'Consolas', 'MMO'], estandarte: 'new-world-aeternum.jpg' },
    { nombre: 'ELDEN RING NIGHTREIGN', icono: 'elden-ring-nightreign.png', categorias: ['Soulslike', 'Cooperativo', 'Acción', 'Consolas', 'Roguelike'], estandarte: 'elden-ring-nightreign.jpg', alias: ['nightreign'] },
    { nombre: 'Diablo IV', icono: 'diablo-iv.png', categorias: ['RPG', 'Acción', 'Consolas'], estandarte: 'diablo-iv.jpg', alias: ['d4', 'diablo'] },
    { nombre: 'War Thunder', icono: 'war-thunder.png', categorias: ['Simulación', 'Competitivo', 'Consolas'], estandarte: 'war-thunder.jpg', alias: ['wt'] },
    { nombre: 'The Elder Scrolls V: Skyrim Special Edition', icono: 'the-elder-scrolls-v-skyrim-special-edition.png', categorias: ['RPG', 'Mundo abierto', 'Consolas'], estandarte: 'the-elder-scrolls-v-skyrim-special-edition.jpg', alias: ['skyrim', 'tes5'] },
    { nombre: 'Fallout 4', icono: 'fallout-4.png', categorias: ['RPG', 'Mundo abierto', 'Shooter', 'Consolas'], estandarte: 'fallout-4.jpg', alias: ['fo4', 'fallout'] },
    { nombre: 'Hades II', icono: 'hades-ii.png', categorias: ['Acción', 'Indie', 'Consolas', 'RPG', 'Roguelike'], estandarte: 'hades-ii.jpg' },
    { nombre: 'Sons of the Forest', icono: 'sons-of-the-forest.png', categorias: ['Supervivencia', 'Construcción', 'Terror', 'Cooperativo'], estandarte: 'sons-of-the-forest.jpg' },
    { nombre: 'Hunt: Showdown 1896', icono: 'hunt-showdown-1896.png', categorias: ['Shooter', 'Táctico', 'Terror', 'Competitivo', 'Consolas'], estandarte: 'hunt-showdown-1896.jpg', alias: ['hunt'] },
    { nombre: 'Project Zomboid', icono: 'project-zomboid.png', categorias: ['Supervivencia', 'Terror', 'Indie'], estandarte: 'project-zomboid.jpg', alias: ['pz', 'zomboid'] },
    { nombre: 'RimWorld', icono: 'rimworld.png', categorias: ['Estrategia', 'Simulación', 'Construcción', 'Indie', 'Consolas'], estandarte: 'rimworld.jpg' },
    { nombre: 'Sekiro: Shadows Die Twice', icono: 'sekiro-shadows-die-twice.png', categorias: ['Soulslike', 'Acción', 'Consolas'], estandarte: 'sekiro-shadows-die-twice.jpg', alias: ['sekiro'] },
    { nombre: 'DARK SOULS III', icono: 'dark-souls-iii.png', categorias: ['Soulslike', 'RPG', 'Acción', 'Consolas'], estandarte: 'dark-souls-iii.jpg', alias: ['dark souls', 'ds'] },
    { nombre: 'Monster Hunter: World', icono: 'monster-hunter-world.png', categorias: ['Acción', 'RPG', 'Cooperativo', 'Consolas'], estandarte: 'monster-hunter-world.jpg', alias: ['mhworld', 'mhw'] },
    { nombre: 'Ghost of Tsushima', icono: 'ghost-of-tsushima.png', categorias: ['Acción', 'Mundo abierto', 'Aventura', 'Consolas'], estandarte: 'ghost-of-tsushima.jpg', alias: ['got', 'tsushima'] },
    { nombre: 'Warhammer 40,000: Space Marine 2', icono: 'warhammer-40-000-space-marine-2.png', categorias: ['Shooter', 'Acción', 'Cooperativo', 'Consolas'], estandarte: 'warhammer-40-000-space-marine-2.jpg', alias: ['sm2', 'space marine'] },
    { nombre: 'Ready or Not', icono: 'ready-or-not.png', categorias: ['Shooter', 'Táctico', 'Cooperativo', 'Consolas'], estandarte: 'ready-or-not.jpg', alias: ['ron'] },
    { nombre: 'Halo: The Master Chief Collection', icono: 'halo-the-master-chief-collection.png', categorias: ['Shooter', 'Retro', 'Consolas'], estandarte: 'halo-the-master-chief-collection.jpg', alias: ['mcc', 'halo'] },
    { nombre: 'Lies of P', icono: 'lies-of-p.png', categorias: ['Soulslike', 'Acción', 'Consolas'], estandarte: 'lies-of-p.jpg' },
    { nombre: 'Raft', icono: 'raft.png', categorias: ['Supervivencia', 'Construcción', 'Cooperativo', 'Indie'], estandarte: 'raft.jpg' },
    { nombre: 'Cities: Skylines', icono: 'cities-skylines.png', categorias: ['Construcción', 'Simulación', 'Estrategia', 'Consolas'], estandarte: 'cities-skylines.jpg' },
    { nombre: 'NARAKA: BLADEPOINT', icono: 'naraka-bladepoint.png', categorias: ['Battle Royale', 'Acción', 'Competitivo', 'Consolas'], estandarte: 'naraka-bladepoint.jpg', alias: ['naraka'] },
    { nombre: 'Mortal Kombat 1', icono: 'mortal-kombat-1.png', categorias: ['Lucha', 'Competitivo', 'Consolas'], estandarte: 'mortal-kombat-1.jpg', alias: ['mk', 'mk1'] },
    { nombre: 'Street Fighter 6', icono: 'street-fighter-6.png', categorias: ['Lucha', 'Competitivo', 'Consolas'], estandarte: 'street-fighter-6.jpg', alias: ['sf', 'sf6'] },
    { nombre: 'F1 25', icono: 'f1-25.png', categorias: ['Carreras', 'Deportes', 'Simulación', 'Consolas'], estandarte: 'f1-25.jpg', alias: ['f1', 'formula 1'] },
    { nombre: 'Assetto Corsa Competizione', icono: 'assetto-corsa-competizione.png', categorias: ['Carreras', 'Simulación', 'Consolas'], estandarte: 'assetto-corsa-competizione.jpg', posicion: 'center 65%', alias: ['acc', 'assetto'] },
    { nombre: 'Need for Speed Unbound', icono: 'need-for-speed-unbound.png', categorias: ['Carreras', 'Consolas'], estandarte: 'need-for-speed-unbound.jpg', alias: ['nfs'] },
    { nombre: 'The Crew Motorfest', icono: 'the-crew-motorfest.png', categorias: ['Carreras', 'Mundo abierto', 'Consolas'], estandarte: 'the-crew-motorfest.jpg', alias: ['the crew', 'motorfest'] },
    { nombre: 'NBA 2K26', icono: 'nba-2k26.png', categorias: ['Deportes', 'Competitivo', 'Consolas'], estandarte: 'nba-2k26.jpg', alias: ['2k', '2k26', 'nba'] },
    { nombre: 'Football Manager 2024', icono: 'football-manager-2024.png', categorias: ['Deportes', 'Simulación', 'Estrategia', 'Consolas'], estandarte: 'football-manager-2024.jpg', alias: ['fm', 'fm24'] },
    { nombre: 'The Witcher 3: Wild Hunt', icono: 'the-witcher-3-wild-hunt.png', categorias: ['RPG', 'Mundo abierto', 'Consolas'], estandarte: 'the-witcher-3-wild-hunt.jpg', alias: ['tw3', 'witcher'] },
    { nombre: 'Euro Truck Simulator 2', icono: 'euro-truck-simulator-2.png', categorias: ['Simulación'], estandarte: 'euro-truck-simulator-2.jpg', alias: ['ets', 'ets2'] },
    { nombre: 'EA SPORTS FC 25', icono: 'ea-sports-fc-25.png', categorias: ['Deportes', 'Competitivo', 'Consolas'], estandarte: 'ea-sports-fc-25.jpg', alias: ['fc25', 'fc', 'fifa'] },
    { nombre: 'Forza Horizon 5', icono: 'forza-horizon-5.png', categorias: ['Carreras', 'Mundo abierto', 'Consolas'], estandarte: 'forza-horizon-5.jpg', alias: ['fh5', 'forza'] },
    { nombre: 'TEKKEN 8', icono: 'tekken-8.png', categorias: ['Lucha', 'Competitivo', 'Consolas'], estandarte: 'tekken-8.jpg', alias: ['t8', 'tekken'] },
    { nombre: 'Resident Evil 4', icono: 'resident-evil-4.png', categorias: ['Terror', 'Acción', 'Consolas'], estandarte: 'resident-evil-4.jpg', alias: ['re4', 're'] },
    { nombre: 'God of War', icono: 'god-of-war.png', categorias: ['Acción', 'Aventura', 'Consolas'], estandarte: 'god-of-war.jpg', alias: ['gow'] },
    { nombre: 'The Last of Us Part I', icono: 'the-last-of-us-part-i.png', categorias: ['Aventura', 'Acción', 'Terror', 'Consolas'], estandarte: 'the-last-of-us-part-i.jpg', alias: ['tlou', 'last of us'] },
    { nombre: 'Hollow Knight', icono: 'hollow-knight.png', categorias: ['Soulslike', 'Indie', 'Aventura', 'Consolas'], estandarte: 'hollow-knight.jpg', alias: ['hk'] },
    { nombre: 'Subnautica', icono: 'subnautica.png', categorias: ['Supervivencia', 'Aventura', 'Consolas'], estandarte: 'subnautica.jpg' },
    { nombre: 'Age of Empires II: Definitive Edition', icono: 'age-of-empires-ii-definitive-edition.png', categorias: ['Estrategia', 'Retro', 'Consolas'], estandarte: 'age-of-empires-ii-definitive-edition.jpg', alias: ['aoe', 'aoe2'] },
    { nombre: 'Tetris Effect: Connected', icono: 'tetris-effect-connected.png', categorias: ['Retro', 'Consolas'], estandarte: 'tetris-effect-connected.jpg' },
    { nombre: 'Escape from Tarkov', icono: 'escape-from-tarkov.png', categorias: ['Shooter', 'Táctico', 'Supervivencia'], estandarte: 'escape-from-tarkov.jpg', alias: ['eft', 'tarkov'] },
    { nombre: 'Deadlock', icono: 'deadlock.png', categorias: ['Shooter', 'Estrategia', 'Competitivo'], estandarte: 'deadlock.jpg' },
    { nombre: 'Titanfall 2', icono: 'titanfall-2.png', categorias: ['Shooter', 'Acción', 'Consolas'], estandarte: 'titanfall-2.jpg', alias: ['tf2'] },
    { nombre: 'DOOM: The Dark Ages', icono: 'doom-the-dark-ages.png', categorias: ['Shooter', 'Acción', 'Consolas'], estandarte: 'doom-the-dark-ages.jpg', alias: ['doom'] },
    { nombre: 'Insurgency: Sandstorm', icono: 'insurgency-sandstorm.png', categorias: ['Shooter', 'Táctico', 'Consolas'], estandarte: 'insurgency-sandstorm.jpg', alias: ['insurgency'] },
    { nombre: 'Hell Let Loose', icono: 'hell-let-loose.png', categorias: ['Shooter', 'Táctico', 'Consolas'], estandarte: 'hell-let-loose.jpg', alias: ['hll'] },
    { nombre: 'PAYDAY 2', icono: 'payday-2.png', categorias: ['Shooter', 'Cooperativo', 'Acción', 'Consolas'], estandarte: 'payday-2.jpg', alias: ['payday', 'pd2'] },
    { nombre: 'Squad', icono: 'squad.png', categorias: ['Shooter', 'Táctico'], estandarte: 'squad.jpg' },
    { nombre: 'Hollow Knight: Silksong', icono: 'hollow-knight-silksong.png', categorias: ['Aventura', 'Acción', 'Indie', 'Consolas'], estandarte: 'hollow-knight-silksong.jpg', alias: ['silksong'] },
    { nombre: 'Celeste', icono: 'celeste.png', categorias: ['Aventura', 'Indie', 'Retro', 'Consolas'], estandarte: 'celeste.jpg' },
    { nombre: 'Hades', icono: 'hades.png', categorias: ['Acción', 'RPG', 'Indie', 'Consolas', 'Roguelike'], estandarte: 'hades.jpg' },
    { nombre: 'Dead Cells', icono: 'dead-cells.png', categorias: ['Acción', 'Indie', 'Retro', 'Consolas', 'Roguelike'], estandarte: 'dead-cells.jpg' },
    { nombre: 'Slay the Spire', icono: 'slay-the-spire.png', categorias: ['Estrategia', 'Indie', 'Consolas', 'Roguelike'], estandarte: 'slay-the-spire.jpg', alias: ['sts'] },
    { nombre: 'Balatro', icono: 'balatro.png', categorias: ['Estrategia', 'Indie', 'Retro', 'Consolas', 'Roguelike'], estandarte: 'balatro.jpg' },
    { nombre: 'Factorio', icono: 'factorio.png', categorias: ['Construcción', 'Simulación', 'Estrategia', 'Indie', 'Consolas'], estandarte: 'factorio.jpg' },
    { nombre: 'Mount & Blade II: Bannerlord', icono: 'mount-blade-ii-bannerlord.png', categorias: ['RPG', 'Estrategia', 'Acción', 'Mundo abierto', 'Consolas'], estandarte: 'mount-blade-ii-bannerlord.jpg', alias: ['bannerlord', 'mb2'] },
    { nombre: 'Crusader Kings III', icono: 'crusader-kings-iii.png', categorias: ['Estrategia', 'RPG', 'Simulación', 'Consolas'], estandarte: 'crusader-kings-iii.jpg', alias: ['ck3'] },
    { nombre: 'Total War: WARHAMMER III', icono: 'total-war-warhammer-iii.png', categorias: ['Estrategia', 'Táctico'], estandarte: 'total-war-warhammer-iii.jpg', alias: ['wh3', 'tww3'] },
    { nombre: 'Stellaris', icono: 'stellaris.png', categorias: ['Estrategia', 'Simulación', 'Consolas'], estandarte: 'stellaris.jpg' },
    { nombre: 'Persona 5 Royal', icono: 'persona-5-royal.png', categorias: ['RPG', 'Aventura', 'Consolas'], estandarte: 'persona-5-royal.jpg', alias: ['p5r', 'persona'] },
    { nombre: "No Man's Sky", icono: 'no-man-s-sky.png', categorias: ['Supervivencia', 'Mundo abierto', 'Aventura', 'Construcción', 'Consolas'], estandarte: 'no-man-s-sky.jpg' },
    { nombre: 'Dying Light 2 Stay Human', icono: 'dying-light-2-stay-human.png', categorias: ['Mundo abierto', 'Acción', 'Terror', 'Cooperativo', 'Consolas'], estandarte: 'dying-light-2-stay-human.jpg', alias: ['dl2', 'dying light'] },
    { nombre: 'Lost Ark', icono: 'lost-ark.png', categorias: ['RPG', 'Acción', 'Mundo abierto', 'MMO'], estandarte: 'lost-ark.jpg' },
    { nombre: 'Old School RuneScape', icono: 'old-school-runescape.png', categorias: ['RPG', 'Mundo abierto', 'Retro', 'MMO'], estandarte: 'old-school-runescape.jpg', alias: ['runescape', 'rs'] }
];

// ----- Abreviaturas de los juegos -----
const ROMANOS = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8', ix: '9', x: '10' };

// Iniciales del nombre, con los números romanos pasados a número:
// "Red Dead Redemption 2" -> "rdr2", "DARK SOULS III" -> "ds3", "Grand Theft Auto V" -> "gta5"
function siglasJuego(nombre) {
    const palabras = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/'s\b/g, '').split(/[^a-z0-9]+/).filter(Boolean);
    return palabras.map(p => /^\d+$/.test(p) ? p : (ROMANOS[p] || p[0])).join('');
}

// Todas las formas cortas de un juego (calculadas + escritas a mano), sin espacios ni signos
function abreviaturasJuego(juego) {
    const limpiar = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    return [...new Set([siglasJuego(juego.nombre), ...(juego.alias || []).map(limpiar)])].filter(a => a.length >= 2);
}


// Busca un juego de la lista por su nombre o una abreviatura ("elden ring", "GTA", "cs2")
// Devuelve undefined si es un juego que no está en la lista
function juegoPorNombre(nombre) {
    const limpiar = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
    const buscado = limpiar(nombre);
    if (!buscado) return undefined;
    return JUEGOS.find(j => limpiar(j.nombre) === buscado) ||
        JUEGOS.find(j => abreviaturasJuego(j).includes(buscado));
}

// ----- Imágenes de un juego (de fábrica en img/, aprobados en la API) -----
// Ícono con la inicial del juego, para los que no tienen imagen (mismo estilo oscuro de la web)
function iconoLetra(nombre) {
    const letra = (String(nombre || '?').trim().charAt(0) || '?').toUpperCase().replace(/[<>&"']/g, '?');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1E2330"/>` +
        `<text x="32" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#A78BFF">${letra}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Solo se aceptan imágenes subidas a la API con el nombre que ella genera
function imagenAprobada(url) {
    return typeof API_ORIGEN !== 'undefined' && /^\/uploads\/[a-f0-9]{32}\.(jpg|png|webp|gif)$/.test(url || '') ? API_ORIGEN + url : null;
}

// base: ruta hasta la raíz del sitio desde la página ('' en index.html, '../../' en pages/usuario/)
function iconoJuego(juego, base = '') {
    if (!juego) return iconoLetra('?');
    if (juego.aprobado) return imagenAprobada(juego.icono) || iconoLetra(juego.nombre);
    return `${base}img/juegos/${juego.icono}`;
}

// URL del estandarte (para usar en url('...')) o null si no tiene
function estandarteJuego(juego) {
    if (!juego?.estandarte) return null;
    return juego.aprobado ? imagenAprobada(juego.estandarte) : `/img/estandartes/${juego.estandarte}`;
}

// ----- Juegos aprobados por un admin (vienen de la API y se agregan al final de JUEGOS) -----
// Si la API no responde, la web sigue con la lista de fábrica
async function cargarJuegosAprobados() {
    if (typeof window === 'undefined' || typeof API === 'undefined' || !API.JUEGOS) return [];
    try {
        const respuesta = await fetch(API.JUEGOS, { signal: AbortSignal.timeout(5000) });
        if (!respuesta.ok) return [];
        const aprobados = await respuesta.json();
        const limpiar = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
        const nuevos = aprobados
            .filter(j => j && typeof j.nombre === 'string' && !JUEGOS.some(e => limpiar(e.nombre) === limpiar(j.nombre)))
            .map(j => ({ nombre: j.nombre, icono: j.icono, estandarte: j.estandarte, categorias: [], aprobado: true }));
        JUEGOS.push(...nuevos);
        return nuevos;
    } catch (error) {
        return [];
    }
}

// Las páginas esperan esta promesa para volver a pintar cuando llegan los juegos de la API
const juegosAprobados = cargarJuegosAprobados();

// La API también lee esta lista (para no aceptar como "juego nuevo" uno que ya existe)
if (typeof module !== 'undefined') module.exports = { JUEGOS, juegoPorNombre };
