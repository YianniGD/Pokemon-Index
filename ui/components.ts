import { PokemonType, TYPE_ICONS, TYPE_COLORS, VERSION_EXCLUSIVES, POKEDEX_LIST, VERSION_TO_GROUP_MAP, GENERATIONS, GAME_ERA_GROUPS, GAME_VERSION_ORDER, GAME_HEX_COLORS } from '../constants.ts';
import { Generation, PokemonGridItem, ItemData, AbilityData, AttackData } from '../types.ts';
import { state } from '../state.ts';
import { HEADER_LOGO_SVG, GIGANTAMAX_ICON_SVG, GAME_ICONS, LOADER_SVG, PHYSICAL_ATTACK_ICON_SVG, SPECIAL_ATTACK_ICON_SVG, STATUS_ATTACK_ICON_SVG } from '../assets.ts';
import { escapeHtml, getPokemonNameAndBadges, getPokemonIdFromUrl, formatHeight, formatWeight, toTitleCase } from '../utils.ts';


export function getHeaderHTML(pokedexHeaderContent: string = ''): string {
    const showBackButton = !(state.currentView === 'home' && state.homeViewMode === 'selection');

    return `
    <div class="flex-shrink-0 w-full sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40 border-b border-zinc-800/50">
        <div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <header class="py-4 flex justify-between items-center gap-4">
                <div class="flex items-center gap-2 sm:gap-4">
                    ${showBackButton ? `
                        <button id="standard-back-btn" class="p-2 rounded-full hover:bg-zinc-700 transition-colors" aria-label="Go back">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    ` : ''}
                    <div class="w-32 sm:w-40 flex-shrink-0">
                        <button id="home-logo-btn" class="w-full transition-transform hover:scale-105">
                            ${HEADER_LOGO_SVG}
                        </button>
                    </div>
                </div>
                <div class="flex-grow flex items-center justify-end gap-1 sm:gap-2 md:gap-4">
                    <div class="relative flex-grow max-w-xs sm:max-w-sm md:max-w-md">
                        <input type="search" id="global-search" placeholder="Search Pokémon, Items, Abilities, Attacks..." value="${escapeHtml(state.globalSearchTerm)}" aria-label="Search Pokémon, Items, Abilities, and Attacks" class="w-full bg-zinc-800 border-2 border-zinc-700 rounded-md pl-10 pr-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                        </div>
                    </div>
                </div>
            </header>
        </div>
        ${pokedexHeaderContent}
    </div>
    `;
}

export function getFooterHTML(): string {
    return `
    <div class="flex-shrink-0 w-full mt-auto">
        <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <footer class="text-center py-8 text-zinc-500 text-sm border-t border-zinc-800/50">
                <p> Powered by the <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" class="text-zinc-300 hover:underline">PokéAPI</a>. Pokémon and all related content are trademarks of Nintendo and the Pokemon Company.</p>
            </footer>
        </div>
    </div>
    `;
}

export function getGenerationSelectorHTML(): string {
    const options: { id: Generation, label: string }[] = [
        { id: 'gen1', label: 'Gen 1' },
        { id: 'gen2-5', label: 'Gen 2-5' },
        { id: 'gen6', label: 'Gen 6+' },
    ];
    return `
    <div id="generation-selector" class="flex bg-zinc-800 rounded-lg p-1 shadow-md">
        ${options.map(opt => `
            <button 
                data-gen="${opt.id}"
                class="gen-btn px-4 py-1.5 text-sm font-bold rounded-md transition-colors duration-200
                ${state.selectedGeneration === opt.id 
                    ? 'bg-zinc-200 text-zinc-900 shadow-sm' 
                    : 'text-zinc-400 hover:bg-zinc-700'
                }"
                aria-pressed="${state.selectedGeneration === opt.id}"
            >
                ${opt.label}
            </button>
        `).join('')}
    </div>
    `;
}

export function getMultiplierDisplayHTML(multiplier: number | undefined): string {
    if (multiplier === undefined || multiplier === 1) return '';
    
    let text: string;
    let color = 'bg-gray-700';

    if (multiplier >= 2) color = 'bg-green-600';
    if (multiplier < 1 && multiplier > 0) color = 'bg-red-600';
    if (multiplier === 0) color = 'bg-black';

    if (multiplier === 4) text = '4x';
    else if (multiplier === 2) text = '2x';
    else if (multiplier === 0.5) text = '½x';
    else if (multiplier === 0.25) text = '¼x';
    else text = `${multiplier}x`;

    return `
        <div class="absolute -top-2 -right-2 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center text-white ${color} border-2 border-zinc-800">
            ${text}
        </div>
    `;
}

export function getTypeDisplayHTML(type: PokemonType, options?: { multiplier?: number, isSelected?: boolean, isHeader?: boolean, isSide?: boolean, className?: string }): string {
    const { multiplier, isSelected = false, isHeader = false, isSide = false, className = '' } = options || {};
    const iconSVG = TYPE_ICONS[type];
    const baseColorClass = TYPE_COLORS[type];
    
    let interactiveAndSelectedClasses = '';
    if (isHeader) {
        interactiveAndSelectedClasses = 'cursor-pointer transition-all duration-200 ring-2';
        if (isSelected) {
            interactiveAndSelectedClasses += ' ring-white';
        } else {
            interactiveAndSelectedClasses += ' ring-transparent hover:ring-white/50';
        }
    }

    const sizeClasses = 'h-12 w-20 text-sm';

    let contentHTML: string;

    if (iconSVG) {
        contentHTML = iconSVG;
    } else {
        contentHTML = `<span>${type}</span>`;
    }
    
    const flexClasses = 'flex items-center justify-center';

    return `
        <div 
            class="type-display relative rounded-lg shadow-md font-bold ${flexClasses} ${baseColorClass} ${sizeClasses} ${className} ${interactiveAndSelectedClasses}"
            data-type="${type}"
            aria-label="${type} type"
            role="${isHeader ? 'button' : 'img'}"
            title="${type}"
        >
            ${contentHTML}
            ${multiplier !== undefined ? getMultiplierDisplayHTML(multiplier) : ''}
        </div>
    `;
}

export function getDamageMultiplierHTML(multiplier: number): string {
  let text: string;
  let colorClass = 'text-zinc-200';
  let title = '1x Damage (Normal)';

  if (multiplier === 4) { text = '4x'; colorClass = 'text-sky-400'; title = '4x damage (Super Effective)'; } 
  else if (multiplier === 2) { text = '2x'; colorClass = 'text-lime-400'; title = '2x damage (Super Effective)'; } 
  else if (multiplier === 0.5) { text = '½x'; colorClass = 'text-orange-400'; title = '½ damage (Not Very Effective)'; } 
  else if (multiplier === 0.25) { text = '¼x'; colorClass = 'text-amber-500'; title = '¼ damage (Not Very Effective)'; } 
  else if (multiplier === 0) { text = '0x'; colorClass = 'text-zinc-500'; title = 'No damage'; }
  else {
    return `<div class="h-8 w-8" title="${title}"></div>`;
  }

  return `<div class="flex items-center justify-center h-full w-full font-bold text-lg ${colorClass}" title="${title}">${text}</div>`;
}

export function generatePokemonGridHTML(pokemonToDisplay: PokemonGridItem[]): string {
    if (pokemonToDisplay.length === 0 && !state.isLoadingPokedexList) {
        return `<p class="text-center text-zinc-500 p-8">No Pokémon found matching your search.</p>`;
    }

    const isGamePokedex = state.selectedPokedex?.category === 'game';
    const isNotHisui = state.selectedPokedex?.id !== 'hisui';
    const versionGroup = state.selectedPokedex?.versionGroup;
    const exclusives = (isGamePokedex && isNotHisui && versionGroup) ? VERSION_EXCLUSIVES[versionGroup] : null;

    const gridItems = pokemonToDisplay.map(p => {
        const id = p.id;
        const pokedexNumber = p.pokedexNumber;
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        const shouldShowGmaxIcon = p.hasGmax && state.selectedPokedex?.era === 'Gen VIII';
        
        const { baseName, badges } = getPokemonNameAndBadges(p.name);
        const badgesHTML = badges.map(badge => 
            `<span class="ml-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-zinc-600 rounded-md">${escapeHtml(badge)}</span>`
        ).join('');

        const gmaxIconHTML = `
            <div class="absolute top-1 left-1 h-6 w-6 p-0.5" title="Has Gigantamax form">
                ${GIGANTAMAX_ICON_SVG.replace('<svg ', '<svg class="w-full h-full" ')}
            </div>`;

        let bgClass = 'bg-zinc-800 group-hover:bg-zinc-700';
        let exclusiveStyles = '';
        let exclusiveTitle = '';

        if (exclusives) {
            const speciesName = state.pokemonFormInfo.get(p.name)?.speciesName || p.name;
            for (const game in exclusives) {
                if (exclusives[game].includes(speciesName)) {
                    const hexColor = GAME_HEX_COLORS[game];
                    if (hexColor) {
                        const gameName = game.charAt(0).toUpperCase() + game.slice(1);
                        // Add a prominent border and glow effect
                        exclusiveStyles = `style="border: 2px solid ${hexColor}; box-shadow: 0 0 10px ${hexColor}77;"`;
                        exclusiveTitle = `title="Exclusive to Pokémon ${gameName}"`;
                    }
                    break;
                }
            }
        }

        return `
            <button class="pokemon-select-btn text-center group transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white rounded-lg" data-pokemon-url="${p.url}">
                <div class="${bgClass} rounded-lg p-2 aspect-square flex items-center justify-center transition relative" ${exclusiveStyles} ${exclusiveTitle}>
                    <img src="${imageUrl}" alt="${p.name}" class="w-full h-full object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]" loading="lazy">
                    ${shouldShowGmaxIcon ? gmaxIconHTML : ''}
                </div>
                <div class="text-sm font-bold mt-2 text-zinc-300 group-hover:text-zinc-100 transition flex items-center justify-center flex-wrap px-1">
                    <span class="text-zinc-500 group-hover:text-zinc-400">#${pokedexNumber.toString().padStart(3, '0')}</span> 
                    <span class="ml-1">${baseName}</span>
                    ${badgesHTML}
                </div>
            </button>
        `;
    }).join('');

    return `
        <div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            ${gridItems}
        </div>
    `;
}

export function generateItemListHTML(itemsToDisplay: ItemData[]): string {
    if (state.isLoadingItems) {
        return `<div class="flex justify-center items-center p-8">${LOADER_SVG}</div>`;
    }

    if (itemsToDisplay.length === 0) {
        return `<p class="text-center text-zinc-500 p-8">No items in this category.</p>`;
    }

    // Sort items alphabetically
    itemsToDisplay.sort((a, b) => a.name.localeCompare(b.name));

    const itemButtons = itemsToDisplay.map(item => `
        <button class="item-select-btn w-full text-left px-4 py-3 bg-zinc-800 text-zinc-200 font-bold rounded-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-white capitalize flex items-center gap-4" data-item-name="${escapeHtml(item.name)}">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name.replace(/ /g, '-')}.png" alt="" class="w-8 h-8 object-contain" loading="lazy" onerror="this.style.opacity='0.2'"/>
            <span>${escapeHtml(item.name)}</span>
        </button>
    `).join('');

    return `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            ${itemButtons}
        </div>
    `;
}

export function getItemDetailHTML(item: ItemData): string {
    return `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50 flex flex-col sm:flex-row items-center gap-6">
                 <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name.replace(/ /g, '-')}.png" alt="${escapeHtml(item.name)}" class="w-24 h-24 object-contain bg-zinc-900/50 p-2 rounded-full" loading="lazy" onerror="this.style.display='none'"/>
                 <div>
                    <p class="text-zinc-300 italic text-base mb-4 text-center sm:text-left">"${escapeHtml(item.flavorText)}"</p>
                 </div>
            </div>

            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
                <h3 class="font-semibold text-zinc-100 text-lg mb-2">Effect</h3>
                <p class="text-zinc-300 text-base leading-relaxed">${escapeHtml(item.effect)}</p>
            </div>

            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
                <h3 class="font-semibold text-zinc-100 text-lg mb-2">Availability</h3>
                <div class="text-base space-y-2">
                    <div class="flex justify-between">
                        <span class="text-zinc-400">Category</span>
                        <span class="font-bold text-zinc-100">${escapeHtml(item.category)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-zinc-400">Cost</span>
                        <span class="font-bold text-zinc-100">${item.cost > 0 ? `${item.cost.toLocaleString()} Pokédollars` : 'Cannot be bought.'}</span>
                    </div>
                    ${item.games.length > 0 ? `
                    <div class="flex justify-between">
                        <span class="text-zinc-400">Games</span>
                        <span class="font-bold text-zinc-100 text-right">${escapeHtml(item.games.join(', '))}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}


export function generateAbilityListHTML(abilities: AbilityData[]): string {
    if (state.isLoadingAbilities) {
        return `<div class="flex justify-center items-center p-8">${LOADER_SVG}</div>`;
    }

    if (abilities.length === 0) {
        return `<p class="text-center text-zinc-500 p-8">No abilities found matching your search.</p>`;
    }

    const abilityLinks = abilities.map(ability => `
        <button class="ability-select-btn w-full text-left px-4 py-3 bg-zinc-800 text-zinc-200 font-bold rounded-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-white capitalize" data-ability-name="${escapeHtml(ability.name)}">
            ${escapeHtml(ability.name)}
        </button>
    `).join('');

    return `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            ${abilityLinks}
        </div>
    `;
}

export function generateAttackListHTML(attacks: AttackData[]): string {
    if (state.isLoadingAttacks) {
        return `<div class="flex justify-center items-center p-8">${LOADER_SVG}</div>`;
    }

    if (attacks.length === 0) {
        return `<p class="text-center text-zinc-500 p-8">No attacks found.</p>`;
    }

    const categorizedAttacks = new Map<PokemonType, AttackData[]>();
    for (const attack of attacks) {
        if (!categorizedAttacks.has(attack.type)) {
            categorizedAttacks.set(attack.type, []);
        }
        categorizedAttacks.get(attack.type)!.push(attack);
    }
    
    // Sort attacks alphabetically within each category
    for (const attacks of categorizedAttacks.values()) {
        attacks.sort((a, b) => a.name.localeCompare(b.name));
    }

    const typeOrder = Object.values(PokemonType);
    const damageClassIcons: { [key: string]: string } = {
        'physical': PHYSICAL_ATTACK_ICON_SVG,
        'special': SPECIAL_ATTACK_ICON_SVG,
        'status': STATUS_ATTACK_ICON_SVG,
    };

    return typeOrder.map(type => {
        const typeAttacks = categorizedAttacks.get(type);
        if (!typeAttacks || typeAttacks.length === 0) return '';
        
        const attackRows = typeAttacks.map(attack => `
            <tr class="attack-select-btn border-b border-zinc-700/50 hover:bg-zinc-700/50 cursor-pointer transition-colors" data-attack-name="${escapeHtml(attack.name)}">
                <td class="p-3 font-bold text-zinc-100">${escapeHtml(toTitleCase(attack.name))}</td>
                <td class="p-3 text-center">
                    <div class="h-5 w-7 mx-auto" title="${attack.damageClass}">${damageClassIcons[attack.damageClass] || ''}</div>
                </td>
                <td class="p-3 text-center font-mono">${attack.power ?? '—'}</td>
                <td class="p-3 text-center font-mono">${attack.accuracy ?? '—'}</td>
                <td class="p-3 text-center font-mono">${attack.pp ?? '—'}</td>
                <td class="p-3 text-sm text-zinc-400 text-left">${escapeHtml(attack.shortEffect)}</td>
            </tr>
        `).join('');

        return `
            <details class="attack-type-section group border-b border-zinc-800 last:border-b-0">
                <summary class="flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors list-none">
                    <div class="flex items-center gap-4">
                        ${getTypeDisplayHTML(type, { className: '!h-12 !w-28' })}
                        <h2 class="text-3xl font-bold">${type}</h2>
                    </div>
                    <div class="transform transition-transform duration-200 group-open:rotate-90">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </summary>
                <div class="overflow-x-auto p-4">
                    <table class="w-full min-w-[800px] text-sm text-left text-zinc-300">
                        <thead class="text-xs text-zinc-400 uppercase bg-zinc-800/50">
                            <tr>
                                <th scope="col" class="p-3 w-1/6">Name</th>
                                <th scope="col" class="p-3 text-center w-[100px]">Class</th>
                                <th scope="col" class="p-3 text-center w-[70px]">Power</th>
                                <th scope="col" class="p-3 text-center w-[70px]">Acc.</th>
                                <th scope="col" class="p-3 text-center w-[70px]">PP</th>
                                <th scope="col" class="p-3 w-1/2">Effect</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${attackRows}
                        </tbody>
                    </table>
                </div>
            </details>
        `;
    }).join('');
}

export function getAttackDetailHTML(attack: AttackData): string {
    const damageClassIcons: { [key: string]: string } = {
        'physical': PHYSICAL_ATTACK_ICON_SVG,
        'special': SPECIAL_ATTACK_ICON_SVG,
        'status': STATUS_ATTACK_ICON_SVG,
    };

    const detailItem = (label: string, value: string | number | null | undefined, capitalize = false) => {
        if (value === null || value === undefined) return '';
        return `
            <div class="flex justify-between items-center py-2 border-b border-zinc-700/50 last:border-b-0">
                <span class="text-zinc-400">${label}</span>
                <div class="font-bold text-zinc-100 ${capitalize ? 'capitalize' : ''}">${value}</div>
            </div>
        `;
    };

    let tmInfoHTML = '';
    if (attack.machines && attack.machines.length > 0) {
        const tmMap = new Map<string, string[]>();
        attack.machines.forEach(m => {
            if (!tmMap.has(m.tmNumber)) {
                tmMap.set(m.tmNumber, []);
            }
            const formattedVg = m.versionGroup.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            tmMap.get(m.tmNumber)!.push(formattedVg);
        });

        const tmList = Array.from(tmMap.entries()).map(([tm, vgs]) => 
            `<div>
                <span class="font-bold text-zinc-100">${tm}:</span>
                <span class="text-zinc-400 text-sm ml-2">${vgs.join(', ')}</span>
            </div>`
        ).join('');

        tmInfoHTML = `
        <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
            <h3 class="font-semibold text-zinc-100 text-lg mb-2">Technical / Hidden Machine</h3>
            <div class="space-y-2">${tmList}</div>
        </div>
        `;
    }

    let pokemonLearnMethodsHTML = '';
    if (state.isLoadingAttackLearnMethods) {
        pokemonLearnMethodsHTML = `<div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
            <h3 class="font-semibold text-zinc-100 text-lg mb-4">Pokémon that learn this move</h3>
            <div class="flex justify-center items-center p-8">${LOADER_SVG}</div>
        </div>`;
    } else if (state.categorizedPokemonByLearnMethod) {
        const categories = [
            { key: 'level-up' as const, title: 'Learn by Level up' },
            { key: 'machine' as const, title: 'Learn by TM/HMs' },
            { key: 'egg' as const, title: 'Learn by Breeding' },
            { key: 'tutor' as const, title: 'Learn by Move Tutor' }
        ];

        const categorySections = categories.map(cat => {
            const pokemonList = state.categorizedPokemonByLearnMethod![cat.key];
            if (!pokemonList || pokemonList.length === 0) return '';
            
            pokemonList.sort((a, b) => a.pokedexNumber - b.pokedexNumber);

            return `
                <div class="mt-4 first:mt-0">
                    <h4 class="font-semibold text-zinc-200 text-md mb-3">${cat.title} (${pokemonList.length})</h4>
                    ${generatePokemonGridHTML(pokemonList)}
                </div>
            `;
        }).filter(Boolean).join('');

        const totalPokemon = Object.values(state.categorizedPokemonByLearnMethod).reduce((sum, list) => sum + list.length, 0);

        if (totalPokemon > 0) {
            pokemonLearnMethodsHTML = `
            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
                <h3 class="font-semibold text-zinc-100 text-lg mb-2">Pokémon that learn this move</h3>
                ${categorySections}
            </div>`;
        }
    }

    return `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
                <p class="text-zinc-300 italic text-base mb-4 text-center">"${escapeHtml(attack.flavorText)}"</p>
                <div class="mt-auto space-y-3 pt-4 border-t border-zinc-700/50">
                    <div>
                        <h3 class="font-semibold text-zinc-100 text-lg mb-2">Effect</h3>
                        <p class="text-zinc-300 text-base leading-relaxed">${escapeHtml(attack.effect)}</p>
                    </div>
                </div>
            </div>
            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
                <h3 class="font-semibold text-zinc-100 text-lg mb-2">Details</h3>
                <div class="text-base">
                    ${detailItem('Type', getTypeDisplayHTML(attack.type, { className: 'h-10 w-24 !text-xs' }))}
                    ${detailItem('Category', `<div class="flex items-center gap-2"><div class="h-6 w-8">${damageClassIcons[attack.damageClass]}</div> <span class="capitalize">${attack.damageClass}</span></div>`)}
                    ${detailItem('Power', attack.power ?? '—')}
                    ${detailItem('Accuracy', attack.accuracy ? `${attack.accuracy}%` : '—')}
                    ${detailItem('PP', attack.pp)}
                    ${detailItem('Introduced', attack.generation)}
                </div>
            </div>
            ${tmInfoHTML}
            ${pokemonLearnMethodsHTML}
        </div>
    `;
}

export function getAbilityDetailHTML(ability: AbilityData): string {
    const pokemonWithAbility = ability.pokemon;
    const pokemonCount = pokemonWithAbility.length;

    const pokemonGridHTML = generatePokemonGridHTML(pokemonWithAbility.map(p => {
        const speciesInfo = state.displayablePokemon.find(dp => dp.id === p.id);
        return {
            name: p.name,
            url: p.url,
            id: p.id,
            pokedexNumber: speciesInfo ? speciesInfo.baseId : p.id,
            hasGmax: speciesInfo ? speciesInfo.hasGmax : false,
        };
    }));

    return `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
                <p class="text-zinc-300 italic text-base mb-4">${escapeHtml(ability.flavorText)}</p>
                <div class="mt-auto space-y-3 pt-4 border-t border-zinc-700/50">
                    <div>
                        <h3 class="font-semibold text-zinc-100 text-lg mb-2">Effect</h3>
                        <p class="text-zinc-300 text-base leading-relaxed">${escapeHtml(ability.effect)}</p>
                    </div>
                </div>
            </div>
            ${pokemonCount > 0 ? `
            <div class="bg-zinc-800/60 p-6 rounded-lg border border-zinc-700/50">
                <h3 class="font-semibold text-zinc-100 text-lg mb-4">Pokémon with this ability (${pokemonCount})</h3>
                ${pokemonGridHTML}
            </div>` : ''
            }
        </div>
    `;
}

export function generateTMListHTML(): string {
    if (state.isLoadingAttacks) {
        return `<div class="flex justify-center items-center p-8">${LOADER_SVG}</div>`;
    }

    const tmsByGeneration = new Map<string, { tmNumber: string; moveName: string }[]>();
    const versionGroupToEraMap = new Map<string, string>();
    GAME_ERA_GROUPS.forEach(era => {
        era.groups.forEach(group => {
            versionGroupToEraMap.set(group, era.name);
        });
    });

    state.attacksDB.forEach(attack => {
        attack.machines.forEach(machine => {
            const eraName = versionGroupToEraMap.get(machine.versionGroup);
            if (eraName) {
                if (!tmsByGeneration.has(eraName)) {
                    tmsByGeneration.set(eraName, []);
                }
                tmsByGeneration.get(eraName)!.push({
                    tmNumber: machine.tmNumber,
                    moveName: attack.name
                });
            }
        });
    });

    if (tmsByGeneration.size === 0) {
        return `<p class="text-center text-zinc-500 p-8">No TM/HM data available.</p>`;
    }

    const generationSections = GAME_ERA_GROUPS.map(era => {
        const eraName = era.name;
        const tmsForEra = tmsByGeneration.get(eraName);

        if (!tmsForEra || tmsForEra.length === 0) {
            return '';
        }

        const uniqueTms = Array.from(new Map(tmsForEra.map(tm => [`${tm.tmNumber}|${tm.moveName}`, tm])).values());
        
        uniqueTms.sort((a, b) => a.tmNumber.localeCompare(b.tmNumber, undefined, { numeric: true, sensitivity: 'base' }));

        const gameNames = era.groups.map(g => {
            const nameMap: { [key: string]: string } = {
                'red-blue': 'Red/Blue', 'yellow': 'Yellow', 'gold-silver': 'Gold/Silver', 'crystal': 'Crystal',
                'ruby-sapphire': 'Ruby/Sapphire', 'emerald': 'Emerald', 'firered-leafgreen': 'FireRed/LeafGreen',
                'diamond-pearl': 'Diamond/Pearl', 'platinum': 'Platinum', 'heartgold-soulsilver': 'HeartGold/SoulSilver',
                'black-white': 'Black/White', 'black-2-white-2': 'Black 2/White 2', 'x-y': 'X/Y',
                'omega-ruby-alpha-sapphire': 'OR/AS', 'sun-moon': 'Sun/Moon', 'ultra-sun-ultra-moon': 'US/UM',
                'lets-go-pikachu-lets-go-eevee': "Let's Go", 'sword-shield': 'Sword/Shield',
                'the-isle-of-armor': 'Isle of Armor', 'the-crown-tundra': 'Crown Tundra',
                'brilliant-diamond-and-shining-pearl': 'BD/SP', 'legends-arceus': 'Legends: Arceus',
                'scarlet-violet': 'Scarlet/Violet', 'the-teal-mask': 'Teal Mask', 'the-indigo-disk': 'Indigo Disk'
            };
            return nameMap[g] || g.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }).join(', ');

        const tmListHTML = uniqueTms.map(tm => `
            <div class="flex justify-between items-center py-2 border-b border-zinc-700/50 last:border-b-0">
                <span class="font-bold text-zinc-100 w-1/4">${tm.tmNumber}</span>
                <button class="attack-select-btn font-semibold text-left text-zinc-200 hover:text-zinc-100 hover:underline w-3/4" data-attack-name="${escapeHtml(tm.moveName)}">
                    ${escapeHtml(toTitleCase(tm.moveName))}
                </button>
            </div>
        `).join('');

        return `
            <details class="tm-generation-section group bg-zinc-800/60 rounded-lg border border-zinc-700/50" open>
                <summary class="flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/50 -m-px p-4 rounded-t-lg list-none ring-1 ring-inset ring-zinc-700/50">
                    <div>
                        <h3 class="font-bold text-lg text-zinc-100">${eraName}</h3>
                        <p class="text-sm text-zinc-400">${gameNames}</p>
                    </div>
                    <div class="transform transition-transform duration-200 group-open:rotate-90">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </summary>
                <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                    ${tmListHTML}
                </div>
            </details>
        `;
    }).filter(Boolean).join('<div class="my-6"></div>');

    return `<div class="space-y-6">${generationSections}</div>`;
}

export function getItemCategoriesHTML(): string {
    if (state.isLoadingItems) {
        return `<div class="flex justify-center items-center p-8">${LOADER_SVG}</div>`;
    }

    const categoriesFromDB = [...new Set(state.itemsDB.map(item => item.category))];
    const allCategories = [...new Set([...categoriesFromDB, 'TMs & HMs'])];

    const categoryOrder = [
        'Poké Balls', 'Medicine', 'TMs & HMs', 'Evolution Items', 'Mega Stones & Z-Crystals', 
        'Plates, Drives & Memories', 'Gems', 'Held Items', 'Battle Items', 'Berries', 
        'Ingredients', 'Valuable Items', 'Key Items', 'Other'
    ];
    
    const categories = allCategories.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    return `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            ${categories.map(category => `
                <button class="item-category-select-btn w-full px-4 py-3 bg-zinc-800 text-zinc-200 font-bold rounded-lg transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-white" data-category-name="${escapeHtml(category)}">
                    ${escapeHtml(category)}
                </button>
            `).join('')}
        </div>
    `;
}

export function getSearchResultsHTML(): string {
    const term = state.globalSearchTerm.toLowerCase();
    if (!term) return '';

    // Search Pokémon
    const pokemonResults = state.displayablePokemon
        .filter(p => p.name.toLowerCase().includes(term) || p.baseId.toString().includes(term))
        .slice(0, 10);

    // Search Items
    const itemResults = state.itemsDB
        .filter(i => i.name.toLowerCase().includes(term))
        .slice(0, 10);
    
    // Search Abilities
    const abilityResults = state.abilitiesDB
        .filter(a => a.name.toLowerCase().includes(term))
        .slice(0, 10);

    // Search Attacks
    const attackResults = state.attacksDB
        .filter(a => a.name.toLowerCase().includes(term))
        .slice(0, 10);

    const pokemonResultsHTML = pokemonResults.length > 0 ? pokemonResults.map(p => {
        const { baseName, badges } = getPokemonNameAndBadges(p.name);
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
        const badgesHTML = badges.map(b => `<span class="text-xs text-zinc-400 font-normal">${b}</span>`).join(' ');
        return `
            <button class="pokemon-select-btn w-full text-left p-2 flex items-center gap-4 rounded-md hover:bg-zinc-700 transition-colors" data-pokemon-url="${p.url}">
                <img src="${imageUrl}" alt="${p.name}" class="w-12 h-12 bg-zinc-900/50 rounded-full" loading="lazy" />
                <div>
                    <span class="font-bold text-zinc-200 flex items-center gap-2">${baseName} ${badgesHTML}</span>
                    <p class="text-sm text-zinc-400">#${p.baseId}</p>
                </div>
            </button>
        `;
    }).join('') : '<p class="text-zinc-500 p-2">No Pokémon found.</p>';

    const itemResultsHTML = itemResults.length > 0 ? itemResults.map(i => {
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${i.name.replace(/ /g, '-')}.png`;
        return `
            <button class="item-select-btn w-full text-left p-2 flex items-center gap-4 rounded-md hover:bg-zinc-700 transition-colors" data-item-name="${escapeHtml(i.name)}" data-item-category="${escapeHtml(i.category)}">
                <img src="${imageUrl}" alt="${i.name}" class="w-12 h-12 p-1 object-contain" loading="lazy" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';" />
                <div>
                    <span class="font-bold text-zinc-200 capitalize">${i.name}</span>
                    <p class="text-sm text-zinc-400">${i.category}</p>
                </div>
            </button>
        `;
    }).join('') : '<p class="text-zinc-500 p-2">No items found.</p>';

    const abilityResultsHTML = abilityResults.length > 0 ? abilityResults.map(a => `
        <button class="ability-select-btn w-full text-left p-2 flex items-center gap-4 rounded-md hover:bg-zinc-700 transition-colors" data-ability-name="${escapeHtml(a.name)}">
            <div class="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-zinc-900/50 rounded-full font-bold text-zinc-400 text-2xl" title="Ability">A</div>
            <div>
                <span class="font-bold text-zinc-200">${toTitleCase(a.name)}</span>
                <p class="text-sm text-zinc-400">${escapeHtml(a.generation)}</p>
            </div>
        </button>
    `).join('') : '<p class="text-zinc-500 p-2">No abilities found.</p>';

    const attackResultsHTML = attackResults.length > 0 ? attackResults.map(a => `
        <button class="attack-select-btn w-full text-left p-2 flex items-center gap-4 rounded-md hover:bg-zinc-700 transition-colors" data-attack-name="${escapeHtml(a.name)}">
            <div class="flex-shrink-0">
                ${getTypeDisplayHTML(a.type, { className: '!h-12 !w-12 !text-xs' })}
            </div>
            <div>
                <span class="font-bold text-zinc-200">${toTitleCase(a.name)}</span>
                <p class="text-sm text-zinc-400">Pwr: ${a.power ?? '—'}, Acc: ${a.accuracy ? `${a.accuracy}%` : '—'}</p>
            </div>
        </button>
    `).join('') : '<p class="text-zinc-500 p-2">No attacks found.</p>';

    return `
        <div id="search-backdrop" class="fixed inset-0 z-40"></div>
        <div id="search-results-panel" class="bg-zinc-800 rounded-b-lg shadow-2xl border border-zinc-700 border-t-0 overflow-hidden flex flex-col z-50">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 max-h-[60vh] overflow-y-auto">
                <div>
                    <h3 class="font-bold text-zinc-100 p-3 sticky top-0 bg-zinc-800 z-10 border-b border-zinc-700">Pokémon</h3>
                    <div class="flex flex-col gap-1 p-2">
                        ${pokemonResultsHTML}
                    </div>
                </div>
                <div>
                    <h3 class="font-bold text-zinc-100 p-3 sticky top-0 bg-zinc-800 z-10 border-b border-zinc-700">Items</h3>
                    <div class="flex flex-col gap-1 p-2">
                        ${itemResultsHTML}
                    </div>
                </div>
                 <div>
                    <h3 class="font-bold text-zinc-100 p-3 sticky top-0 bg-zinc-800 z-10 border-b border-zinc-700">Abilities</h3>
                    <div class="flex flex-col gap-1 p-2">
                        ${abilityResultsHTML}
                    </div>
                </div>
                 <div>
                    <h3 class="font-bold text-zinc-100 p-3 sticky top-0 bg-zinc-800 z-10 border-b border-zinc-700">Attacks</h3>
                    <div class="flex flex-col gap-1 p-2">
                        ${attackResultsHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function getStatChartHTML(stats: { name: string, value: number }[]): string {
    const statOrder = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const maxStat = 255;
    const totalDots = 10;

    const statMap = new Map(stats.map(s => [s.name.toLowerCase().replace(' ', '-'), s.value]));
    const total = statOrder.reduce((acc, name) => acc + (statMap.get(name) || 0), 0);

    const chartRows = statOrder.map(statName => {
        const value = statMap.get(statName) || 0;
        const filledDots = Math.round((value / maxStat) * totalDots);
        
        let dotsHTML = '';
        for (let i = 0; i < totalDots; i++) {
            dotsHTML += `<div class="w-4 h-4 rounded-full ${i < filledDots ? 'bg-yellow-400' : 'bg-zinc-200 opacity-20'}"></div>`;
        }

        const formattedName = statName
            .replace('special-attack', 'Sp. Atk')
            .replace('special-defense', 'Sp. Def')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        return `
            <div class="grid grid-cols-[100px_60px_1fr] items-center gap-4 text-sm">
                <span class="font-bold text-zinc-300 text-right">${formattedName}</span>
                <span class="font-mono text-zinc-100 text-left text-lg">${value}</span>
                <div class="flex flex-nowrap overflow-hidden gap-1.5">
                    ${dotsHTML}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="space-y-3">
            ${chartRows}
            <div class="grid grid-cols-[100px_60px_1fr] items-center gap-4 text-sm pt-3 mt-3 border-t border-zinc-700/50">
                <span class="font-bold text-zinc-100 text-right text-lg">Total</span>
                <span class="font-mono text-zinc-100 text-left font-bold text-xl">${total}</span>
                <div></div>
            </div>
        </div>
    `;
}

export function getPokedexEntriesHTML(species: any): string {
    if (!species || !species.pokedex_numbers || species.pokedex_numbers.length === 0) {
        return '';
    }

    const entries = species.pokedex_numbers.map((entry: any) => {
        const pokedexInfo = POKEDEX_LIST.find(p => p.id === entry.pokedex.name);
        if (!pokedexInfo) return null;
        
        return `
            <button class="pokedex-entry-btn w-full flex justify-between items-center text-left hover:bg-zinc-700/50 p-1.5 rounded-md transition-colors" data-pokedex-id="${pokedexInfo.id}" data-entry-number="${entry.entry_number}">
                <span class="font-semibold text-zinc-200">${pokedexInfo.name}</span>
                <span class="font-mono text-zinc-400">#${entry.entry_number}</span>
            </button>
        `;
    }).filter(Boolean).join('');

    if (!entries) return '';

    return `
        <div class="pt-3 mt-3 border-t border-zinc-700/50">
            <h4 class="font-bold text-zinc-400 text-sm mb-2">Pokedex No.</h4>
            <div class="text-sm space-y-1 max-h-48 overflow-y-auto pr-2">
                ${entries}
            </div>
        </div>
    `;
}

export function getHeldItemsHTML(heldItems: any[], selectedEra: any): string {
    if (!heldItems || heldItems.length === 0 || !selectedEra) {
        return '';
    }

    const itemsInEra = heldItems.map(item => {
        const versions = item.version_details
            .map((vd: any) => {
                const vg = VERSION_TO_GROUP_MAP[vd.version.name];
                if (selectedEra.groups.includes(vg)) {
                    return { rarity: vd.rarity };
                }
                return null;
            })
            .filter(Boolean);
        
        if (versions.length > 0) {
             const rarities = [...new Set(versions.map(v => v.rarity))];
            return {
                name: toTitleCase(item.item.name),
                rarity: rarities.join('/')
            };
        }
        return null;
    }).filter((item): item is { name: string, rarity: string } => item !== null);

    if (itemsInEra.length === 0) {
        return `
            <h3 class="font-bold text-zinc-100 mb-2">Held Items</h3>
            <p class="text-sm text-zinc-500">None in this generation.</p>
        `;
    }

    const itemsHTML = itemsInEra.map(item => `
        <div class="flex justify-between">
            <button class="item-select-btn font-semibold text-zinc-200 hover:underline focus:outline-none focus:ring-1 focus:ring-white rounded-sm" data-item-name="${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>
            <span class="text-zinc-400">${item.rarity}%</span>
        </div>
    `).join('');
    
    return `
        <h3 class="font-bold text-zinc-100 mb-2">Held Items</h3>
        <div class="text-sm space-y-2">
            ${itemsHTML}
        </div>
    `;
}

export function getLocationsHTML(locationDetails: any[], selectedEra: any): string {
    if (!locationDetails || locationDetails.length === 0 || !selectedEra) {
        return '';
    }

    const locationsInEra = new Set<string>();
    locationDetails.forEach(loc => {
        loc.version_details.forEach((vd: any) => {
            const vg = VERSION_TO_GROUP_MAP[vd.version.name];
            if (vg && selectedEra.groups.includes(vg)) {
                const locationName = loc.location_area.name
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase());
                locationsInEra.add(locationName);
            }
        });
    });

    if (locationsInEra.size === 0) {
        return '';
    }

    const locationsHTML = Array.from(locationsInEra).sort().map(loc => `
        <li class="font-semibold text-zinc-200">${loc}</li>
    `).join('');

    return `
        <div class="pt-3 mt-3 border-t border-zinc-700/50">
            <h4 class="font-bold text-zinc-400 text-sm mb-2">Game Locations</h4>
            <ul class="text-sm space-y-1 max-h-48 overflow-y-auto pr-2">
                ${locationsHTML}
            </ul>
        </div>
    `;
}

export function getGenderRatioHTML(rate: number): string {
    if (rate === -1) {
        return '<span class="text-zinc-300 w-full text-right block">Genderless</span>';
    }
    const femaleChance = (rate / 8) * 100;
    const maleChance = 100 - femaleChance;
    return `
        <div class="flex items-center gap-2">
            <div class="w-full bg-zinc-600 rounded-full h-2.5 flex overflow-hidden">
                <div class="bg-blue-500 h-2.5" style="width: ${maleChance}%" title="Male: ${maleChance}%"></div>
                <div class="bg-pink-500 h-2.5" style="width: ${femaleChance}%" title="Female: ${femaleChance}%"></div>
            </div>
            <div class="flex gap-1 text-base">
                <span class="text-blue-400 font-bold" title="Male">♂</span>
                <span class="text-pink-400 font-bold" title="Female">♀</span>
            </div>
        </div>
    `;
}

export function getEVYieldHTML(stats: any[]): string {
    const yieldStats = stats.filter(s => s.effort > 0);
    if (yieldStats.length === 0) return '<span>None</span>';
    return yieldStats.map(s => `+${s.effort} ${s.stat.name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def').replace(/-/g, ' ')}`).join('<br>');
}

export function getAlternateFormThumbnailsHTML(pokemon: any, activeFormName: string): string {
    const allFormsWithDetails = [pokemon, ...(pokemon.allOtherFormsDetails || [])];
    const uniqueFormsMap = new Map(allFormsWithDetails.map(f => [f.name, f]));
    const selectedEra = GAME_ERA_GROUPS.find(e => e.name === state.selectedGameEraName);
    const romanMap: { [key: string]: number } = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9 };

    const allVarieties = Array.from(uniqueFormsMap.values())
        .map((formDetails: any) => {
            if (!formDetails || !formDetails.name) return null;
            
            const formUrl = state.pokemonUrlMap.get(formDetails.name);
            if (!formUrl) return null;

            const formName = formDetails.name;
            
            if (formName.endsWith('-gmax') || formName.includes('-totem')) {
                return null;
            }

            // Availability Check based on Era
            if (selectedEra) {
                const eraName = selectedEra.name.replace('Gen ', '');
                const eraGenNum = romanMap[eraName];

                if (eraGenNum) {
                    const speciesGen = GENERATIONS.find(g => pokemon.speciesData.id >= g.start && pokemon.speciesData.id <= g.end)?.id;
                    if (speciesGen && eraGenNum < speciesGen) {
                        return null; // Form can't exist before its species
                    }

                    const isMega = formName.includes('-mega');
                    const isPrimal = formName.includes('-primal');
                    const isAlolan = formName.includes('-alola');
                    const isGalarian = formName.includes('-galar');
                    const isHisuian = formName.includes('-hisui');
                    const isPaldean = formName.includes('-paldea');
                    
                    const isGmaxForm = pokemon.allOtherFormsDetails?.some((f: any) => f.name.endsWith('-gmax'));
                    
                    const formInfo = state.pokemonFormInfo.get(formName);
                    const isDefault = formInfo?.isDefault ?? false;
                    const isPikachuVariant = formName.startsWith('pikachu-') && formName !== 'pikachu';

                    if (!isDefault) {
                        if (isMega && (eraGenNum < 6 || eraGenNum > 7)) return null;
                        if (isPrimal && eraGenNum < 6) return null;
                        if (isAlolan && eraGenNum < 7) return null;
                        if (isGalarian && eraGenNum < 8) return null;
                        if (isHisuian && eraGenNum < 8) return null;
                        if (isPaldean && eraGenNum < 9) return null;
                        
                        if (isPikachuVariant) {
                            const isCosplay = formName.includes('cosplay') || formName.includes('rock-star') || formName.includes('belle') || formName.includes('pop-star') || formName.includes('phd') || formName.includes('libre');
                            const isCap = formName.includes('cap');

                            if (isCosplay && eraGenNum !== 6) return null;
                            if (isCap && eraGenNum < 7) return null;
                        }
                    }
                    if (isGmaxForm && formName.endsWith('-gmax') && eraGenNum !== 8) return null;
                }
            }
            
            const formId = formDetails.id;
            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formId}.png`;
            
            return {
                name: formDetails.name,
                url: formUrl,
                imageUrl: imageUrl,
                is_default: state.pokemonFormInfo.get(formDetails.name)?.isDefault ?? false,
            };
        })
        .filter((form): form is Exclude<typeof form, null> => form !== null);

    if (allVarieties.length <= 1) return '';

    const formsHTML = allVarieties.map((form) => {
        const isSelected = form.name === activeFormName;
        const ringClass = isSelected ? 'ring-2 ring-white' : 'ring-2 ring-transparent';
        
        const { baseName, badges } = getPokemonNameAndBadges(form.name);
        
        const badgesHTML = badges.map(b => `<span class="px-1.5 py-0.5 text-[10px] leading-tight font-bold text-white bg-zinc-600 rounded-md">${escapeHtml(b)}</span>`).join(' ');

        const formNameContent = form.is_default 
            ? 'Base' 
            : (badges.length > 0 ? `<div class="flex flex-wrap gap-1 justify-center">${badgesHTML}</div>` : baseName);

        const isMega = form.name.includes('-mega');
        const buttonClass = isMega ? 'scroll-to-section-btn' : 'form-select-btn';
        const attributes = isMega
            ? `data-target-id="mega-form-${form.name}"`
            : `data-form-url="${form.url}" data-form-name="${form.name}"`;

        return `
            <button class="${buttonClass} text-center group transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white rounded-lg w-24" ${attributes}>
                <div class="bg-zinc-800 rounded-full p-1 aspect-square flex items-center justify-center transition group-hover:bg-zinc-700 ${ringClass}">
                    <img src="${form.imageUrl}" alt="${form.name}" class="w-full h-full object-contain drop-shadow-md" loading="lazy">
                </div>
                <div class="text-xs font-bold capitalize mt-1 text-zinc-300 group-hover:text-zinc-100 min-h-[2rem] flex items-center justify-center text-center leading-tight">${formNameContent}</div>
            </button>
        `;
    }).join('');

    return `
        <div class="mt-6 bg-black/20 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
            <h3 class="font-bold text-zinc-100 mb-4 text-center">Alternate Forms</h3>
            <div class="flex flex-wrap gap-3 justify-center">
                ${formsHTML}
            </div>
        </div>
    `;
}

export function getPokemonMovesTableHTML(moves: any[], method: 'level-up' | 'tm-hm' | 'tutor' | 'egg'): string {
    const damageClassIcons: { [key: string]: string } = {
        'physical': PHYSICAL_ATTACK_ICON_SVG,
        'special': SPECIAL_ATTACK_ICON_SVG,
        'status': STATUS_ATTACK_ICON_SVG,
    };

    const isLevelUp = method === 'level-up';
    const hasTMs = method === 'tm-hm';

    let tableHead: string;
    const commonHead = `
        <th scope="col" class="p-2 text-center w-[70px]">Class</th>
        <th scope="col" class="p-2 text-center w-[70px]">Power</th>
        <th scope="col" class="p-2 text-center w-[70px]">Acc.</th>
        <th scope="col" class="p-2 text-center w-[70px]">PP</th>
        <th scope="col" class="p-2 text-left w-1/3">Effect</th>
    `;

    const nameHeader = `<th scope="col" class="p-2 text-left">Name</th>`;

    tableHead = `
        <thead class="text-xs text-zinc-400 uppercase bg-zinc-900/80 sticky top-0 z-10">
            <tr>
                ${isLevelUp ? `<th scope="col" class="p-2 w-[60px] text-center">Lvl</th>` : ''}
                ${nameHeader}
                ${commonHead}
            </tr>
        </thead>`;
    

    const tableBody = moves.map(move => {
        const moveName = isLevelUp ? move.name : move;
        const moveData = state.attacksDB.find(a => a.name.toLowerCase() === moveName.toLowerCase());

        if (!moveData) {
            return `
            <tr class="border-b border-zinc-700/50">
                ${isLevelUp ? `<td class="p-2 text-center font-mono">${move.level}</td>` : ''}
                <td class="p-2 font-bold text-zinc-100">${escapeHtml(toTitleCase(moveName))}</td>
                <td colspan="5" class="p-2 text-sm text-zinc-500">Data not available</td>
            </tr>`;
        }
        
        let tmBadge = '';
        if (hasTMs) {
            const selectedEra = GAME_ERA_GROUPS.find(e => e.name === state.selectedGameEraName);
            if (selectedEra && moveData.machines) {
                const machine = moveData.machines.find(m => selectedEra.groups.includes(m.versionGroup));
                if (machine) {
                    tmBadge = `<span class="mr-2 px-1.5 py-0.5 text-xs font-bold text-zinc-900 bg-zinc-300 rounded-md">${machine.tmNumber}</span>`;
                }
            }
        }

        return `
            <tr class="border-b border-zinc-700/50">
                ${isLevelUp ? `<td class="p-2 text-center font-mono">${move.level}</td>` : ''}
                <td class="p-2 font-bold text-zinc-100">
                    <button class="attack-select-btn text-left w-full hover:text-zinc-100 hover:underline flex items-center" data-attack-name="${escapeHtml(moveData.name)}">
                        ${tmBadge}
                        <span>${escapeHtml(toTitleCase(moveData.name))}</span>
                    </button>
                </td>
                <td class="p-2 text-center">
                    <div class="h-5 w-7 mx-auto" title="${moveData.damageClass}">${damageClassIcons[moveData.damageClass] || ''}</div>
                </td>
                <td class="p-2 text-center font-mono">${moveData.power ?? '—'}</td>
                <td class="p-2 text-center font-mono">${moveData.accuracy ? `${moveData.accuracy}%` : '—'}</td>
                <td class="p-2 text-center font-mono">${moveData.pp ?? '—'}</td>
                <td class="p-2 text-xs text-zinc-400 text-left">${escapeHtml(moveData.shortEffect)}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg max-h-96 overflow-y-auto">
            <table class="w-full min-w-[700px] text-sm text-left text-zinc-300">
                ${tableHead}
                <tbody>
                    ${tableBody}
                </tbody>
            </table>
        </div>
    `;
}

export function getPokedexNavLinksHTML(): string {
    if (!state.selectedPokemonDetails || state.currentPokemonList.length <= 1) {
        return '';
    }

    const currentPokemonId = state.selectedPokemonDetails.id;
    const currentIndex = state.currentPokemonList.findIndex(p => p.id === currentPokemonId);

    if (currentIndex === -1) {
        return '';
    }

    const prevPokemon = currentIndex > 0 ? state.currentPokemonList[currentIndex - 1] : null;
    const nextPokemon = currentIndex < state.currentPokemonList.length - 1 ? state.currentPokemonList[currentIndex + 1] : null;

    const createNavLinkHTML = (pokemon: PokemonGridItem | null, direction: 'previous' | 'next'): string => {
        if (!pokemon) {
            return `<div class="flex-1 min-w-0"></div>`; // Placeholder for flexbox spacing
        }

        const { baseName } = getPokemonNameAndBadges(pokemon.name);
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        const arrow = direction === 'previous'
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>`;
        
        const textAndImage = `
            <div class="flex items-center gap-3 min-w-0">
                <img src="${imageUrl}" alt="${baseName}" class="w-12 h-12 bg-zinc-900/50 rounded-full flex-shrink-0">
                <div class="min-w-0 ${direction === 'previous' ? 'text-left' : 'text-right'}">
                    <span class="text-zinc-400 text-sm">#${pokemon.pokedexNumber.toString().padStart(3, '0')}</span>
                    <h4 class="font-bold text-zinc-100 truncate">${baseName}</h4>
                </div>
            </div>
        `;

        return `
            <button class="pokemon-select-btn flex-1 p-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-4 min-w-0" data-pokemon-url="${pokemon.url}">
                ${direction === 'previous' ? arrow : ''}
                ${textAndImage}
                ${direction === 'next' ? arrow : ''}
            </button>
        `;
    };

    return `
        <div class="mt-12 pt-8 border-t-2 border-zinc-700/50">
            <nav class="flex justify-between items-stretch gap-4">
                ${createNavLinkHTML(prevPokemon, 'previous')}
                ${createNavLinkHTML(nextPokemon, 'next')}
            </nav>
        </div>
    `;
}