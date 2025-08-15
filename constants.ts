




export enum PokemonType {
  NORMAL = 'Normal',
  FIRE = 'Fire',
  WATER = 'Water',
  GRASS = 'Grass',
  ELECTRIC = 'Electric',
  ICE = 'Ice',
  FIGHTING = 'Fighting',
  POISON = 'Poison',
  GROUND = 'Ground',
  FLYING = 'Flying',
  PSYCHIC = 'Psychic',
  BUG = 'Bug',
  ROCK = 'Rock',
  GHOST = 'Ghost',
  DRAGON = 'Dragon',
  DARK = 'Dark',
  STEEL = 'Steel',
  FAIRY = 'Fairy',
}

export const GENERATIONS = [
    { id: 1, name: 'Generation I', start: 1, end: 151 },
    { id: 2, name: 'Generation II', start: 152, end: 251 },
    { id: 3, name: 'Generation III', start: 252, end: 386 },
    { id: 4, name: 'Generation IV', start: 387, end: 493 },
    { id: 5, name: 'Generation V', start: 494, end: 649 },
    { id: 6, name: 'Generation VI', start: 650, end: 721 },
    { id: 7, name: 'Generation VII', start: 722, end: 809 },
    { id: 8, name: 'Generation VIII', start: 810, end: 905 },
    { id: 9, name: 'Generation IX', start: 906, end: 1025 },
];

export const GAME_ERA_GROUPS = [
  { name: 'Gen I', groups: ['red-blue', 'yellow'] },
  { name: 'Gen II', groups: ['gold-silver', 'crystal'] },
  { name: 'Gen III', groups: ['ruby-sapphire', 'emerald', 'firered-leafgreen'] },
  { name: 'Gen IV', groups: ['diamond-pearl', 'platinum', 'heartgold-soulsilver'] },
  { name: 'Gen V', groups: ['black-white', 'black-2-white-2'] },
  { name: 'Gen VI', groups: ['x-y', 'omega-ruby-alpha-sapphire'] },
  { name: 'Gen VII', groups: ['sun-moon', 'ultra-sun-ultra-moon', 'lets-go-pikachu-lets-go-eevee'] },
  { name: 'Gen VIII', groups: ['sword-shield', 'the-isle-of-armor', 'the-crown-tundra', 'brilliant-diamond-and-shining-pearl', 'legends-arceus'] },
  { name: 'Gen IX', groups: ['scarlet-violet', 'the-teal-mask', 'the-indigo-disk'] },
];

export const POKEDEX_LIST: { id: string, name: string, isGeneration: boolean, genId?: number, category: 'generation' | 'game' | 'other', era?: string, versionGroup?: string }[] = [
    // Generations
    { id: 'gen-1', name: 'Generation I', isGeneration: true, genId: 1, category: 'generation', era: 'Gen I' },
    { id: 'gen-2', name: 'Generation II', isGeneration: true, genId: 2, category: 'generation', era: 'Gen II' },
    { id: 'gen-3', name: 'Generation III', isGeneration: true, genId: 3, category: 'generation', era: 'Gen III' },
    { id: 'gen-4', name: 'Generation IV', isGeneration: true, genId: 4, category: 'generation', era: 'Gen IV' },
    { id: 'gen-5', name: 'Generation V', isGeneration: true, genId: 5, category: 'generation', era: 'Gen V' },
    { id: 'gen-6', name: 'Generation VI', isGeneration: true, genId: 6, category: 'generation', era: 'Gen VI' },
    { id: 'gen-7', name: 'Generation VII', isGeneration: true, genId: 7, category: 'generation', era: 'Gen VII' },
    { id: 'gen-8', name: 'Generation VIII', isGeneration: true, genId: 8, category: 'generation', era: 'Gen VIII' },
    { id: 'gen-9', name: 'Generation IX', isGeneration: true, genId: 9, category: 'generation', era: 'Gen IX' },
    // Game Dexes
    { id: 'kanto', name: 'Kanto (R/B/Y)', isGeneration: false, category: 'game', era: 'Gen I', versionGroup: 'red-blue' },
    { id: 'original-johto', name: 'Johto (G/S/C)', isGeneration: false, category: 'game', era: 'Gen II', versionGroup: 'gold-silver'},
    { id: 'hoenn', name: 'Hoenn (R/S/E)', isGeneration: false, category: 'game', era: 'Gen III', versionGroup: 'ruby-sapphire' },
    { id: 'original-sinnoh', name: 'Sinnoh (D/P)', isGeneration: false, category: 'game', era: 'Gen IV', versionGroup: 'diamond-pearl' },
    { id: 'original-unova', name: 'Unova (B/W)', isGeneration: false, category: 'game', era: 'Gen V', versionGroup: 'black-white' },
    { id: 'updated-unova', name: 'Unova (B2/W2)', isGeneration: false, category: 'game', era: 'Gen V', versionGroup: 'black-2-white-2' },
    { id: 'kalos-central', name: 'Kalos (Central)', isGeneration: false, category: 'game', era: 'Gen VI', versionGroup: 'x-y' },
    { id: 'galar', name: 'Galar (Sw/Sh)', isGeneration: false, category: 'game', era: 'Gen VIII', versionGroup: 'sword-shield' },
    { id: 'paldea', name: 'Paldea (S/V)', isGeneration: false, category: 'game', era: 'Gen IX', versionGroup: 'scarlet-violet' },
    // Other Dexes
    { id: 'national', name: 'National', isGeneration: false, category: 'other' },
    { id: 'updated-johto', name: 'Johto (HG/SS)', isGeneration: false, category: 'other', era: 'Gen IV' },
    { id: 'updated-hoenn', name: 'Hoenn (OR/AS)', isGeneration: false, category: 'other', era: 'Gen VI' },
    { id: 'extended-sinnoh', name: 'Sinnoh (Plat.)', isGeneration: false, category: 'other', era: 'Gen IV' },
    { id: 'updated-alola', name: 'Alola (US/UM)', isGeneration: false, category: 'other', era: 'Gen VII' },
    { id: 'hisui', name: 'Hisui', isGeneration: false, category: 'other', era: 'Gen VIII' },
    { id: 'isle-of-armor', name: 'Isle of Armor', isGeneration: false, category: 'other', era: 'Gen VIII' },
    { id: 'crown-tundra', name: 'Crown Tundra', isGeneration: false, category: 'other', era: 'Gen VIII' },
    { id: 'kitakami', name: 'Kitakami', isGeneration: false, category: 'other', era: 'Gen IX' },
    { id: 'blueberry', name: 'Blueberry', isGeneration: false, category: 'other', era: 'Gen IX' },
    { id: 'extra', name: 'Extra (ID > 1025)', isGeneration: false, category: 'other' },
];

export const VERSION_EXCLUSIVES: { [key: string]: { [key: string]: string[] } } = {
    'red-blue': {
        'red': ['ekans', 'arbok', 'oddish', 'gloom', 'vileplume', 'mankey', 'primeape', 'growlithe', 'arcanine', 'scyther', 'electabuzz'],
        'blue': ['sandshrew', 'sandslash', 'vulpix', 'ninetales', 'meowth', 'persian', 'bellsprout', 'weepinbell', 'victreebel', 'magmar', 'pinsir']
    },
    'gold-silver': {
        'gold': ['mankey', 'primeape', 'growlithe', 'arcanine', 'spinarak', 'ariados', 'teddiursa', 'ursaring', 'gligar', 'mantine', 'phanpy', 'donphan'],
        'silver': ['ekans', 'arbok', 'vulpix', 'ninetales', 'meowth', 'persian', 'ledyba', 'ledian', 'delibird', 'skarmory']
    },
    'ruby-sapphire': {
        'ruby': ['seedot', 'nuzleaf', 'shiftry', 'mawile', 'zangoose', 'solrock', 'groudon'],
        'sapphire': ['lotad', 'lombre', 'ludicolo', 'sableye', 'seviper', 'lunatone', 'kyogre']
    },
    'diamond-pearl': {
        'diamond': ['seel', 'dewgong', 'scyther', 'scizor', 'murkrow', 'gligar', 'larvitar', 'pupitar', 'tyranitar', 'poochyena', 'mightyena', 'aron', 'lairon', 'aggron', 'kecleon', 'cranidos', 'rampardos', 'honchkrow', 'stunky', 'skuntank', 'dialga'],
        'pearl': ['slowpoke', 'slowbro', 'slowking', 'pinsir', 'misdreavus', 'houndour', 'houndoom', 'stantler', 'spheal', 'sealeo', 'walrein', 'bagon', 'shelgon', 'salamence', 'shieldon', 'bastiodon', 'mismagius', 'glameow', 'purugly', 'palkia']
    },
    'black-white': {
        'black': ['murkrow', 'houndour', 'houndoom', 'plusle', 'honchkrow', 'cottonee', 'whimsicott', 'gothita', 'gothorita', 'gothitelle', 'vullaby', 'mandibuzz', 'tornadus', 'reshiram'],
        'white': ['misdreavus', 'minun', 'mismagius', 'petilil', 'lilligant', 'solosis', 'duosion', 'reuniclus', 'rufflet', 'braviary', 'thundurus', 'zekrom']
    },
    'sword-shield': {
        'sword': ['deino', 'zweilous', 'hydreigon', 'jangmo-o', 'hakamo-o', 'kommo-o', 'farfetchd', 'sirfetchd', 'turtonator', 'mawile', 'gothita', 'gothorita', 'gothitelle', 'rufflet', 'braviary', 'sawk', 'seedot', 'nuzleaf', 'shiftry', 'swirlix', 'slurpuff', 'scraggy', 'scrafty', 'solrock', 'passimian', 'flapple', 'stonjourner', 'indeedee-male', 'zacian'],
        'shield': ['larvitar', 'pupitar', 'tyranitar', 'goomy', 'sliggoo', 'goodra', 'ponyta', 'rapidash', 'drampa', 'sableye', 'solosis', 'duosion', 'reuniclus', 'vullaby', 'mandibuzz', 'throh', 'lotad', 'lombre', 'ludicolo', 'spritzee', 'aromatisse', 'croagunk', 'toxicroak', 'lunatone', 'oranguru', 'appletun', 'eiscue-ice', 'indeedee-female', 'zamazenta']
    },
    'scarlet-violet': {
        'scarlet': ['larvitar', 'pupitar', 'tyranitar', 'drifloon', 'drifblim', 'stunky', 'skuntank', 'deino', 'zweilous', 'hydreigon', 'skrelp', 'dragalge', 'oranguru', 'stonjourner', 'armarouge', 'koraidon', 'tauros-paldea-blaze-breed', 'great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'roaring-moon'],
        'violet': ['bagon', 'shelgon', 'salamence', 'misdreavus', 'mismagius', 'gulpin', 'swalot', 'clauncher', 'clawitzer', 'passimian', 'eiscue-ice', 'dreepy', 'drakloak', 'dragapult', 'ceruledge', 'miraidon', 'tauros-paldea-aqua-breed', 'iron-treads', 'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-thorns', 'iron-valiant']
    }
};

export const TYPE_ICONS: { [key in PokemonType]?: string } = {
  [PokemonType.BUG]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#9fa244" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M38.35,28.23c8.1,0,15.19-3.44,19.07-8.57-3.88-6.28-10.97-10.49-19.07-10.49s-15.19,4.21-19.07,10.49c3.88,5.13,10.97,8.57,19.07,8.57ZM61.19,23.97c-4.56,5.02-11.7,8.47-19.88,9.14l10.93,34.42c8.67-5.52,14.42-15.13,14.42-26.08,0-6.49-2.02-12.5-5.47-17.48ZM15.52,23.97c4.56,5.02,11.7,8.47,19.88,9.14l-10.93,34.42c-8.67-5.52-14.42-15.13-14.42-26.08,0-6.49,2.02-12.5,5.47-17.48ZM38.35,54.72c1.66,0,3.31-.37,4.83-1.09l-1.3-4.74c-2.15,1.38-4.92,1.38-7.07,0l-1.3,4.74c1.53.72,3.18,1.09,4.83,1.09h0ZM38.35,63.86c2.53,0,4.98-.48,7.27-1.36l-1.33-4.85c-1.85.79-3.86,1.21-5.94,1.21s-4.08-.42-5.94-1.21l-1.33,4.85c2.29.88,4.74,1.36,7.27,1.36Z"/></svg>`,
  [PokemonType.DARK]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#4c4948" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M60.1,20.73s-3.25,4.41-10.78,6.74c.84,2.28,1.32,4.93,1.32,7.9,0,10.15-5.5,18.39-12.28,18.39s-12.28-7.27-12.28-18.39c0-2.95.58-5.58,1.52-7.84-7.67-2.32-10.98-6.8-10.98-6.8,0,0-7.54,8.04-6.83,17.19.42,5.33,3.3,11.6,10.35,17.38,0,0,7.54,6.66,18.22,6.66s18.22-6.66,18.22-6.66c7.05-5.78,9.93-12.04,10.35-17.38.72-9.15-6.83-17.19-6.83-17.19Z"/><path d="M35.54,28.85c-.96,2-1.58,4.89-1.58,7.72,0,5.08,1.97,9.19,4.39,9.19s4.39-4.12,4.39-9.19c0-2.84-.61-5.73-1.58-7.72-.9.04-1.84.05-2.81.02-.97.03-1.91.02-2.81-.02Z"/></svg>`,
  [PokemonType.DRAGON]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#535ca8" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M12.39,23.98c-8.41,11.05-7.23,26.81,3.02,36.47,1.09-3.6,3.14-6.95,6.1-9.6-2.28-3.06-3.67-6.68-4.04-10.48-5.13-3.92-7-10.56-5.08-16.4h0ZM64.31,23.98c1.92,5.84.05,12.48-5.08,16.4-.38,3.88-1.82,7.47-4.04,10.48,2.96,2.65,5.01,5.99,6.1,9.6,10.25-9.65,11.43-25.42,3.02-36.47h0ZM51.36,25.31c-1.12-7.41-3.63-15.73-4.89-19.64-.22-.68-1.26-.66-1.44.03-1.17,4.28-2.6,11.09-3.24,14.2-1.07-.2-2.29-.32-3.42-.32s-2.35.11-3.42.32c-.64-3.11-2.07-9.91-3.24-14.2-.19-.69-1.22-.72-1.44-.03-1.26,3.91-3.78,12.22-4.89,19.64-2.67,2.99-4.3,6.93-4.3,11.33,0,6.35,3.37,13.85,8.39,18.21l1.38,12.27c0,1.8,3.37,4.41,7.53,4.41s7.53-2.62,7.53-4.41l1.38-12.27c5.02-4.36,8.39-11.86,8.39-18.21,0-4.4-1.63-8.34-4.3-11.33h-.02ZM29.81,48.82c-2.98-.92-5.06-3.61-5.15-6.73-.12-3.67.07-7.59.07-7.59l9.2,15.41c-1.61-.37-2.97-.74-4.12-1.09ZM46.91,48.82c-1.14.35-2.51.73-4.12,1.09l9.2-15.41s.19,3.92.07,7.59c-.1,3.11-2.17,5.82-5.15,6.73Z"/></svg>`,
  [PokemonType.ELECTRIC]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#f6d851" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M37.97,6.94c2.5,1.14,12.84,6.04,19.84,12.22.31.27.34.75.07,1.06-1.55,1.8-6.66,7.75-12.82,14.99-.27.32-.24.8.07,1.08,1.8,1.59,7.48,6.69,10.91,10.43.28.3.26.77-.04,1.06-2.98,2.87-17.73,17.06-23.45,21.97-.3.26-.76-.02-.67-.41.74-3.02,2.8-11.05,4.99-16.89.12-.31.02-.66-.25-.86-2.15-1.64-11.56-8.86-17.74-14.4-.26-.23-.32-.61-.16-.91,1.36-2.62,7.8-14.72,18.32-29.07.21-.29.6-.4.92-.25v-.02Z"/></svg>`,
  [PokemonType.FAIRY]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#dab4d4" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M66.36,12.08c-2.18-2.18-15.61-3.16-24.65,5.88-1.55,1.55-2.63,3.4-3.25,5.35-.62-1.96-1.7-3.8-3.25-5.35-9.04-9.04-22.47-8.06-24.65-5.88-2.18,2.18-3.16,15.61,5.88,24.65,1.91,1.91,4.26,3.11,6.73,3.61-5,4.33-5.57,11.18-4.61,12.52,1.02,1.42,8.4,3.21,14.31-.94-.27.79-.53,1.6-.79,2.44-2.47,8.08-3.39,14.96-2.07,15.36,1.33.41,4.41-5.81,6.88-13.89.62-2.03,1.15-3.99,1.56-5.79.41,1.8.94,3.76,1.56,5.79,2.47,8.08,5.55,14.3,6.88,13.89s.4-7.29-2.07-15.36c-.26-.84-.52-1.65-.79-2.44,5.91,4.15,13.3,2.36,14.31.94.96-1.34.39-8.18-4.61-12.52,2.47-.5,4.82-1.7,6.73-3.61,9.04-9.04,8.06-22.47,5.88-24.65h.02ZM38.46,40.13c-4.31,0-8.04-2.45-9.9-6.03,5.01-.02,9.15-3.74,9.81-8.57.02-.12.17-.12.18,0,.66,4.83,4.8,8.56,9.81,8.57-1.86,3.58-5.59,6.03-9.9,6.03Z"/></svg>`,
  [PokemonType.FIGHTING]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#e09c40" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M40.72,34.03h21.8v9.88h-21.8v-9.88ZM54.05,12.03v17.66h8.47V12.03h-8.47ZM49.19,12.03h-8.47v17.66h8.47V12.03ZM35.99,12.03h-8.47v23.22h8.47V12.03ZM22.66,12.03h-8.47v23.22h8.47V12.03ZM36.69,43.46H14.19v12.97l14.41,9.42,33.92-10.46v-7.38h-25.83v-4.54h0Z"/></svg>`,
  [PokemonType.FIRE]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#e56c3e" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M55.78,38.1c-5.32-5.15-3.66-9.14-1.21-11.26,0,0-6.53-.79-8.85,4.53-2.33,5.32,2.16,8.06,2.16,8.06,0,0-6.48-2.58-4.66-8.9,1.61-5.56,4.57-8.48,3.24-14.38-1.5-6.67-10.97-9.49-15.55-7.74,3.2,1.08,5.51,4.09,5.51,7.66,0,4.16-3.29,6.92-7.71,11.39-5.11,5.15-10.32,10.97-10.32,20.31,0,10.78,6.65,17.45,14.62,19.87-4.04-1.93-12.45-7.99-11.4-19.65,1.1-12.3,12.89-20.7,12.89-20.7,0,0-2.54,4.26-1.43,11.16.62,3.88,3.4,8.65,6.05,10.72,3.72,2.91,8.64,5.93,7.93,11.45-.67,5.18-7.55,7.5-11.02,7.71,1.58.26,3.19.37,4.78.32,11.81,0,20.58-8.78,20.58-18.12,0-7.39-3.54-10.43-5.62-12.43h0Z"/></svg>`,
  [PokemonType.FLYING]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#a2c3e7" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M23.78,27.7c-1.94,4.43-7.5,23.12-8.81,33.15-.67,5.09-1.31,6.86,0,7.25,1.66.5,8.65-10.31,11.14-14.47,0,0,15.92,2.39,24.09-7.79.19-.24-.02-.59-.32-.53-3.22.55-14.81,2.34-19.94.35,0,0,20.89.81,30.38-14.67.13-.2-.08-.46-.3-.38-3.29,1.19-17.5,5.86-26.01,3.66,0,0,13.83-.81,24.28-10.31,10.45-9.5,11.31-14.3,10.56-15.05-1.42-1.42-8.65,2.16-14.47,3.99s-13.14,3.99-17.96,4.99-8.81,1.08-12.64,9.81Z"/></svg>`,
  [PokemonType.GHOST]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#684870" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M64.73,37.52c-2.45-.58-4.47.48-5.75,1.48.49-2.06.77-4.09.77-6.02,0-11.82-9.58-21.4-21.4-21.4s-21.4,9.58-21.4,21.4c0,1.93.28,3.96.77,6.02-1.28-.99-3.31-2.06-5.75-1.48-3.51.83-6.4,5.88-6.57,10.24-.03.9,1.07,1.36,1.67.69.97-1.09,2.24-2.21,3.12-1.84,2.88,1.22,3.1,6.32,5.87,6.32,2.43,0,4.52-2.43,5.54-3.86,4.66,8.79,11.84,16.06,16.74,16.06s12.07-7.26,16.74-16.06c1.02,1.43,3.11,3.86,5.54,3.86,2.77,0,2.99-5.1,5.87-6.32.88-.37,2.15.74,3.12,1.84.6.67,1.71.21,1.67-.69-.17-4.36-3.06-9.41-6.57-10.24h.02ZM33.14,34.78c-1.78.83-4.48-1.18-6.03-4.5-1.55-3.32-1.35-6.68.43-7.51s4.48,1.18,6.03,4.5,1.36,6.68-.43,7.51ZM49.59,30.28c-1.55,3.32-4.25,5.33-6.03,4.5s-1.98-4.2-.43-7.51c1.55-3.32,4.25-5.33,6.03-4.5s1.98,4.2.43,7.51Z"/></svg>`,
  [PokemonType.GRASS]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#66a945" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M11.47,66.62h17.63s4.82-44.39,2.33-44.39-19.96,44.39-19.96,44.39ZM41.07,66.62h17.62s8.31-44.39,5.82-44.39-23.44,44.39-23.44,44.39ZM35.08,66.62l12.8-25.44s4.66-30.26,2.49-30.26-13.14,26.94-13.14,26.94l-2.16,28.76h0Z"/></svg>`,
  [PokemonType.GROUND]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#9c7743" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M52.29,16.07h8.31v8.31h-8.31v-8.31ZM27.85,22.56h6.48v6.48h-6.48v-6.48ZM13.55,8.92h10.81v10.81h-10.81v-10.81ZM67.44,48.21v-2.11l-29.09-11.61-29.09,11.61v2.11l29.09,11.6,29.09-11.6Z"/><path d="M67.52,53.52l-29.17,11.78-29.16-11.78-1.47,3.64,30.63,12.38,30.64-12.38-1.47-3.64Z"/></svg>`,
  [PokemonType.ICE]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#6dc8eb" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M31.4,11.74l6.95-6.95,6.95,6.95-6.95,6.95-6.95-6.95Z"/><path d="M11.49,48.24h9.83v9.83h-9.83s0-9.83,0-9.83Z"/><path d="M31.4,64.97l6.95-6.95,6.95,6.95-6.95,6.95-6.95-6.95Z"/><path d="M55.38,18.75v9.77l-17.03-9.83-17.03,9.83v-9.77h-9.83v9.83h9.83v19.6l17.03,9.83,17.03-9.83v-19.6h9.83v-9.83s-9.83,0-9.83,0ZM31.14,34.32v9.62h-5.11v-12.6h.05l10.86-6.27,2.55,4.42-8.36,4.83h.01ZM55.38,48.24h9.83v9.83h-9.83s0-9.83,0-9.83Z"/></svg>`,
  [PokemonType.NORMAL]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#949495" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M63.81,26.43c3.12-4.29,2.43-10.33-1.69-13.79-4-3.36-9.82-3.11-13.54.39-3.18-1.21-6.63-1.88-10.23-1.88s-7.05.67-10.23,1.88c-3.71-3.5-9.53-3.74-13.54-.39-4.13,3.46-4.81,9.49-1.69,13.79-2.17,4.05-3.4,8.67-3.4,13.58,0,15.91,12.95,28.86,28.86,28.86s28.86-12.95,28.86-28.86c0-4.91-1.23-9.53-3.4-13.58ZM38.35,60.87c-11.5,0-20.86-9.36-20.86-20.86s9.36-20.86,20.86-20.86,20.86,9.36,20.86,20.86-9.36,20.86-20.86,20.86Z"/></svg>`,
  [PokemonType.POISON]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#735198" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M47.7,56.75c-.55-4.68-4.52-8.31-9.35-8.31s-8.8,3.63-9.35,8.31c-11.51.84-19.8,3.18-19.8,5.93,0,3.46,13.05,6.26,29.15,6.26s29.15-2.8,29.15-6.26c0-2.76-8.29-5.09-19.8-5.93Z"/><circle cx="28.31" cy="23.22" r="11.2"/><circle cx="51.28" cy="37.57" r="6.64"/></svg>`,
  [PokemonType.PSYCHIC]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#dd6b7b" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M66.48,44.65c-2.36-4.27-2.37-8.4.04-12.65,1.04-1.84,2.03-3.78,1.67-5.73,0-5.2-3.13-8.61-8.3-8.82-6.03-.25-10.55-2.33-13.86-7.79-3.86-6.36-11.46-6.32-15.35.06-3.25,5.33-7.66,7.44-13.6,7.72-7.09.33-10.81,6.68-7.44,13,2.92,5.48,2.87,10.44-.04,15.89-3.34,6.27.44,12.6,7.55,12.94,5.82.28,10.2,2.29,13.4,7.53,4.06,6.65,11.63,6.62,15.68-.06,3.2-5.28,7.63-7.32,13.44-7.44,1.96-.04,3.8-.49,5.36-1.87,3.8-3.33,4.37-7.51,1.44-12.79ZM55.86,50.44c-6.39.68-11.53,3.47-15.38,8.69-1.49,2.03-2.81,1.95-4.38-.17-3.72-5.03-8.71-7.78-14.87-8.46-2.35-.26-2.97-1.2-1.86-3.49,1.31-2.7,1.83-5.67,2.02-8.72-.25-2.97-.74-5.93-2.07-8.64-1.03-2.1-.52-3.14,1.71-3.38,6.28-.69,11.35-3.43,15.13-8.57,1.53-2.07,2.88-2.09,4.39-.04,3.77,5.14,8.84,7.9,15.12,8.6,2.18.24,2.78,1.19,1.79,3.35-2.69,5.84-2.67,11.77.04,17.61.9,1.94.45,3.01-1.63,3.23Z"/></svg>`,
  [PokemonType.ROCK]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#bfb889" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M58.71,18l2.67,11.72-14.39-14.39,11.72,2.67-8.43-8.43h-23.85L9.57,26.43v23.85l8.23,8.23-4.49-19.72,24.21,24.21-19.72-4.49,8.63,8.63h23.85l8.43-8.43-19.72,4.49,24.21-24.21-4.49,19.72,8.43-8.43v-23.85l-8.43-8.43Z"/></svg>`,
  [PokemonType.STEEL]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#69a9c7" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M41,27.35l9.18,32.02,17.37-12.62-8.03-24.71-18.52,5.31ZM52.3,37.6c-2.52,0-4.56-2.04-4.56-4.56s2.04-4.56,4.56-4.56,4.56,2.04,4.56,4.56-2.04,4.56-4.56,4.56Z"/><path d="M37.9,38.21l-4.29-14.95,24.07-6.9-1.28-3.93H20.3l-11.15,34.32,28.75-8.54ZM26.03,15.23c1.87,0,3.38,1.51,3.38,3.38s-1.51,3.38-3.38,3.38-3.38-1.51-3.38-3.38,1.51-3.38,3.38,3.38ZM39.04,42.18l-25.69,7.63,25,18.17,6.69-4.87-6-20.93Z"/></svg>`,
  [PokemonType.WATER]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.71 76.71" class="h-8 w-8" fill="currentColor"><rect fill="#5185c5" width="76.71" height="76.71" rx="6.57" ry="6.57"/><path d="M54,41.57s-3.96-6.86-5.85-9.78c-1.97-3.07-3.82-6.73-5.26-12.61-1.44-5.87-2.22-11.53-4.54-11.53s-3.1,5.65-4.54,11.53c-1.44,5.87-3.29,9.53-5.26,12.61-1.88,2.93-5.85,9.78-5.85,9.78-1.69,2.81-2.59,6.04-2.58,9.32,0,10.03,8.2,18.17,18.23,18.17s18.23-8.13,18.23-18.17c0-3.41-.95-6.59-2.58-9.32ZM38.35,64.96c-8.18,0-14.61-6.1-14.61-10.5,0-2.91,6.43,2.52,14.61,2.52s14.61-5.43,14.61-2.52c0,4.41-6.43,10.5-14.61,10.5Z"/></svg>`,
};


export const TYPE_COLORS: { [key in PokemonType]: string } = {
  [PokemonType.NORMAL]: 'bg-[#949495] text-white',
  [PokemonType.FIRE]: 'bg-[#d6734a] text-white',
  [PokemonType.WATER]: 'bg-[#5d84c0] text-white',
  [PokemonType.GRASS]: 'bg-[#76a752] text-white',
  [PokemonType.ELECTRIC]: 'bg-[#f1d969] text-white',
  [PokemonType.ICE]: 'bg-[#83c6e7] text-white',
  [PokemonType.FIGHTING]: 'bg-[#d69f52] text-white',
  [PokemonType.POISON]: 'bg-[#6e5294] text-white',
  [PokemonType.GROUND]: 'bg-[#96784b] text-white',
  [PokemonType.FLYING]: 'bg-[#a8c2e4] text-white',
  [PokemonType.PSYCHIC]: 'bg-[#cf717d] text-white',
  [PokemonType.BUG]: 'bg-[#a0a252] text-white',
  [PokemonType.ROCK]: 'bg-[#beb88e] text-white',
  [PokemonType.GHOST]: 'bg-[#63496e] text-white',
  [PokemonType.DRAGON]: 'bg-[#555ca3] text-white',
  [PokemonType.DARK]: 'bg-[#4c4948] text-white',
  [PokemonType.STEEL]: 'bg-[#729fba] text-white',
  [PokemonType.FAIRY]: 'bg-[#d4b5d2] text-white',
};

type RawChart = { [key in PokemonType]?: { [key in PokemonType]?: number } };
type FullChart = { [key in PokemonType]: { [key in PokemonType]: number } };

const allTypes = Object.values(PokemonType);

const createFullChart = (rawChart: RawChart): FullChart => {
    return allTypes.reduce((acc, attacker) => {
        acc[attacker] = allTypes.reduce((defAcc, defender) => {
            defAcc[defender] = rawChart[attacker]?.[defender] ?? 1;
            return defAcc;
        }, {} as { [key in PokemonType]: number });
        return acc;
    }, {} as FullChart);
};

// Generation 6+ (X/Y onwards)
const rawChartGen6: RawChart = {
    [PokemonType.NORMAL]:   { [PokemonType.ROCK]: 0.5, [PokemonType.GHOST]: 0, [PokemonType.STEEL]: 0.5 },
    [PokemonType.FIRE]:     { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.ICE]: 2, [PokemonType.BUG]: 2, [PokemonType.ROCK]: 0.5, [PokemonType.DRAGON]: 0.5, [PokemonType.STEEL]: 2 },
    [PokemonType.WATER]:    { [PokemonType.FIRE]: 2, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.ROCK]: 2, [PokemonType.DRAGON]: 0.5 },
    [PokemonType.ELECTRIC]: { [PokemonType.WATER]: 2, [PokemonType.ELECTRIC]: 0.5, [PokemonType.GRASS]: 0.5, [PokemonType.GROUND]: 0, [PokemonType.FLYING]: 2, [PokemonType.DRAGON]: 0.5 },
    [PokemonType.GRASS]:    { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.POISON]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.FLYING]: 0.5, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.DRAGON]: 0.5, [PokemonType.STEEL]: 0.5 },
    [PokemonType.ICE]:      { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.ICE]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.FLYING]: 2, [PokemonType.DRAGON]: 2, [PokemonType.STEEL]: 0.5 },
    [PokemonType.FIGHTING]: { [PokemonType.NORMAL]: 2, [PokemonType.ICE]: 2, [PokemonType.POISON]: 0.5, [PokemonType.FLYING]: 0.5, [PokemonType.PSYCHIC]: 0.5, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.GHOST]: 0, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 2, [PokemonType.FAIRY]: 0.5 },
    [PokemonType.POISON]:   { [PokemonType.GRASS]: 2, [PokemonType.POISON]: 0.5, [PokemonType.GROUND]: 0.5, [PokemonType.ROCK]: 0.5, [PokemonType.GHOST]: 0.5, [PokemonType.STEEL]: 0, [PokemonType.FAIRY]: 2 },
    [PokemonType.GROUND]:   { [PokemonType.FIRE]: 2, [PokemonType.ELECTRIC]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.POISON]: 2, [PokemonType.FLYING]: 0, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.STEEL]: 2 },
    [PokemonType.FLYING]:   { [PokemonType.ELECTRIC]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.FIGHTING]: 2, [PokemonType.BUG]: 2, [PokemonType.ROCK]: 0.5, [PokemonType.STEEL]: 0.5 },
    [PokemonType.PSYCHIC]:  { [PokemonType.FIGHTING]: 2, [PokemonType.POISON]: 2, [PokemonType.PSYCHIC]: 0.5, [PokemonType.DARK]: 0, [PokemonType.STEEL]: 0.5 },
    [PokemonType.BUG]:      { [PokemonType.FIRE]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.FIGHTING]: 0.5, [PokemonType.POISON]: 0.5, [PokemonType.FLYING]: 0.5, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 0.5, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 0.5 },
    [PokemonType.ROCK]:     { [PokemonType.FIRE]: 2, [PokemonType.ICE]: 2, [PokemonType.FIGHTING]: 0.5, [PokemonType.GROUND]: 0.5, [PokemonType.FLYING]: 2, [PokemonType.BUG]: 2, [PokemonType.STEEL]: 0.5 },
    [PokemonType.GHOST]:    { [PokemonType.NORMAL]: 0, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 2, [PokemonType.DARK]: 0.5 },
    [PokemonType.DRAGON]:   { [PokemonType.DRAGON]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 0 },
    [PokemonType.DARK]:     { [PokemonType.FIGHTING]: 0.5, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 2, [PokemonType.DARK]: 0.5, [PokemonType.FAIRY]: 0.5 },
    [PokemonType.STEEL]:    { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.ELECTRIC]: 0.5, [PokemonType.ICE]: 2, [PokemonType.ROCK]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 2 },
    [PokemonType.FAIRY]:    { [PokemonType.FIRE]: 0.5, [PokemonType.FIGHTING]: 2, [PokemonType.POISON]: 0.5, [PokemonType.DRAGON]: 2, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 0.5 },
};

// Generation 2-5 (Gold/Silver/Crystal to Black2/White2)
const rawChartGen2_5: RawChart = JSON.parse(JSON.stringify(rawChartGen6));
delete rawChartGen2_5[PokemonType.FAIRY];
for (const typeStr in rawChartGen2_5) {
    const type = typeStr as PokemonType;
    if (rawChartGen2_5[type]) {
        delete rawChartGen2_5[type]![PokemonType.FAIRY];
    }
}
// In Gen 2-5, Steel resisted Dark and Ghost.
if (!rawChartGen2_5[PokemonType.GHOST]) rawChartGen2_5[PokemonType.GHOST] = {};
rawChartGen2_5[PokemonType.GHOST]![PokemonType.STEEL] = 0.5;
if (!rawChartGen2_5[PokemonType.DARK]) rawChartGen2_5[PokemonType.DARK] = {};
rawChartGen2_5[PokemonType.DARK]![PokemonType.STEEL] = 0.5;


// Generation 1 (Red/Blue/Yellow)
const rawChartGen1: RawChart = JSON.parse(JSON.stringify(rawChartGen2_5));
delete rawChartGen1[PokemonType.DARK];
delete rawChartGen1[PokemonType.STEEL];
for (const typeStr in rawChartGen1) {
    const type = typeStr as PokemonType;
    if(rawChartGen1[type]) {
        delete rawChartGen1[type]![PokemonType.DARK];
        delete rawChartGen1[type]![PokemonType.STEEL];
    }
}
// Gen 1 specific changes
if (!rawChartGen1[PokemonType.BUG]) rawChartGen1[PokemonType.BUG] = {};
rawChartGen1[PokemonType.BUG]![PokemonType.POISON] = 2;

if (!rawChartGen1[PokemonType.POISON]) rawChartGen1[PokemonType.POISON] = {};
rawChartGen1[PokemonType.POISON]![PokemonType.BUG] = 2; // Was also 2x in Gen 1

if (!rawChartGen1[PokemonType.GHOST]) rawChartGen1[PokemonType.GHOST] = {};
rawChartGen1[PokemonType.GHOST]![PokemonType.PSYCHIC] = 0; // Due to a bug in the game

if (rawChartGen1[PokemonType.ICE]) {
    delete rawChartGen1[PokemonType.ICE]![PokemonType.FIRE]; // Was neutral in Gen 1
}

export const TYPE_CHART_GEN_6 = createFullChart(rawChartGen6);
export const TYPE_CHART_GEN_2_5 = createFullChart(rawChartGen2_5);
export const TYPE_CHART_GEN_1 = createFullChart(rawChartGen1);

export const GAME_VERSION_ORDER = [
    'red-blue',
    'yellow',
    'gold-silver',
    'crystal',
    'ruby-sapphire',
    'emerald',
    'firered-leafgreen',
    'diamond-pearl',
    'platinum',
    'heartgold-soulsilver',
    'black-white',
    'black-2-white-2',
    'x-y',
    'omega-ruby-alpha-sapphire',
    'sun-moon',
    'ultra-sun-ultra-moon',
    'lets-go-pikachu-lets-go-eevee',
    'sword-shield',
    'the-isle-of-armor',
    'the-crown-tundra',
    'brilliant-diamond-and-shining-pearl',
    'legends-arceus',
    'scarlet-violet',
    'the-teal-mask',
    'the-indigo-disk'
];

export const VERSION_TO_GROUP_MAP: { [versionName: string]: string } = {
    'red': 'red-blue',
    'blue': 'red-blue',
    'yellow': 'yellow',
    'gold': 'gold-silver',
    'silver': 'gold-silver',
    'crystal': 'crystal',
    'ruby': 'ruby-sapphire',
    'sapphire': 'ruby-sapphire',
    'emerald': 'emerald',
    'firered': 'firered-leafgreen',
    'leafgreen': 'firered-leafgreen',
    'diamond': 'diamond-pearl',
    'pearl': 'diamond-pearl',
    'platinum': 'platinum',
    'heartgold': 'heartgold-soulsilver',
    'soulsilver': 'heartgold-soulsilver',
    'black': 'black-white',
    'white': 'black-white',
    'black-2': 'black-2-white-2',
    'white-2': 'black-2-white-2',
    'x': 'x-y',
    'y': 'x-y',
    'omega-ruby': 'omega-ruby-alpha-sapphire',
    'alpha-sapphire': 'omega-ruby-alpha-sapphire',
    'sun': 'sun-moon',
    'moon': 'sun-moon',
    'ultra-sun': 'ultra-sun-ultra-moon',
    'ultra-moon': 'ultra-sun-ultra-moon',
    'lets-go-pikachu': 'lets-go-pikachu-lets-go-eevee',
    'lets-go-eevee': 'lets-go-pikachu-lets-go-eevee',
    'sword': 'sword-shield',
    'shield': 'sword-shield',
    'brilliant-diamond': 'brilliant-diamond-and-shining-pearl',
    'shining-pearl': 'brilliant-diamond-and-shining-pearl',
    'legends-arceus': 'legends-arceus',
    'scarlet': 'scarlet-violet',
    'violet': 'scarlet-violet',
};