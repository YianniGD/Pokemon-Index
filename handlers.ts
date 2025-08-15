

import { render, updateView, updateTypeChart, updateGenerationButtons, updatePokedexView, renderSearchOverlay, updateAbilityListView } from './index.tsx';
import { state } from './state.ts';
import { fetchPokedexList, fetchPokedexEntry, fetchEvolutionChain } from './api.ts';
import { Generation, View } from './types.ts';
import { POKEDEX_LIST, GAME_ERA_GROUPS, GAME_VERSION_ORDER, PokemonType } from './constants.ts';
import { toTitleCase } from './utils.ts';

// --- HELPER NAVIGATOR ---

export async function navigateToPokedex(url: string, eraContext?: string) {
    handleCloseSearch();
    updateView('pokedex', { url });

    state.isLoadingPokedexEntry = true;
    state.isLoadingEvolution = true;
    state.selectedPokemonDetails = null;
    state.activeFormName = null;
    state.selectedPokemonEvolutionChain = null;
    
    await render(); // Render loader for pokedex view

    const { pokemon, evolutionChain } = await fetchPokedexEntry(url);
    
    state.selectedPokemonDetails = pokemon;
    state.activeFormName = pokemon?.name || null;
    state.selectedPokemonEvolutionChain = evolutionChain;
    
    // --- ERA LOGIC ---
    // Prioritize the era passed from the list context.
    let bestEra: string | null = eraContext || null;

    // If no era context is provided (e.g., from search, or form switching), determine the best era.
    if (!bestEra) {
        const formName = pokemon?.name;
        if (formName) {
            if (formName.includes('-alola')) {
                bestEra = 'Gen VII';
            } else if (formName.includes('-galar') || formName.includes('-hisui') || formName === 'basculin-white-striped') {
                bestEra = 'Gen VIII';
            } else if (formName.includes('-paldea')) {
                bestEra = 'Gen IX';
            } else if (formName.includes('-gmax')) {
                bestEra = 'Gen VIII';
            } else if (formName.startsWith('pikachu-') && formName !== 'pikachu') {
                if (formName.includes('cosplay') || formName.includes('rock-star') || formName.includes('belle') || formName.includes('pop-star') || formName.includes('phd') || formName.includes('libre')) {
                    bestEra = 'Gen VI';
                } else if (formName.includes('cap')) {
                    bestEra = 'Gen VII';
                }
            }
        }

        // If it's not a regional form, find its latest appearance.
        if (!bestEra && pokemon) {
            const availableVersionGroups: Set<string> = new Set(pokemon.moves.flatMap((m: any) => m.version_group_details.map((vgd: any) => vgd.version_group.name)));
            let latestVersionGroup: string | null = null;
            for (let i = GAME_VERSION_ORDER.length - 1; i >= 0; i--) {
                const vg = GAME_VERSION_ORDER[i];
                if (availableVersionGroups.has(vg)) {
                    latestVersionGroup = vg;
                    break;
                }
            }
            if (latestVersionGroup) {
                bestEra = GAME_ERA_GROUPS.find(era => era.groups.includes(latestVersionGroup!))?.name || null;
            }
        }
    }
    
    // Fallback if no moves are found or something goes wrong
    if (!bestEra) {
        bestEra = GAME_ERA_GROUPS[GAME_ERA_GROUPS.length - 1].name;
    }

    state.selectedGameEraName = bestEra;

    // Set the corresponding type chart generation for the newly detected era
    if (bestEra) {
        if (bestEra === 'Gen I') state.selectedGeneration = 'gen1';
        else if (['Gen II', 'Gen III', 'Gen IV', 'Gen V'].includes(bestEra)) state.selectedGeneration = 'gen2-5';
        else state.selectedGeneration = 'gen6';
    }

    state.isLoadingPokedexEntry = false;
    state.isLoadingEvolution = false;

    await updatePokedexView();
}


// --- EVENT HANDLERS ---

export function handleViewChangeClick(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const view = target.dataset.view as View;
    if (view && view !== state.currentView) {
        updateView(view, { resetHomeView: view === 'home' });
        render();
    }
}

export function handleHomeLogoClick() {
    updateView('home', { resetHomeView: true });
    render();
}

export function handleStandardBackClick() {
    // Handle view-specific back actions first (detail -> list)
    if (state.currentView === 'items' && state.itemViewMode === 'list') {
        state.itemViewMode = 'categories';
        state.selectedItemCategory = null;
        render();
        return;
    }
    if (state.currentView === 'abilities' && state.abilityViewMode === 'detail') {
        state.abilityViewMode = 'list';
        state.selectedAbilityData = null;
        render();
        return;
    }
    if (state.currentView === 'attacks' && state.attackViewMode === 'detail') {
        state.attackViewMode = 'list';
        state.selectedAttackData = null;
        render();
        return;
    }

    // Handle Pokédex list back to selection
    if (state.currentView === 'home' && state.homeViewMode === 'list') {
        updateView('home', { resetHomeView: true });
        render();
        return;
    }

    // Handle Pokédex entry back to list
    if (state.currentView === 'pokedex') {
        updateView(state.previousView);
        render();
        return;
    }

    // Default back action for top-level views (chart, items, abilities, attacks) is to go home
    if (['chart', 'items', 'abilities', 'attacks'].includes(state.currentView)) {
        updateView('home', { resetHomeView: true });
        render();
        return;
    }
}


export function handleGenerationChange(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const gen = target.dataset.gen as Generation;
    if (gen && state.selectedGeneration !== gen) {
        state.selectedGeneration = gen;
        updateGenerationButtons();
        updateTypeChart();
    }
}

export function handleTypeClick(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const type = target.dataset.type as PokemonType;
    if (!type) return;

    const index = state.selectedDefendingTypes.indexOf(type);
    if (index > -1) {
        state.selectedDefendingTypes.splice(index, 1);
    } else {
        if (state.selectedDefendingTypes.length < 2) {
            state.selectedDefendingTypes.push(type);
        } else {
            state.selectedDefendingTypes.shift();
            state.selectedDefendingTypes.push(type);
        }
    }
    updateTypeChart();
}

export async function handlePokedexSelection(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const pokedexId = target.dataset.pokedexId;
    if (pokedexId) {
        state.selectedPokedex = POKEDEX_LIST.find(p => p.id === pokedexId) || null;
        state.homeViewMode = 'list';
        state.isLoadingPokedexList = true;
        await render(); // Show list view with loader
        await fetchPokedexList();
        state.isLoadingPokedexList = false;
        await render(); // Render list with pokemon
    }
}

export async function handlePokemonSelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const url = target.dataset.pokemonUrl;
    if (url) {
        // Pass the era from the current Pokedex list, if available.
        // Do not pass context if the click comes from the global search overlay.
        const isFromSearch = !!target.closest('#search-overlay');
        const eraContext = isFromSearch ? undefined : state.selectedPokedex?.era;
        await navigateToPokedex(url, eraContext);
    }
}

export async function handleFormSelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const formUrl = target.dataset.formUrl;
    const formName = target.dataset.formName;
    // We only navigate if the selected form is different from the currently active one.
    if (formUrl && formName && formName !== state.activeFormName) {
        // This reuses the full, robust navigation logic, ensuring a clean state and full data refresh.
        // It provides the user experience of navigating to a completely new page.
        await navigateToPokedex(formUrl);
    }
}

export async function handleGameEraChange(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const eraName = target.dataset.gameEraName;

    if (!eraName || state.selectedGameEraName === eraName || !state.selectedPokemonDetails) {
        return;
    }

    state.selectedGameEraName = eraName;

    // Update the type chart generation context
    if (eraName === 'Gen I') state.selectedGeneration = 'gen1';
    else if (['Gen II', 'Gen III', 'Gen IV', 'Gen V'].includes(eraName)) state.selectedGeneration = 'gen2-5';
    else state.selectedGeneration = 'gen6';
    
    const speciesData = state.selectedPokemonDetails.speciesData;
    const allFormNames: string[] = [state.selectedPokemonDetails.name, ...(state.selectedPokemonDetails.allOtherFormsDetails?.map((f:any) => f.name) || [])];
    
    const defaultVariety = speciesData.varieties.find((v: any) => v.is_default);
    const defaultFormName = defaultVariety?.pokemon.name;
    
    let targetFormName = defaultFormName; 

    // Determine the target form based on the selected era
    if (eraName === 'Gen VII') {
        const alolanForm = allFormNames.find(name => name.includes('-alola'));
        if (alolanForm) targetFormName = alolanForm;
    } else if (eraName === 'Gen VIII') {
        const galarianForm = allFormNames.find(name => name.includes('-galar'));
        const hisuianForm = allFormNames.find(name => name.includes('-hisui') || name === 'basculin-white-striped');
        if (galarianForm) targetFormName = galarianForm;
        else if (hisuianForm) targetFormName = hisuianForm;
    } else if (eraName === 'Gen IX') {
        const paldeanForm = allFormNames.find(name => name.includes('-paldea'));
        if (paldeanForm) targetFormName = paldeanForm;
    }

    if (!targetFormName) {
        await updatePokedexView();
        return;
    }
    
    state.activeFormName = targetFormName;
    
    // Re-fetch the evolution chain with the new context
    state.isLoadingEvolution = true;
    await updatePokedexView(); // Re-render to show loading state for evolution chain

    const evolutionChainUrl = speciesData.evolution_chain?.url;
    if (evolutionChainUrl && state.activeFormName) {
        const newEvolutionChain = await fetchEvolutionChain(evolutionChainUrl, state.activeFormName);
        state.selectedPokemonEvolutionChain = newEvolutionChain;
    }
    
    state.isLoadingEvolution = false;
    await updatePokedexView(); // Final re-render with the fully updated data
}

export function handleMoveTabClick(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const tabId = target.dataset.tabId;
    if (!tabId) return;

    document.querySelectorAll('.move-tab-btn').forEach(btn => {
        const isSelected = btn.getAttribute('data-tab-id') === tabId;
        btn.classList.toggle('bg-zinc-200', isSelected);
        btn.classList.toggle('text-zinc-900', isSelected);
        btn.classList.toggle('bg-zinc-700', !isSelected);
        btn.classList.toggle('text-zinc-300', !isSelected);
        btn.setAttribute('aria-selected', String(isSelected));
    });

    document.querySelectorAll('.move-tab-content').forEach(content => {
        const contentId = content.id.replace('move-tab-content-', '');
        content.classList.toggle('hidden', contentId !== tabId);
    });
}

export function handleGlobalSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    state.globalSearchTerm = input.value.trim();
    state.isSearchOverlayVisible = !!state.globalSearchTerm;
    renderSearchOverlay();
}

export function handleCloseSearch() {
    state.globalSearchTerm = '';
    state.isSearchOverlayVisible = false;
    const searchInput = document.getElementById('global-search') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
    renderSearchOverlay();
}

export function handleItemCategorySelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const categoryName = target.dataset.categoryName;
    if (categoryName) {
        state.selectedItemCategory = categoryName;
        state.itemViewMode = 'list';
        render();
    }
}

export function handleItemSelect() {
    // This is not implemented as there's no item detail view currently.
}

export function handleItemSelectFromSearch(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const itemName = target.dataset.itemName;
    const categoryName = target.dataset.itemCategory;
    if (itemName && categoryName) {
        handleCloseSearch();
        state.selectedItemCategory = categoryName;
        state.itemViewMode = 'list';
        updateView('items');
        render().then(() => {
            const itemCard = document.querySelector(`[data-item-name="${itemName}"]`);
            if (itemCard) {
                itemCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                itemCard.classList.add('ring-2', 'ring-yellow-400', 'transition-all', 'duration-1000');
                setTimeout(() => itemCard.classList.remove('ring-2', 'ring-yellow-400'), 2000);
            }
        });
    }
}

export function handleAbilitySearch(e: Event) {
    const input = e.target as HTMLInputElement;
    state.abilitySearchTerm = input.value;
    updateAbilityListView();
}

export function handleAbilitySelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const abilityName = target.dataset.abilityName?.toLowerCase();
    if (!abilityName) return;

    const ability = state.abilitiesDB.find(a => a.name.toLowerCase() === abilityName);
    if (ability) {
        handleCloseSearch();
        if (state.currentView !== 'abilities') {
            updateView('abilities');
        }
        state.abilityViewMode = 'detail';
        state.selectedAbilityData = ability;
        render();
    }
}

export function handleAttackSelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const attackName = target.dataset.attackName?.toLowerCase();
    if (!attackName) return;

    const attack = state.attacksDB.find(a => a.name.toLowerCase() === attackName);
    if (attack) {
        handleCloseSearch();
        // When an attack is selected from any page, switch to the attacks view in detail mode.
        // This will correctly set previousView.
        if (state.currentView !== 'attacks') {
            updateView('attacks');
        }
        state.attackViewMode = 'detail';
        state.selectedAttackData = attack;
        render();
    }
}

export async function handlePokedexEntryLink(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const pokedexId = target.dataset.pokedexId;
    const speciesName = state.selectedPokemonDetails?.speciesData?.name;
    if (!pokedexId || !speciesName) return;

    const pokedexInfo = POKEDEX_LIST.find(p => p.id === pokedexId);
    if (!pokedexInfo) return;

    updateView('home');
    state.homeViewMode = 'list';
    state.selectedPokedex = pokedexInfo;
    state.isLoadingPokedexList = true;
    await render(); 

    await fetchPokedexList();
    state.isLoadingPokedexList = false;
    await render(); 

    // Find the Pokémon in the new list. It may be a different form, but it will have the same species name.
    const targetPokemon = state.currentPokemonList.find(p => {
        const formInfo = state.pokemonFormInfo.get(p.name);
        return formInfo?.speciesName === speciesName;
    });

    if (targetPokemon) {
        const card = document.querySelector(`[data-pokemon-url="${targetPokemon.url}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('ring-2', 'ring-yellow-400', 'scale-105', 'z-10', 'relative');
            setTimeout(() => card.classList.remove('ring-2', 'ring-yellow-400', 'scale-105', 'z-10', 'relative'), 2000);
        }
    }
}

export async function handleEggGroupSelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const eggGroupName = target.dataset.eggGroupName;
    if (!eggGroupName) return;

    const pokedexInfo = {
        id: `egg-group-${eggGroupName}`,
        name: `${toTitleCase(eggGroupName)} Egg Group`,
        isGeneration: false,
        category: 'other' as 'other',
        genId: undefined,
        era: undefined,
        versionGroup: undefined,
    };

    updateView('home');
    state.homeViewMode = 'list';
    state.selectedPokedex = pokedexInfo;
    state.isLoadingPokedexList = true;
    await render(); 

    await fetchPokedexList();
    state.isLoadingPokedexList = false;
    await render(); 
}