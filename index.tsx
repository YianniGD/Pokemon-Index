

import { PokemonType, TYPE_CHART_GEN_1, TYPE_CHART_GEN_2_5, TYPE_CHART_GEN_6 } from './constants.ts';
import { state } from './state.ts';
import { View, PokemonGridItem } from './types.ts';
import { getHomeViewHTML, getChartViewHTML, getPokedexBodyHTML, getPokedexViewHTML, getItemIndexViewHTML, getAbilityIndexViewHTML, getAttackIndexViewHTML } from './ui/views.ts';
import { getTypeDisplayHTML, getDamageMultiplierHTML, generatePokemonGridHTML, getSearchOverlayHTML, generateAbilityListHTML } from './ui/components.ts';
import { fetchAllPokemon, fetchAllItems, fetchAllAbilities, fetchAllAttacks } from './api.ts';
import { LOADER_SVG } from './assets.ts';
import { 
    handleViewChangeClick,
    handleGenerationChange, 
    handleTypeClick, 
    handlePokedexSelection,
    handlePokemonSelect,
    handleFormSelect,
    handleGameEraChange,
    handleMoveTabClick,
    handleGlobalSearch,
    handleCloseSearch,
    handleItemCategorySelect,
    handleItemSelect,
    handleItemSelectFromSearch,
    handleAbilitySearch,
    handleAbilitySelect,
    handlePokedexEntryLink,
    handleAttackSelect,
    handleEggGroupSelect,
    handleHomeLogoClick,
    handleStandardBackClick
} from './handlers.ts';

// --- CONSTANTS ---
const POKEMON_COLOR_MAP: { [key:string]: { main: string, highlight: string } } = {
    black:  { main: '#18181b', highlight: '#52525b' }, // zinc-900, zinc-600
    blue:   { main: '#1e3a8a', highlight: '#3b82f6' }, // blue-900, blue-500
    brown:  { main: '#3f332a', highlight: '#a16207' }, // custom dark brown, yellow-700
    gray:   { main: '#1e293b', highlight: '#64748b' }, // slate-800, slate-500
    green:  { main: '#14532d', highlight: '#22c55e' }, // green-900, green-500
    pink:   { main: '#500724', highlight: '#ec4899' }, // pink-950, pink-500
    purple: { main: '#3b0764', highlight: '#a855f7' }, // purple-950, purple-500
    red:    { main: '#450a0a', highlight: '#ef4444' }, // red-950, red-500
    white:  { main: '#1e293b', highlight: '#e2e8f0' }, // slate-800, slate-200
    yellow: { main: '#422006', highlight: '#facc15' }, // amber-950, yellow-400
};
const POKEMON_PAGE_DEFAULT_COLORS = { main: '#18181b', highlight: '#27272a' }; // zinc-900, zinc-800


// --- DOM ELEMENT REFERENCES ---
const root = document.getElementById('root');

/** Manages view state transitions */
export function updateView(newView: View, options: { url?: string | null, resetHomeView?: boolean } = {}) {
    const { url = null, resetHomeView = false } = options;
    
    // Save scroll position ONLY when navigating from the Pokédex list to a detail page.
    if (state.currentView === 'home' && state.homeViewMode === 'list' && newView === 'pokedex') {
        state.homeScrollPosition = window.scrollY;
    }

    if (newView !== state.currentView) {
       state.previousView = state.currentView;
    }
    state.currentView = newView;
    state.selectedPokemonUrl = url;

    if (resetHomeView && newView === 'home') {
        state.homeViewMode = 'selection';
        state.globalSearchTerm = '';
        state.selectedPokedex = null;
        state.currentPokemonList = [];
    }

    // Reset state when leaving a view
    if (newView !== 'pokedex') {
        state.selectedPokemonDetails = null;
        state.activeFormName = null;
    }
     if (newView !== 'items') {
        state.itemViewMode = 'categories';
        state.selectedItemCategory = null;
        state.selectedItemData = null;
    }
    if (newView !== 'abilities') {
        state.abilitySearchTerm = '';
        state.abilityViewMode = 'list';
        state.selectedAbilityData = null;
    }
    if (newView !== 'attacks') {
        state.attackViewMode = 'list';
        state.selectedAttackData = null;
    }
}

export function updateGenerationButtons() {
    document.querySelectorAll<HTMLButtonElement>('.gen-btn').forEach(btn => {
        const isSelected = state.selectedGeneration === btn.dataset.gen;
        btn.classList.toggle('bg-zinc-200', isSelected);
        btn.classList.toggle('text-zinc-900', isSelected);
        btn.classList.toggle('shadow-sm', isSelected);
        btn.classList.toggle('text-zinc-400', !isSelected);
        btn.classList.toggle('hover:bg-zinc-700', !isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });
}

export async function updatePokedexView() {
    // A full re-render is necessary to update the header and all other components
    // that depend on the newly fetched Pokémon data.
    await render();
}

export function updateAbilityListView() {
    const container = document.getElementById('ability-list-container');
    if (!container) return;
    
    const searchTerm = state.abilitySearchTerm.toLowerCase();
    const filteredAbilities = state.abilitiesDB.filter(ability => 
        ability.name.toLowerCase().includes(searchTerm)
    );

    container.innerHTML = generateAbilityListHTML(filteredAbilities);
    // Re-attach listeners for any new ability buttons
    container.querySelectorAll('.ability-select-btn').forEach(btn => btn.addEventListener('click', handleAbilitySelect));
}

export function renderSearchOverlay() {
    const searchOverlay = document.getElementById('search-overlay');
    if (!searchOverlay) return;

    if (state.isSearchOverlayVisible) {
        searchOverlay.innerHTML = getSearchOverlayHTML();
        searchOverlay.classList.remove('hidden');
        searchOverlay.querySelector('#search-backdrop')?.addEventListener('click', handleCloseSearch);
        searchOverlay.querySelectorAll('.pokemon-select-btn').forEach(btn => btn.addEventListener('click', handlePokemonSelect));
        searchOverlay.querySelectorAll('.item-select-btn').forEach(btn => btn.addEventListener('click', handleItemSelectFromSearch));
        searchOverlay.querySelectorAll('.ability-select-btn').forEach(btn => btn.addEventListener('click', handleAbilitySelect));
        searchOverlay.querySelectorAll('.attack-select-btn').forEach(btn => btn.addEventListener('click', handleAttackSelect));
    } else {
        searchOverlay.innerHTML = '';
        searchOverlay.classList.add('hidden');
    }
}


export async function updateTypeChart() {
    const fixedContainer = root!.querySelector<HTMLElement>('#type-chart-fixed-container');
    const scrollContainer = root!.querySelector<HTMLElement>('#type-chart-scroll-container');
    if (!fixedContainer || !scrollContainer) return;

    const ALL_TYPES = Object.values(PokemonType);

    // Filter types based on generation
    if (state.selectedGeneration === 'gen1') {
        state.displayedTypes = ALL_TYPES.filter(t => t !== PokemonType.DARK && t !== PokemonType.STEEL && t !== PokemonType.FAIRY);
    } else if (state.selectedGeneration === 'gen2-5') {
        state.displayedTypes = ALL_TYPES.filter(t => t !== PokemonType.FAIRY);
    } else {
        state.displayedTypes = [...ALL_TYPES];
    }
    
    // Select the correct type chart for the generation
    let chartForGen;
    if (state.selectedGeneration === 'gen1') chartForGen = TYPE_CHART_GEN_1;
    else if (state.selectedGeneration === 'gen2-5') chartForGen = TYPE_CHART_GEN_2_5;
    else chartForGen = TYPE_CHART_GEN_6;

    const columnTypes = state.displayedTypes; // these are the scrollable columns
    const rowTypes = state.displayedTypes;
    const isCalculatorVisible = state.selectedDefendingTypes.length > 0;
    const dataColumnCount = columnTypes.length;

    // Grid definitions
    const calculatorColumnWidth = '90px';
    const attackingColumnWidth = 'minmax(90px, max-content)';
    
    const fixedGridColumns = `${calculatorColumnWidth} ${attackingColumnWidth}`;
    const scrollGridColumns = `repeat(${dataColumnCount}, minmax(80px, 1fr))`;
    
    let fixedGridHTML = '';
    let scrollGridHTML = '';
    const stickyHeaderBg = 'bg-[#111112]';

    // --- Grid Headers ---
    // Column 1 & 2 Headers (Fixed)
    let calculatorHeaderTypesHTML = '';
    if (isCalculatorVisible) {
        if (state.selectedDefendingTypes.length === 2) {
            calculatorHeaderTypesHTML = `
                <div class="w-full h-full relative">
                    <div class="absolute right-0 top-1/2 -translate-y-1/2 z-0">
                        ${getTypeDisplayHTML(state.selectedDefendingTypes[0], { className: 'h-10 w-12 !text-[10px] ring-2 ring-[#111112]' })}
                    </div>
                    <div class="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                        ${getTypeDisplayHTML(state.selectedDefendingTypes[1], { className: 'h-10 w-12 !text-[10px] ring-2 ring-[#111112]' })}
                    </div>
                </div>
            `;
        } else {
            calculatorHeaderTypesHTML = getTypeDisplayHTML(state.selectedDefendingTypes[0], { className: 'h-10 w-16 !text-xs' });
        }
    }
    fixedGridHTML += `
        <div class="sticky top-0 p-1 flex justify-center items-center ${stickyHeaderBg} z-20" style="grid-column: 1; grid-row: 1;">
            <div class="w-full h-12 flex items-center justify-center">
                ${calculatorHeaderTypesHTML}
            </div>
        </div>
    `;
    fixedGridHTML += `
        <div class="sticky top-0 px-4 py-1 flex justify-center items-center ${stickyHeaderBg} z-20 -mt-2" style="grid-column: 2; grid-row: 1;">
            <div class="w-20 h-12 flex items-center justify-center text-center text-xs font-bold text-zinc-500 leading-tight">
                Attacking ↓<br>Defending →
            </div>
        </div>
    `;

    // Column 3+ Headers (Scrollable)
    columnTypes.forEach((type, index) => {
        scrollGridHTML += `
            <div class="sticky top-0 p-1 flex justify-center items-center ${stickyHeaderBg} z-10 -mt-2">
                ${getTypeDisplayHTML(type, { isSelected: state.selectedDefendingTypes.includes(type), isHeader: true })}
            </div>
        `;
    });

    // --- Grid Rows ---
    rowTypes.forEach((attackingType, rowIndex) => {
        // Column 1 & 2 Data (Fixed)
        let calculatorCellHTML = '';
        if (isCalculatorVisible) {
            let finalMultiplier = 1;
            if (state.selectedDefendingTypes.length === 1) {
                finalMultiplier = chartForGen[attackingType]?.[state.selectedDefendingTypes[0]] ?? 1;
            } else if (state.selectedDefendingTypes.length === 2) {
                const m1 = chartForGen[attackingType]?.[state.selectedDefendingTypes[0]] ?? 1;
                const m2 = chartForGen[attackingType]?.[state.selectedDefendingTypes[1]] ?? 1;
                finalMultiplier = m1 * m2;
            }
            calculatorCellHTML = getDamageMultiplierHTML(finalMultiplier);
        }
        fixedGridHTML += `
            <div class="h-14 flex items-center justify-center bg-[#111112] rounded-l-md" style="grid-row: ${rowIndex + 2}; grid-column: 1;">
                ${calculatorCellHTML}
            </div>
        `;
        fixedGridHTML += `
            <div class="px-4 py-1 flex justify-end items-center bg-[#111112] rounded-r-md" style="grid-row: ${rowIndex + 2}; grid-column: 2;">
                ${getTypeDisplayHTML(attackingType, { isSide: true, isSelected: false })}
            </div>
        `;

        // Column 3+ Data (Scrollable)
        columnTypes.forEach((defendingType, colIndex) => {
            const multiplier = chartForGen[attackingType]?.[defendingType] ?? 1;
            scrollGridHTML += `
                <div class="h-14 flex items-center justify-center bg-zinc-800/50 rounded-md" style="grid-row: ${rowIndex + 2}; grid-column: ${colIndex + 1};">
                    ${getDamageMultiplierHTML(multiplier)}
                </div>
            `;
        });
    });
    
    // --- Final Render ---
    fixedContainer.innerHTML = `<div id="fixed-grid" class="grid gap-y-1 gap-x-1" style="grid-template-columns: ${fixedGridColumns};">${fixedGridHTML}</div>`;
    scrollContainer.innerHTML = `<div id="scroll-grid" class="grid gap-1" style="min-width: max-content; grid-template-columns: ${scrollGridColumns};">${scrollGridHTML}</div>`;
    
    attachTypeChartListeners();

    // --- Update Matching Pokémon List ---
    const matchingPokemonContainer = root!.querySelector<HTMLElement>('#matching-pokemon-container');
    if (!matchingPokemonContainer) return;

    if (state.selectedDefendingTypes.length === 0) {
        matchingPokemonContainer.innerHTML = '';
        return;
    }

    const genFilteredPokemon = state.displayablePokemon.filter(p => {
        if (state.selectedGeneration === 'gen1') return p.baseId <= 151;
        if (state.selectedGeneration === 'gen2-5') return p.baseId <= 649;
        return true;
    });

    const typeFilteredPokemon = genFilteredPokemon.filter(p => {
        if (!p.types) return false;
        const pokemonTypes = new Set(p.types);
        return state.selectedDefendingTypes.every(selectedType => pokemonTypes.has(selectedType));
    });

    if (typeFilteredPokemon.length > 0) {
        const gridItems: PokemonGridItem[] = typeFilteredPokemon.map(p => ({
            name: p.name,
            url: p.url,
            id: p.id,
            pokedexNumber: p.baseId, // Using baseId for display in this context
            hasGmax: p.hasGmax
        }));
        
        const header = `<h2 class="text-2xl font-bold text-center mb-4 text-zinc-300">Matching Pokémon (${gridItems.length})</h2>`;
        matchingPokemonContainer.innerHTML = header + generatePokemonGridHTML(gridItems);
        matchingPokemonContainer.querySelectorAll('.pokemon-select-btn').forEach(btn => btn.addEventListener('click', handlePokemonSelect));
    } else {
        matchingPokemonContainer.innerHTML = `<h2 class="text-2xl font-bold text-center mb-4 text-zinc-300">Matching Pokémon</h2><p class="text-center text-zinc-500 p-8">No Pokémon match the selected types for this generation.</p>`;
    }
}


export async function render() {
    if (!root) return;
    
    const shouldRestoreScroll = state.currentView === 'home' && state.homeViewMode === 'list' && state.previousView === 'pokedex';

    root.style.opacity = '0';
    await new Promise(res => setTimeout(res, 150));
    
    // Reset background before rendering new view
    root.style.background = '';
    
    switch (state.currentView) {
        case 'home':
            root.innerHTML = getHomeViewHTML();
            attachHomeListeners();
            break;
        case 'chart':
            root.innerHTML = getChartViewHTML();
            await updateTypeChart();
            break;
        case 'pokedex':
            root.innerHTML = getPokedexViewHTML();
            const colorName = state.selectedPokemonDetails?.speciesData?.color?.name;
            const colors = (colorName && POKEMON_COLOR_MAP[colorName]) ? POKEMON_COLOR_MAP[colorName] : POKEMON_PAGE_DEFAULT_COLORS;
            root.style.background = `radial-gradient(ellipse 40% 70% at 50% -20%, ${colors.highlight}40, transparent), ${colors.main}`;
            attachPokedexListeners();
            break;
        case 'items':
            root.innerHTML = getItemIndexViewHTML();
            attachItemListeners();
            break;
        case 'abilities':
            root.innerHTML = getAbilityIndexViewHTML();
            attachAbilityListeners();
            break;
        case 'attacks':
            root.innerHTML = getAttackIndexViewHTML();
            attachAttackListeners();
            break;
    }
    
    attachGlobalListeners();

    root.style.opacity = '1';
    
    if (shouldRestoreScroll) {
        window.scrollTo(0, state.homeScrollPosition);
    } else if (state.currentView !== 'pokedex') { // Avoid resetting scroll on Pokedex intra-navigation
        window.scrollTo(0, 0);
    }
}

// --- ATTACH LISTENERS ---

function attachGlobalListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', handleViewChangeClick));
    document.getElementById('home-logo-btn')?.addEventListener('click', handleHomeLogoClick);
    document.getElementById('standard-back-btn')?.addEventListener('click', handleStandardBackClick);
    document.getElementById('global-search')?.addEventListener('input', handleGlobalSearch);
}

function attachTypeChartListeners() {
    document.querySelectorAll('.gen-btn').forEach(btn => btn.addEventListener('click', handleGenerationChange));
    document.querySelectorAll('#type-chart-scroll-container .type-display[data-type]').forEach(el => el.addEventListener('click', handleTypeClick));
}

function attachHomeListeners() {
    // Attach listener for Pokédex selection buttons (present in selection mode and on National Dex list page)
    document.querySelectorAll('.pokedex-select-btn').forEach(btn => btn.addEventListener('click', handlePokedexSelection));
    // Attach listener for individual Pokémon buttons (present in list mode)
    document.querySelectorAll('.pokemon-select-btn').forEach(btn => btn.addEventListener('click', handlePokemonSelect));
}

function attachItemListeners() {
    if (state.itemViewMode === 'categories') {
        document.querySelectorAll('.item-category-select-btn').forEach(btn => btn.addEventListener('click', handleItemCategorySelect));
    } else if (state.itemViewMode === 'list') {
        if (state.selectedItemCategory === 'TMs & HMs') {
            document.querySelectorAll('.attack-select-btn').forEach(btn => btn.addEventListener('click', handleAttackSelect));
        } else {
            document.querySelectorAll('.item-select-btn').forEach(btn => btn.addEventListener('click', handleItemSelect));
        }
    }
}

function attachAbilityListeners() {
    if (state.abilityViewMode === 'list') {
        document.getElementById('ability-search-input')?.addEventListener('input', handleAbilitySearch);
        document.querySelectorAll('#ability-list-container .ability-select-btn').forEach(btn => btn.addEventListener('click', handleAbilitySelect));
    } else { // detail view
        document.querySelectorAll('.pokemon-select-btn').forEach(btn => btn.addEventListener('click', handlePokemonSelect));
    }
}

function attachAttackListeners() {
    if (state.attackViewMode === 'list') {
        document.querySelectorAll('.attack-select-btn').forEach(btn => btn.addEventListener('click', handleAttackSelect));
    } else { // detail view
        document.querySelectorAll('.pokemon-select-btn').forEach(btn => btn.addEventListener('click', handlePokemonSelect));
    }
}

function attachPokedexListeners() {
    document.querySelectorAll('.form-select-btn').forEach(btn => btn.addEventListener('click', handleFormSelect));
    document.querySelectorAll('.pokemon-select-btn').forEach(btn => btn.addEventListener('click', handlePokemonSelect));
    document.querySelectorAll('.ability-select-btn').forEach(btn => btn.addEventListener('click', handleAbilitySelect));
    document.querySelectorAll('.game-era-tab').forEach(tab => tab.addEventListener('click', handleGameEraChange));
    document.querySelectorAll('.move-tab-btn').forEach(tab => tab.addEventListener('click', handleMoveTabClick));
    document.querySelectorAll('.pokedex-entry-btn').forEach(btn => btn.addEventListener('click', handlePokedexEntryLink));
    document.querySelectorAll('.attack-select-btn').forEach(tab => tab.addEventListener('click', handleAttackSelect));
    document.querySelectorAll('.egg-group-btn').forEach(btn => btn.addEventListener('click', handleEggGroupSelect));


    // Pokémon Cry Listener
    document.getElementById('play-cry-btn')?.addEventListener('click', () => {
        if (state.selectedPokemonDetails) {
            const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${state.selectedPokemonDetails.id}.ogg`;
            const audio = new Audio(cryUrl);
            audio.volume = 0.3;
            audio.play().catch(e => console.error("Failed to play audio:", e));
        }
    });

    // G-Max Artwork Overlay Listeners
    const overlay = document.getElementById('artwork-overlay');
    const overlayImage = document.getElementById('overlay-image') as HTMLImageElement;
    
    document.querySelectorAll('.gmax-artwork-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget as HTMLButtonElement;
            const artworkUrl = button.dataset.gmaxArtworkUrl;
            if (overlay && overlayImage && artworkUrl) {
                overlayImage.src = artworkUrl;
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
            }
        });
    });

    const closeOverlay = () => {
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
            if (overlayImage) overlayImage.src = ''; // Clear src to stop loading
        }
    };

    document.getElementById('overlay-close-btn')?.addEventListener('click', closeOverlay);
    overlay?.addEventListener('click', (e) => {
        // Close only if the backdrop is clicked, not the image itself
        if (e.target === overlay) {
            closeOverlay();
        }
    });
}


// --- INITIALIZATION ---
async function init() {
    // Take manual control of scroll restoration
    history.scrollRestoration = 'manual';
    
    // Set initial view and render
    await render();
    
    // Fetch all data in the background
    await Promise.all([
        fetchAllPokemon().then(() => {
            state.isLoadingDB = false;
            if (state.currentView === 'home') render();
        }),
        fetchAllItems().then(() => {
            state.isLoadingItems = false;
            if (state.currentView === 'items') render();
        }),
        fetchAllAbilities().then(() => {
            state.isLoadingAbilities = false;
            if (state.currentView === 'abilities') render();
        }),
        fetchAllAttacks().then(() => {
            state.isLoadingAttacks = false;
            if (state.currentView === 'attacks') render();
        })
    ]);
}

init();