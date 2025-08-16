import { render, updateView, updateTypeChart, updateGenerationButtons, updatePokedexView, renderSearchResults, updateAbilityListView } from './index.tsx';
import { state } from './state.ts';
import { fetchPokedexList, fetchPokedexEntry, fetchEvolutionChain, fetchPokemonLearnMethodsForMove } from './api.ts';
import { Generation, View } from './types.ts';
import { POKEDEX_LIST, GAME_ERA_GROUPS, GAME_VERSION_ORDER, PokemonType } from './constants.ts';
import { toTitleCase } from './utils.ts';

// --- HELPER NAVIGATOR ---

export async function navigateToPokedex(url: string, eraContext?: string, isBack: boolean = false) {
    handleCloseSearch();
    updateView('pokedex', { url, isBack });

    state.isLoadingPokedexEntry = true;
    state.isLoadingEvolution = true;
    state.selectedPokemonDetails = null;
    state.activeFormName = null;
    state.selectedPokemonEvolutionChain = null;
    
    await render(); // Render loader for pokedex view

    const { pokemon } = await fetchPokedexEntry(url);
    
    state.selectedPokemonDetails = pokemon;
    state.activeFormName = pokemon?.name || null;
    
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

    const evolutionChainUrl = pokemon?.speciesData.evolution_chain?.url;
    if (evolutionChainUrl && state.activeFormName) {
        state.selectedPokemonEvolutionChain = await fetchEvolutionChain(evolutionChainUrl, state.activeFormName, state.selectedGameEraName);
    }

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
    // Handle view-specific back actions first (detail -> list, etc.)
    if (state.currentView === 'items' && state.itemViewMode === 'detail') {
        state.itemViewMode = 'list';
        state.selectedItemData = null;
        render();
        return;
    }
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
    if (state.currentView === 'home' && state.homeViewMode === 'list') {
        updateView('home', { resetHomeView: true });
        render();
        return;
    }

    // For all other cases, use the history stack.
    if (state.viewHistory.length > 0) {
        const previousEntry = state.viewHistory.pop()!;

        // Set flag for scroll restoration if applicable
        state.navigatedFromPokedex = state.currentView === 'pokedex' && previousEntry.view === 'home' && previousEntry.homeViewMode === 'list';

        // Restore necessary state from the history entry before navigating
        state.homeViewMode = previousEntry.homeViewMode;
        
        if (previousEntry.view === 'pokedex' && previousEntry.url) {
            navigateToPokedex(previousEntry.url, undefined, true);
        } else {
            updateView(previousEntry.view, { isBack: true });
            render();
        }
    } else {
        // Fallback to home if history is empty
        updateView('home', { resetHomeView: true });
        render();
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
        const isFromSearch = !!target.closest('#search-results-container');
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
        const newEvolutionChain = await fetchEvolutionChain(evolutionChainUrl, state.activeFormName, state.selectedGameEraName);
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
    renderSearchResults();
}

export function handleCloseSearch() {
    state.globalSearchTerm = '';
    state.isSearchOverlayVisible = false;
    const searchInput = document.getElementById('global-search') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
    renderSearchResults();
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

export function handleItemSelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const itemName = target.dataset.itemName;
    if (!itemName) return;

    const item = state.itemsDB.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (item) {
        state.itemViewMode = 'detail';
        state.selectedItemData = item;
        render();
    }
}

export function handleItemSelectFromSearch(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const itemName = target.dataset.itemName;
    if (itemName) {
        const item = state.itemsDB.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (item) {
            handleCloseSearch();
            updateView('items');
            state.itemViewMode = 'detail';
            state.selectedItemData = item;
            state.selectedItemCategory = item.category; // Set category so back button works correctly
            render();
        }
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

export async function handleAttackSelect(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const attackName = target.dataset.attackName?.toLowerCase();
    if (!attackName) return;

    const attack = state.attacksDB.find(a => a.name.toLowerCase() === attackName);
    if (attack) {
        handleCloseSearch();
        if (state.currentView !== 'attacks') {
            updateView('attacks');
        }
        state.attackViewMode = 'detail';
        state.selectedAttackData = attack;

        state.isLoadingAttackLearnMethods = true;
        state.categorizedPokemonByLearnMethod = null;
        await render();

        const categorizedPokemon = await fetchPokemonLearnMethodsForMove(attack.pokemon, attack.name);
        state.categorizedPokemonByLearnMethod = categorizedPokemon;
        state.isLoadingAttackLearnMethods = false;
        
        await render();
    }
}

export async function handlePokedexEntryLink(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const pokedexId = target.dataset.pokedexId;
    const entryNumberStr = target.dataset.entryNumber;
    if (!pokedexId || !entryNumberStr) return;

    const entryNumber = parseInt(entryNumberStr, 10);

    try {
        // Fetch the pokedex data to find the species name for the given entry number.
        const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexId}`);
        if (!response.ok) {
            console.error(`Could not fetch pokedex: ${pokedexId}`);
            return;
        }
        const dexData = await response.json();
        const entry = dexData.pokemon_entries.find((e: any) => e.entry_number === entryNumber);

        if (!entry) {
            console.error(`Could not find entry number ${entryNumber} in pokedex ${pokedexId}`);
            return;
        }
        
        const speciesName = entry.pokemon_species.name;

        // Find the default form of that species from our pre-loaded DB.
        const targetPokemon = state.displayablePokemon.find(p => {
            const formInfo = state.pokemonFormInfo.get(p.name);
            return formInfo?.speciesName === speciesName && formInfo.isDefault;
        });
        
        // If a default form is not found, take the first form we have for that species.
        const fallbackPokemon = !targetPokemon 
            ? state.displayablePokemon.find(p => state.pokemonFormInfo.get(p.name)?.speciesName === speciesName)
            : null;

        const pokemonToNavigate = targetPokemon || fallbackPokemon;

        if (pokemonToNavigate && pokemonToNavigate.url) {
            // Navigate to the detail page for that Pokémon.
            await navigateToPokedex(pokemonToNavigate.url);
        } else {
            console.error(`Could not find any form for species: ${speciesName}`);
        }
    } catch (error) {
        console.error("Failed to handle Pokedex entry link:", error);
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

export function handleScrollToSection(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const targetId = target.dataset.targetId;
    if (!targetId) return;

    const element = document.getElementById(targetId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}