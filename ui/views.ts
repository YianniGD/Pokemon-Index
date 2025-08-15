import { POKEDEX_LIST, GAME_ERA_GROUPS, GAME_VERSION_ORDER, VERSION_TO_GROUP_MAP, TYPE_CHART_GEN_1, TYPE_CHART_GEN_2_5, TYPE_CHART_GEN_6 } from '../constants.ts';
import { LOADER_SVG, GIGANTAMAX_ICON_SVG, SPEAKER_ICON_SVG, POKEMON_SHAPES_SVG_SPRITES, GAME_ICONS } from '../assets.ts';
import { state } from '../state.ts';
import { PokemonType } from '../constants.ts';
import { EvolutionNode } from '../types.ts';
import { escapeHtml, getPokemonNameAndBadges, formatHeight, formatWeight, shouldShowEvolutionChain, toTitleCase } from '../utils.ts';
import { 
    getHeaderHTML, 
    getFooterHTML,
    getGenerationSelectorHTML,
    generatePokemonGridHTML,
    generateItemListHTML,
    getItemCategoriesHTML,
    getAlternateFormThumbnailsHTML,
    getTypeDisplayHTML,
    getGenderRatioHTML,
    getEVYieldHTML,
    getStatChartHTML,
    getPokedexEntriesHTML,
    getHeldItemsHTML,
    getLocationsHTML,
    generateAbilityListHTML,
    getAbilityDetailHTML,
    generateAttackListHTML,
    getAttackDetailHTML,
    getPokemonMovesTableHTML,
    generateTMListHTML
} from './components.ts';


export function getHomeViewHTML(): string {
    const getSelectionViewHTML = () => {
        if (state.isLoadingDB) {
            return `<div class="flex justify-center items-center p-8">${LOADER_SVG}</div>`;
        }

        const buttonHTML = (p: typeof POKEDEX_LIST[0]) => `
            <button data-pokedex-id="${p.id}" class="pokedex-select-btn w-full px-4 py-3 bg-zinc-800 text-zinc-200 font-bold rounded-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-white">
                ${p.name}
            </button>
        `;

        const gameButtons = POKEDEX_LIST.filter(p => p.category === 'game').map(buttonHTML).join('');
        const otherButtons = POKEDEX_LIST.filter(p => p.category === 'other' && p.id !== 'extra' && p.id !== 'national').map(buttonHTML).join('');

        const toolsNavHTML = `
            <div>
                <h2 class="text-2xl font-bold text-center mb-6 text-zinc-300">Tools & Databases</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button data-pokedex-id="national" class="pokedex-select-btn text-left p-6 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white">
                        <h3 class="text-xl font-bold text-zinc-100">National Pokédex</h3>
                        <p class="mt-2 text-zinc-400 text-sm">A list of all Pokémon from every generation.</p>
                    </button>
                    <button data-view="chart" class="nav-btn text-left p-6 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white">
                        <h3 class="text-xl font-bold text-zinc-100">Type Chart</h3>
                        <p class="mt-2 text-zinc-400 text-sm">Interactive chart for weaknesses and resistances.</p>
                    </button>
                    <button data-view="attacks" class="nav-btn text-left p-6 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white">
                        <h3 class="text-xl font-bold text-zinc-100">Attack Index</h3>
                        <p class="mt-2 text-zinc-400 text-sm">Browse all moves, their stats, and effects.</p>
                    </button>
                    <button data-view="abilities" class="nav-btn text-left p-6 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white">
                        <h3 class="text-xl font-bold text-zinc-100">Ability Index</h3>
                        <p class="mt-2 text-zinc-400 text-sm">Explore all Pokémon abilities and who can learn them.</p>
                    </button>
                    <button data-view="items" class="nav-btn text-left p-6 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white">
                        <h3 class="text-xl font-bold text-zinc-100">Item Index</h3>
                        <p class="mt-2 text-zinc-400 text-sm">A complete database of items from the games.</p>
                    </button>
                </div>
            </div>
        `;

        return `
            <div class="min-h-screen flex flex-col">
                ${getHeaderHTML()}
                <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                     <div class="flex flex-col items-center">
                         <h1 class="text-3xl sm:text-4xl font-bold text-center text-zinc-100 mb-2">Pokédex</h1>
                         <p class="text-zinc-400 max-w-xl text-center mb-8">Select a Pokédex from the lists below, or use one of the tools.</p>
                        
                         <div class="w-full max-w-5xl mx-auto space-y-12">
                            ${toolsNavHTML}
                             <div>
                                <h2 class="text-2xl font-bold text-center mb-4 text-zinc-300">By Game</h2>
                                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                   ${gameButtons}
                                </div>
                            </div>
                             <div>
                                <h2 class="text-2xl font-bold text-center mb-4 text-zinc-300">Other Pokédexes</h2>
                                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                   ${otherButtons}
                                </div>
                            </div>
                         </div>
                    </div>
                </main>
                ${getFooterHTML()}
            </div>
        `;
    };
    
    const getListViewHTML = () => {
        if (!state.selectedPokedex) return '';

        let content;
        if (state.isLoadingPokedexList) {
            content = `<div class="flex justify-center items-center p-8">${LOADER_SVG}</div>`;
        } else {
            content = generatePokemonGridHTML(state.currentPokemonList);
        }

        let generationSelectorHTML = '';
        if (state.selectedPokedex.id === 'national') {
            const genButtons = POKEDEX_LIST.filter(p => p.category === 'generation').map(p => `
                <button data-pokedex-id="${p.id}" class="pokedex-select-btn px-4 py-2 bg-zinc-800 text-zinc-200 font-bold rounded-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-white">
                    ${p.name}
                </button>
            `).join('');

            generationSelectorHTML = `
                <div class="mb-8">
                    <h2 class="text-xl font-bold text-center mb-4 text-zinc-300">View by Generation</h2>
                    <div class="flex flex-wrap gap-3 justify-center">
                        ${genButtons}
                    </div>
                </div>
            `;
        }

        const pokedexHeaderContent = `
            <div class="bg-zinc-900 border-b border-zinc-700 sticky top-[80px] sm:top-[84px] z-30">
                <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-center items-center gap-4 py-4">
                        <h1 class="text-2xl font-bold text-center text-zinc-100 flex-grow">${state.selectedPokedex.name}</h1>
                    </div>
                </div>
            </div>
        `;
        return `
            <div class="min-h-screen flex flex-col">
                ${getHeaderHTML(pokedexHeaderContent)}
                <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    ${generationSelectorHTML}
                    <div id="pokemon-grid-container">${content}</div>
                </main>
                ${getFooterHTML()}
            </div>
        `;
    };

    return `
        ${state.homeViewMode === 'list' ? getListViewHTML() : getSelectionViewHTML()}
    `;
}

export function getChartViewHTML(): string {
    return `
      <div class="min-h-screen flex flex-col">
        ${getHeaderHTML()}
        <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h1 class="text-3xl sm:text-4xl font-bold text-center text-zinc-100">Type Chart</h1>
                ${getGenerationSelectorHTML()}
            </div>
            <p class="text-zinc-400 max-w-2xl text-center mx-auto mb-8">
                Select one or two defending types from the top row to calculate their combined weaknesses and resistances against all attacking types.
            </p>
            <div class="p-4 bg-zinc-950/50 rounded-lg">
                <div class="flex">
                    <div id="type-chart-fixed-container" class="pr-1 pt-2">
                        <!-- Fixed columns (JS populated) -->
                    </div>
                    <div id="type-chart-scroll-container" class="overflow-x-auto pt-2">
                        <!-- Scrollable columns (JS populated) -->
                    </div>
                </div>
            </div>
            <div id="matching-pokemon-container" class="mt-8"></div>
        </main>
        ${getFooterHTML()}
      </div>
    `;
}

function getEvolutionChainHTML(): string {
    if (state.isLoadingEvolution) {
        return `<div class="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-lg"><div class="flex justify-center items-center p-8">${LOADER_SVG}</div></div>`;
    }
    if (!state.selectedPokemonEvolutionChain) {
        return '';
    }
    
    if (!shouldShowEvolutionChain(state.selectedPokemonDetails)) {
        return '';
    }

    const currentPokemonId = state.selectedPokemonDetails?.id;

    function renderNode(node: EvolutionNode): string {
        const isCurrent = node.id === currentPokemonId;
        const ringClass = isCurrent ? 'ring-2 ring-white' : 'ring-2 ring-transparent';
        const { baseName } = getPokemonNameAndBadges(node.name);

        const nodeItselfHTML = `
            <div class="flex flex-col items-center gap-1 flex-shrink-0">
                <button class="pokemon-select-btn group transition-transform hover:scale-105 w-24 h-24" data-pokemon-url="${node.url}">
                    <div class="bg-zinc-800 rounded-full p-1 aspect-square flex items-center justify-center transition group-hover:bg-zinc-700 ${ringClass}">
                        <img src="${node.imageUrl}" alt="${node.name}" class="w-full h-full object-contain drop-shadow-md" loading="lazy">
                    </div>
                </button>
                <span class="font-bold capitalize text-center text-sm">${baseName}</span>
            </div>
        `;
        
        if (node.evolvesTo.length === 0) {
            return nodeItselfHTML;
        }

        const evolutionsHTML = node.evolvesTo.map(evo => `
            <div class="flex items-center">
                 <div class="flex flex-col items-center justify-center gap-1 w-20 text-center text-zinc-300 mx-2 flex-shrink-0">
                    <svg class="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    ${evo.details}
                </div>
                ${renderNode(evo.node)}
            </div>
        `).join('<div class="w-full h-px bg-zinc-700 my-2"></div>');

        return `
            <div class="flex items-center">
                ${nodeItselfHTML}
                <div class="flex flex-col ml-2">
                    ${evolutionsHTML}
                </div>
            </div>
        `;
    }

    return `
        <div class="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
            <h3 class="font-bold text-zinc-100 mb-4 text-center">Evolution Chain</h3>
            <div class="flex items-start justify-center overflow-x-auto p-2">
                ${renderNode(state.selectedPokemonEvolutionChain)}
            </div>
        </div>
    `;
}

export function getPokedexBodyHTML(): string {
    if (state.isLoadingPokedexEntry || !state.selectedPokemonDetails || !state.activeFormName) {
        return `
            <div class="flex-grow w-full max-w-screen-2xl mx-auto py-8 flex justify-center items-center px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col items-center gap-4 text-zinc-400">
                    ${LOADER_SVG}
                    <span>Loading Pokémon data...</span>
                </div>
            </div>
        `;
    }

    const basePokemon = state.selectedPokemonDetails;
    const allForms = [basePokemon, ...(basePokemon.allOtherFormsDetails || [])];
    const activeForm = allForms.find((f: any) => f.name === state.activeFormName) || basePokemon;
    
    const species = basePokemon.speciesData;
    
    const typesHTML = activeForm.types.map((t: any) => {
        const typeName = t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1);
        return getTypeDisplayHTML(typeName as PokemonType, { className: 'h-11 w-24 text-base shadow-lg'});
    }).join('');

    const { baseName } = getPokemonNameAndBadges(activeForm.name);
    
    const gmaxForm = basePokemon.allOtherFormsDetails?.find((f: any) => f.name.endsWith('-gmax'));
    const hasGmax = !!gmaxForm;
    const shouldShowGmaxIcon = hasGmax && state.selectedGameEraName === 'Gen VIII';
    const gmaxArtworkUrl = gmaxForm ? gmaxForm.sprites.other['official-artwork'].front_default : '';

    const shapeId = species.shape ? `#shape-${species.shape.name}` : '';
    
    const getFlavorText = (eraName: string | null) => {
        if (!eraName) return 'Select a game era to see a Pokédex entry.';
        const era = GAME_ERA_GROUPS.find(e => e.name === eraName);
        if (!era) return 'No entry available for this game era.';

        const entry = species.flavor_text_entries.findLast((fte: any) => {
            if (!fte.version?.name) return false;
            const versionGroup = VERSION_TO_GROUP_MAP[fte.version.name];
            return versionGroup && era.groups.includes(versionGroup) && fte.language.name === 'en';
        });
        return entry ? escapeHtml(entry.flavor_text.replace(/\f/g, ' ')) : 'No entry available for this game era.';
    };
    
    const gameTabs = GAME_ERA_GROUPS.map(era => {
        const isAvailable = basePokemon.moves.some((m: any) => m.version_group_details.some((vgd: any) => era.groups.includes(vgd.version_group.name)));
        const isSelected = state.selectedGameEraName === era.name;

        return `
        <button 
            class="game-era-tab px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-colors whitespace-nowrap
            ${isSelected ? 'bg-zinc-200 text-zinc-900 shadow-sm' : ''}
            ${!isSelected && isAvailable ? 'text-zinc-300 bg-zinc-700 hover:bg-zinc-600' : ''}
            ${!isAvailable ? 'text-zinc-600 bg-zinc-800/50 cursor-not-allowed' : 'cursor-pointer'}"
            data-game-era-name="${era.name}"
            aria-pressed="${isSelected}"
            ${!isAvailable ? 'disabled' : ''}
        >
            ${era.name}
        </button>`;
    }).join('');
    
    const selectedEra = GAME_ERA_GROUPS.find(e => e.name === state.selectedGameEraName);
    
    type MoveDetail = { name: string; level: number; method: string; versionGroup: string; };

    const allMovesInEra: MoveDetail[] = basePokemon.moves
        .flatMap((m: any): MoveDetail[] => 
            m.version_group_details
                .filter((vgd: any) => selectedEra && selectedEra.groups.includes(vgd.version_group.name))
                .map((vgd: any): MoveDetail => ({
                    name: m.move.name.replace(/-/g, ' '),
                    level: vgd.level_learned_at,
                    method: vgd.move_learn_method.name,
                    versionGroup: vgd.version_group.name
                }))
        )
        .filter(Boolean);

    const levelUpMoves = Array.from(new Map(allMovesInEra
        .filter(m => m.method === 'level-up' && m.level > 0)
        .sort((a, b) => a.level - b.level)
        .map(m => [m.name, m])).values());
    const machineMoves = Array.from(new Set(allMovesInEra.filter(m => m.method === 'machine').map(m => m.name))).sort();
    const tutorMoves = Array.from(new Set(allMovesInEra.filter(m => m.method === 'tutor').map(m => m.name))).sort();
    const eggMoves = Array.from(new Set(allMovesInEra.filter(m => m.method === 'egg').map(m => m.name))).sort();
    
    const hasAnyMoves = levelUpMoves.length > 0 || machineMoves.length > 0 || tutorMoves.length > 0 || eggMoves.length > 0;

    let movesSectionHTML;
    if (!hasAnyMoves) {
        movesSectionHTML = `
            <section>
                 <h2 class="text-2xl font-bold text-zinc-100 mb-4 text-center">Learned Moves</h2>
                 <div class="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <p class="text-zinc-500 text-center">No moves available for this Pokémon in this generation.</p>
                </div>
            </section>
        `;
    } else {
        const moveLists = [
            { title: 'Level Up Moves', moves: levelUpMoves, method: 'level-up' as const },
            { title: 'TM/HM Moves', moves: machineMoves, method: 'tm-hm' as const },
            { title: 'Tutor Moves', moves: tutorMoves, method: 'tutor' as const },
            { title: 'Egg Moves', moves: eggMoves, method: 'egg' as const },
        ].filter(list => list.moves.length > 0);

        const movesHTML = moveLists.map(list => `
            <div>
                <h3 class="text-xl font-bold text-zinc-100 mb-2">${list.title} <span class="text-base text-zinc-400 font-medium">(${list.moves.length})</span></h3>
                ${getPokemonMovesTableHTML(list.moves, list.method)}
            </div>
        `).join('');

        movesSectionHTML = `
            <section>
                 <h2 class="text-2xl font-bold text-zinc-100 mb-4 text-center">Learned Moves</h2>
                 <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    ${movesHTML}
                 </div>
            </section>
        `;
    }
    
    const romanMap: { [key: string]: number } = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9 };
    const eraNameKey = state.selectedGameEraName ? state.selectedGameEraName.replace('Gen ', '') : 'IX';
    const generationNumber = romanMap[eraNameKey] || 9;

    let abilitiesContentHTML;
    if (generationNumber < 3) {
        abilitiesContentHTML = `<span class="font-semibold text-zinc-500 text-right">N/A in Gen ${eraNameKey}</span>`;
    } else {
        const abilitiesList = basePokemon.abilities
            .filter((a: any) => !(a.is_hidden && generationNumber < 5)) // Filter out hidden abilities before Gen 5
            .map((a: any) => {
                const abilityName = a.ability.name.replace(/-/g, ' ');
                return `<li>
                    <button class="ability-select-btn text-right text-zinc-300 hover:text-zinc-100 hover:underline transition-colors" data-ability-name="${escapeHtml(abilityName)}">
                        ${toTitleCase(abilityName)}
                    </button>
                    ${a.is_hidden ? ' <span class="text-xs text-zinc-400">(Hidden)</span>' : ''}
                </li>`;
            })
            .join('');
        
        abilitiesContentHTML = abilitiesList ? `<ul class="text-right space-y-1">${abilitiesList}</ul>` : `<span class="font-semibold text-zinc-400 text-right">None</span>`;
    }

    const stats = activeForm.stats.map((s: any) => ({ name: s.stat.name.replace('-', ' '), value: s.base_stat }));

    const typeDefenses: { [key in PokemonType]?: number } = {};
    const allTypes = Object.values(PokemonType);
    let chartForGen;
    if (state.selectedGeneration === 'gen1') chartForGen = TYPE_CHART_GEN_1;
    else if (state.selectedGeneration === 'gen2-5') chartForGen = TYPE_CHART_GEN_2_5;
    else chartForGen = TYPE_CHART_GEN_6;

    allTypes.forEach(attackingType => {
        let multiplier = 1;
        activeForm.types.forEach((defendingType: any) => {
            const defTypeName = (defendingType.type.name.charAt(0).toUpperCase() + defendingType.type.name.slice(1)) as PokemonType;
            if (chartForGen[attackingType]) {
                multiplier *= chartForGen[attackingType]?.[defTypeName] ?? 1;
            }
        });
        typeDefenses[attackingType] = multiplier;
    });

    const defenseChipsHTML = allTypes.map(type => {
        const multiplier = typeDefenses[type];
        if (multiplier === undefined || multiplier === 1) return '';
        return `<div class="flex items-center gap-2 bg-zinc-800/50 p-1.5 rounded-md">
                    ${getTypeDisplayHTML(type, { className: 'h-8 w-16 !text-xs' })}
                    <span class="font-bold text-sm pr-2 ${multiplier! > 1 ? 'text-lime-400' : 'text-orange-400'}">${multiplier}x</span>
                </div>`;
    }).join('');

    const heldItemsHTML = basePokemon.held_items && basePokemon.held_items.length > 0 
        ? `<div class="pt-3 mt-3 border-t border-zinc-700/50">${getHeldItemsHTML(basePokemon.held_items, selectedEra).replace('<h3 class="font-bold text-zinc-100 mb-2">Held Items</h3>', '<h4 class="font-bold text-zinc-400 text-sm mb-2">Held Items</h4>')}</div>`
        : '';
    
    const eggGroups = species.egg_groups && species.egg_groups.length > 0
        ? species.egg_groups.map((eg: any) => {
            return `<button class="egg-group-btn text-zinc-300 hover:text-zinc-100 hover:underline transition-colors" data-egg-group-name="${eg.name}">${toTitleCase(eg.name)}</button>`;
        }).join(', ')
        : 'Undiscovered';

    return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column: Artwork & Basic Info -->
                <div class="lg:col-span-1 space-y-6">
                    <div class="relative group w-3/4 lg:w-full mx-auto">
                        <svg class="absolute -top-4 -left-4 w-24 h-24 opacity-10 -rotate-12 shape-fill" aria-hidden="true"><use xlink:href="${shapeId}"></use></svg>
                        <img 
                            src="${activeForm.sprites.other['official-artwork'].front_default}" 
                            alt="${baseName}" 
                            class="w-full h-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] relative z-10"
                        >
                    </div>
                    <div class="flex justify-center gap-2">
                        ${typesHTML}
                    </div>
                    <div class="flex justify-center items-center gap-4">
                        <button id="play-cry-btn" class="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition text-zinc-200" aria-label="Play Pokémon cry">
                            ${SPEAKER_ICON_SVG}
                        </button>
                        ${shouldShowGmaxIcon ? `
                            <button class="gmax-artwork-trigger p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition text-zinc-200" aria-label="View Gigantamax form" data-gmax-artwork-url="${gmaxArtworkUrl}">
                                ${GIGANTAMAX_ICON_SVG.replace('<svg ', '<svg class="w-5 h-5" ')}
                            </button>
                        ` : ''}
                    </div>
                    ${getAlternateFormThumbnailsHTML(basePokemon, state.activeFormName)}
                </div>

                <!-- Right Column: Detailed Info -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Game Version Tabs -->
                    <div class="overflow-x-auto pb-2">
                       <div class="flex gap-2 w-max">
                        ${gameTabs}
                       </div>
                    </div>

                    <!-- Flavor Text -->
                    <div class="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
                        <p class="text-zinc-300 italic text-center leading-relaxed h-16 flex items-center justify-center">
                            ${getFlavorText(state.selectedGameEraName)}
                        </p>
                    </div>

                    <!-- Evolution Chain -->
                    ${getEvolutionChainHTML()}
                    
                    <!-- Core Stats & Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div class="space-y-4 bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-lg flex flex-col">
                            <h3 class="font-bold text-zinc-100">Pokédex Data</h3>
                            <div class="text-sm space-y-3 flex-grow">
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Genus</span>
                                    <span class="font-semibold text-zinc-200">${species.genera.find((g:any) => g.language.name === 'en')?.genus || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Height</span>
                                    <span class="font-semibold text-zinc-200">${formatHeight(activeForm.height)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Weight</span>
                                    <span class="font-semibold text-zinc-200">${formatWeight(activeForm.weight)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Abilities</span>
                                    ${abilitiesContentHTML}
                                </div>
                            </div>
                            ${heldItemsHTML}
                            ${getPokedexEntriesHTML(species)}
                            ${getLocationsHTML(basePokemon.locationDetails, selectedEra)}
                       </div>
                       <div class="space-y-4 bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
                            <h3 class="font-bold text-zinc-100">Training</h3>
                            <div class="text-sm space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">EV Yield</span>
                                    <span class="font-semibold text-zinc-200 text-right capitalize">${getEVYieldHTML(activeForm.stats)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Catch Rate</span>
                                    <span class="font-semibold text-zinc-200">${species.capture_rate}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Base Friendship</span>
                                    <span class="font-semibold text-zinc-200">${species.base_happiness}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Growth Rate</span>
                                    <span class="font-semibold text-zinc-200 capitalize">${species.growth_rate?.name.replace(/-/g, ' ')}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Gender Ratio</span>
                                    <div class="w-1/2">${getGenderRatioHTML(species.gender_rate)}</div>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Egg Groups</span>
                                    <span class="font-semibold text-zinc-200 text-right">${eggGroups}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Learned Moves Section -->
                    ${movesSectionHTML}

                    <!-- Type Defenses -->
                    <div class="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
                        <h3 class="font-bold text-zinc-100 mb-4 text-center">Type Defenses (vs. ${state.selectedGeneration === 'gen1' ? 'Gen 1' : state.selectedGeneration === 'gen2-5' ? 'Gen 2-5' : 'Gen 6+'} rules)</h3>
                        <div class="flex flex-wrap gap-3 justify-center">
                            ${defenseChipsHTML}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Base Stats -->
            <section class="mt-8">
                <h2 class="text-2xl font-bold text-zinc-100 mb-4 text-center">Base Stats</h2>
                <div class="bg-black/30 backdrop-blur-sm border border-white/10 p-6 rounded-lg max-w-2xl mx-auto">
                    ${getStatChartHTML(stats)}
                </div>
            </section>
    `;
}

export function getPokedexViewHTML(): string {
    let pokedexHeaderContent: string;
    
    // Only build the full header if the Pokémon data is loaded. Otherwise, show a loading state.
    if (state.isLoadingPokedexEntry || !state.selectedPokemonDetails) {
        pokedexHeaderContent = `
            <div class="bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-700/80 sticky top-[80px] sm:top-[84px] z-30">
                <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-center items-center gap-4 py-3">
                        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-center text-zinc-100 flex-grow">
                            Loading...
                        </h1>
                    </div>
                </div>
            </div>`;
    } else if (!state.selectedPokemonDetails) {
         return `
            <div class="min-h-screen flex flex-col">
                ${getHeaderHTML()}
                <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold text-red-500">Error</h2>
                        <p class="text-zinc-400 mt-2">Could not load Pokémon details. It may not exist or there was a network error.</p>
                    </div>
                </main>
                ${getFooterHTML()}
            </div>
        `;
    } else {
        const { baseName, badges } = getPokemonNameAndBadges(state.activeFormName || state.selectedPokemonDetails.name || '');
        const badgesHTML = badges.map(badge => `<span class="px-2 py-1 text-sm font-bold text-white bg-zinc-600 rounded-md">${escapeHtml(badge)}</span>`).join(' ');

        pokedexHeaderContent = `
            <div class="bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-700/80 sticky top-[80px] sm:top-[84px] z-30">
                <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-center items-center gap-4 py-3">
                        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-center text-zinc-100 flex-grow capitalize flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                            <span>${baseName}</span>
                            ${badgesHTML}
                        </h1>
                    </div>
                </div>
            </div>`;
    }

    return `
      ${POKEMON_SHAPES_SVG_SPRITES}
      <div id="artwork-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
        <button id="overlay-close-btn" class="absolute top-4 right-4 text-white text-4xl font-bold" aria-label="Close image overlay">&times;</button>
        <img id="overlay-image" src="" alt="Gigantamax Artwork" class="max-w-full max-h-full object-contain">
      </div>
      <div class="min-h-screen flex flex-col">
        ${getHeaderHTML(pokedexHeaderContent)}
        <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            ${getPokedexBodyHTML()}
        </main>
        ${getFooterHTML()}
      </div>
    `;
}

export function getItemIndexViewHTML(): string {
    let contentHTML: string;
    let title: string;
    let headerHTML: string;

    if (state.itemViewMode === 'categories') {
        title = 'Item Categories';
        contentHTML = getItemCategoriesHTML();
        headerHTML = getHeaderHTML();
    } else { // 'list' mode
        const category = state.selectedItemCategory;
        title = category || 'Items';
        
        if (category === 'TMs & HMs') {
            contentHTML = generateTMListHTML();
        } else if (!category) {
            contentHTML = generateItemListHTML(state.itemsDB);
        } else {
            const itemsToDisplay = state.itemsDB.filter(i => i.category === category);
            contentHTML = generateItemListHTML(itemsToDisplay);
        }

        const itemHeaderContent = `
            <div class="bg-zinc-900 border-b border-zinc-700 sticky top-[80px] sm:top-[84px] z-30">
                <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-center gap-4 py-4">
                        <h1 class="flex-initial text-xl sm:text-2xl font-bold text-center text-zinc-100 whitespace-nowrap">${title}</h1>
                    </div>
                </div>
            </div>
        `;
        headerHTML = getHeaderHTML(itemHeaderContent);
    }

    return `
        <div class="min-h-screen flex flex-col">
            ${headerHTML}
            <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                ${state.itemViewMode === 'categories' ? `<h1 class="text-3xl sm:text-4xl font-bold text-center text-zinc-100 mb-8">${title}</h1>` : ''}
                ${contentHTML}
            </main>
            ${getFooterHTML()}
        </div>
    `;
}

export function getAbilityIndexViewHTML(): string {
    let contentHTML: string;
    let title: string;
    let headerHTML: string;

    if (state.abilityViewMode === 'list') {
        title = 'Ability Index';
        const searchTerm = state.abilitySearchTerm.toLowerCase();
        const filteredAbilities = state.abilitiesDB.filter(ability => 
            ability.name.toLowerCase().includes(searchTerm)
        );
        contentHTML = `
            <div class="flex flex-col items-center mb-8">
                <p class="text-zinc-400 mt-2">Browse all abilities across Pokémon games.</p>
                <div class="mt-6 w-full max-w-md">
                    <input type="search" id="ability-search-input" value="${escapeHtml(state.abilitySearchTerm)}" placeholder="Search abilities..." class="w-full bg-zinc-800 border-2 border-zinc-700 rounded-md px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition">
                </div>
            </div>
            <div id="ability-list-container">
                ${generateAbilityListHTML(filteredAbilities)}
            </div>
        `;
        headerHTML = getHeaderHTML();
    } else { // 'detail' mode
        const ability = state.selectedAbilityData;
        if (!ability) {
            title = 'Error';
            contentHTML = '<p class="text-center text-red-500">Could not load ability details.</p>';
        } else {
            title = ability.name;
            contentHTML = getAbilityDetailHTML(ability);
        }

        const abilityHeaderContent = `
            <div class="bg-zinc-900 border-b border-zinc-700 sticky top-[80px] sm:top-[84px] z-30">
                <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-center gap-4 py-4">
                        <h1 class="flex-initial text-xl sm:text-2xl font-bold text-center text-zinc-100 capitalize whitespace-nowrap">${title}</h1>
                    </div>
                </div>
            </div>
        `;
        headerHTML = getHeaderHTML(abilityHeaderContent);
    }

    return `
        <div class="min-h-screen flex flex-col">
            ${headerHTML}
            <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                ${state.abilityViewMode === 'list' ? `<h1 class="text-3xl sm:text-4xl font-bold text-center text-zinc-100">${title}</h1>` : ''}
                ${contentHTML}
            </main>
            ${getFooterHTML()}
        </div>
    `;
}

export function getAttackIndexViewHTML(): string {
    let contentHTML: string;
    let title: string;
    let headerHTML: string;

    if (state.attackViewMode === 'list') {
        title = 'Attack Index';
        contentHTML = `
            <p class="text-zinc-400 text-center mb-8">A comprehensive list of all Pokémon moves, sorted by type.</p>
            ${generateAttackListHTML(state.attacksDB)}
        `;
        headerHTML = getHeaderHTML();
    } else { // 'detail' mode
        const attack = state.selectedAttackData;
        if (!attack) {
            title = 'Error';
            contentHTML = '<p class="text-center text-red-500">Could not load attack details.</p>';
        } else {
            title = toTitleCase(attack.name);
            contentHTML = getAttackDetailHTML(attack);
        }

        const attackHeaderContent = `
            <div class="bg-zinc-900 border-b border-zinc-700 sticky top-[80px] sm:top-[84px] z-30">
                <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-center gap-4 py-4">
                        <h1 class="flex-initial text-xl sm:text-2xl font-bold text-center text-zinc-100 whitespace-nowrap">${escapeHtml(title)}</h1>
                    </div>
                </div>
            </div>
        `;
        headerHTML = getHeaderHTML(attackHeaderContent);
    }

    return `
        <div class="min-h-screen flex flex-col">
            ${headerHTML}
            <main class="flex-grow w-full max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                ${state.attackViewMode === 'list' ? `<h1 class="text-3xl sm:text-4xl font-bold text-center text-zinc-100">${title}</h1>` : ''}
                ${contentHTML}
            </main>
            ${getFooterHTML()}
        </div>
    `;
}