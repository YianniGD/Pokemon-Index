import { state } from './state.ts';
import { getPokemonIdFromUrl } from './utils.ts';
import { Pokemon, PokemonFamily, PokemonGridItem, ItemData, EvolutionNode, AbilityData, AttackData } from './types.ts';
import { GENERATIONS, PokemonType, GAME_VERSION_ORDER } from './constants.ts';

/**
 * Fetches a resource with a specified number of retries on failure.
 * @param url The URL to fetch.
 * @param retries The number of times to retry the fetch.
 * @param delay The delay in milliseconds between retries.
 * @param silent If true, suppresses console warnings on failure.
 * @returns A Promise that resolves to the Response object.
 */
async function fetchWithRetry(url: string, retries = 3, delay = 1000, silent = false): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            // If the response is ok or it's a client error (4xx), we return it immediately.
            // We only retry on network errors (caught below) or server errors (5xx).
            if (response.ok || (response.status >= 400 && response.status < 500)) {
                return response;
            }
            if (!silent) console.warn(`Attempt ${i + 1} for ${url} failed with status ${response.status}. Retrying...`);
        } catch (error) {
            if (!silent) console.warn(`Attempt ${i + 1} for ${url} failed with network error. Retrying...`);
            if (i === retries - 1) throw error; // Re-throw the error on the last attempt
        }
        await new Promise(res => setTimeout(res, delay * (i + 1))); // Use a simple increasing delay
    }
    // If all retries fail, throw an error.
    throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
}

function mapApiCategoryToAppCategory(apiCategory: string): string {
    const mapping: { [key: string]: string } = {
        'standard-balls': 'Poké Balls',
        'special-balls': 'Poké Balls',
        'apricorn-balls': 'Poké Balls',
        'healing': 'Medicine',
        'status-cures': 'Medicine',
        'revival': 'Medicine',
        'pp-recovery': 'Medicine',
        'vitamins': 'Medicine',
        'stat-boosts': 'Battle Items',
        'in-a-pinch': 'Battle Items',
        'picky-healing': 'Battle Items',
        'type-enhancement': 'Battle Items',
        'miracle-shooter': 'Battle Items',
        'type-protection': 'Battle Items',
        'flutes': 'Battle Items',
        'held-items': 'Held Items',
        'choice': 'Held Items',
        'effort-training': 'Held Items',
        'bad-held-items': 'Held Items',
        'training': 'Held Items',
        'species-specific': 'Held Items',
        'mega-stones': 'Mega Stones & Z-Crystals',
        'z-crystals': 'Mega Stones & Z-Crystals',
        'plates': 'Plates, Drives & Memories',
        'memories': 'Plates, Drives & Memories',
        'drives': 'Plates, Drives & Memories',
        'gems': 'Gems',
        'evolution': 'Evolution Items',
        'all-machines': 'TMs & HMs',
        'berries': 'Berries',
        'loot': 'Valuable Items',
        'fossils': 'Valuable Items',
        'dex-completion': 'Valuable Items',
        'key-items': 'Key Items',
        'plot-advancement': 'Key Items',
        'unused': 'Key Items',
        'data-cards': 'Key Items',
        'curry-ingredients': 'Ingredients',
        'sandwich-ingredients': 'Ingredients',
        'picnic': 'Ingredients',
        'catching-bonus': 'Other',
        'gameplay': 'Other',
        'other': 'Other',
        'collectibles': 'Other',
    };
    return mapping[apiCategory] || apiCategory.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
}


export async function fetchAllItems() {
    try {
        const response = await fetchWithRetry('https://pokeapi.co/api/v2/item?limit=2500');
        if (!response.ok) {
            throw new Error(`Initial item list fetch failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const itemUrls = data.results.map((item: { url: string }) => item.url);

        const allItems: ItemData[] = [];
        const chunkSize = 50;

        for (let i = 0; i < itemUrls.length; i += chunkSize) {
            const chunkUrls = itemUrls.slice(i, i + chunkSize);
            const itemDetailPromises = chunkUrls.map(async (url: string) => {
                try {
                    const res = await fetchWithRetry(url, 3, 1000, true);
                    if (!res.ok) {
                        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
                    }
                    return await res.json();
                } catch (e) {
                    throw new Error(`Network error fetching ${url}`);
                }
            });

            const chunkResults = await Promise.allSettled(itemDetailPromises);

            const itemsFromChunk = chunkResults
                .map(result => {
                    if (result.status === 'rejected') {
                        // Silently ignore failed item fetches
                        return null;
                    }
                    
                    const item = result.value;

                    if (!item?.flavor_text_entries || !item?.effect_entries || !item.name || !item.category) {
                        return null;
                    }

                    const englishFlavorText = item.flavor_text_entries.findLast((e: any) => e.language.name === 'en');
                    if (!englishFlavorText?.text) return null;

                    const versionGroups = [...new Set(item.flavor_text_entries.map((e: any) => e.version_group.name))];
                    const gameNames = versionGroups.map((vg: any) => 
                        String(vg).replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    );

                    const effect = item.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect || 'No effect description available.';

                    return {
                        id: item.id,
                        name: String(item.name).replace(/-/g, ' '),
                        cost: item.cost,
                        flavorText: String(englishFlavorText.text).replace(/[\f\n]/g, ' '), // Replace form feeds and newlines
                        games: gameNames,
                        effect: effect,
                        category: mapApiCategoryToAppCategory(item.category.name),
                    };
                })
                .filter((item): item is ItemData => item !== null);
            
            allItems.push(...itemsFromChunk);
            await new Promise(res => setTimeout(res, 200));
        }
        
        allItems.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        state.itemsDB = allItems;
        
    } catch (error) {
        console.error("Failed to fetch item database:", error);
    }
}

export async function fetchAllAbilities() {
    try {
        const response = await fetchWithRetry('https://pokeapi.co/api/v2/ability?limit=500');
        if (!response.ok) {
            throw new Error(`Initial ability list fetch failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const abilityUrls = data.results.map((ability: { url: string }) => ability.url);

        const allAbilities: AbilityData[] = [];
        const chunkSize = 50;

        for (let i = 0; i < abilityUrls.length; i += chunkSize) {
            const chunkUrls = abilityUrls.slice(i, i + chunkSize);
            const abilityDetailPromises = chunkUrls.map(async (url: string) => {
                try {
                    const res = await fetchWithRetry(url);
                    if (!res.ok) {
                        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
                    }
                    return await res.json();
                } catch (e) {
                    throw new Error(`Network error fetching ${url}`);
                }
            });

            const chunkResults = await Promise.allSettled(abilityDetailPromises);

            const abilitiesFromChunk = chunkResults
                .map(result => {
                    if (result.status === 'rejected') {
                        console.warn(result.reason);
                        return null;
                    }
                    
                    const ability = result.value;

                    if (!ability?.flavor_text_entries || !ability?.effect_entries || !ability.name) {
                        return null;
                    }

                    const englishFlavorText = ability.flavor_text_entries.findLast((e: any) => (e.language.name === 'en' && e.version_group.name === 'sword-shield') || e.language.name === 'en');
                    if (!englishFlavorText?.flavor_text) return null;

                    const effect = ability.effect_entries.find((e: any) => e.language.name === 'en')?.effect || 'No effect description available.';

                    const pokemonList = ability.pokemon
                        .filter((p: any) => !p.pokemon.name.includes('-totem'))
                        .map((p: any) => ({
                            name: p.pokemon.name,
                            url: state.pokemonUrlMap.get(p.pokemon.name) || p.pokemon.url,
                            id: getPokemonIdFromUrl(p.pokemon.url)
                        }));

                    return {
                        id: ability.id,
                        name: String(ability.name).replace(/-/g, ' '),
                        effect: String(effect).replace(/[\f\n]/g, ' '),
                        flavorText: String(englishFlavorText.flavor_text).replace(/[\f\n]/g, ' '),
                        generation: ability.generation.name.replace(/-/g, ' ').replace('generation ', 'Gen '),
                        pokemon: pokemonList,
                    };
                })
                .filter((ability): ability is AbilityData => ability !== null);
            
            allAbilities.push(...abilitiesFromChunk);
            await new Promise(res => setTimeout(res, 200));
        }
        
        allAbilities.sort((a, b) => a.name.localeCompare(b.name));
        state.abilitiesDB = allAbilities;
        
    } catch (error) {
        console.error("Failed to fetch ability database:", error);
    }
}

export async function fetchAllAttacks() {
    try {
        // --- PRE-FETCH ALL MACHINE DATA for TM/HM info ---
        const machineMap = new Map<string, { versionGroup: string, tmNumber: string }[]>();
        const machineListRes = await fetchWithRetry('https://pokeapi.co/api/v2/machine?limit=2000');
        if (machineListRes.ok) {
            const machineListData = await machineListRes.json();
            const machineDetailPromises = machineListData.results.map((m: any) => fetchWithRetry(m.url, 3, 1000, true).then(res => res.ok ? res.json() : null).catch(() => null));
            const machineDetails = (await Promise.all(machineDetailPromises)).filter(Boolean);

            for (const machine of machineDetails) {
                if (!machine.move?.name || !machine.item?.name || !machine.version_group?.name) continue;
                const moveName = machine.move.name.replace(/-/g, ' ');
                const tmNumber = machine.item.name.toUpperCase().replace('-', '');
                const versionGroup = machine.version_group.name;
                
                if (!machineMap.has(moveName)) {
                    machineMap.set(moveName, []);
                }
                machineMap.get(moveName)!.push({ versionGroup, tmNumber });
            }
        }
        // --- END MACHINE DATA PRE-FETCH ---

        const response = await fetchWithRetry('https://pokeapi.co/api/v2/move?limit=1000');
        if (!response.ok) {
            throw new Error(`Initial attack list fetch failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const attackUrls = data.results.map((attack: { url: string }) => attack.url);

        const allAttacks: AttackData[] = [];
        const chunkSize = 50;

        for (let i = 0; i < attackUrls.length; i += chunkSize) {
            const chunkUrls = attackUrls.slice(i, i + chunkSize);
            const attackDetailPromises = chunkUrls.map(async (url: string) => {
                try {
                    const res = await fetchWithRetry(url);
                    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
                    return await res.json();
                } catch (e) {
                    throw new Error(`Network error fetching ${url}`);
                }
            });

            const chunkResults = await Promise.allSettled(attackDetailPromises);

            const attacksFromChunk = chunkResults
                .map(result => {
                    if (result.status === 'rejected') {
                        console.warn(result.reason);
                        return null;
                    }
                    
                    const attack = result.value;
                    if (!attack?.name || !attack.type?.name || !attack.damage_class?.name) return null;

                    const englishFlavorText = attack.flavor_text_entries.findLast((e: any) => e.language.name === 'en');
                    const effectEntry = attack.effect_entries.find((e: any) => e.language.name === 'en');
                    
                    const effect = effectEntry?.effect.replace('$effect_chance', String(attack.effect_chance)) || 'No effect description available.';
                    const shortEffect = effectEntry?.short_effect.replace('$effect_chance', String(attack.effect_chance)) || 'No effect description available.';

                    const moveName = String(attack.name).replace(/-/g, ' ');
                    const machineData = machineMap.get(moveName) || [];
                    machineData.sort((a, b) => GAME_VERSION_ORDER.indexOf(b.versionGroup) - GAME_VERSION_ORDER.indexOf(a.versionGroup));

                    const pokemonList = attack.learned_by_pokemon
                        .filter((p: any) => !p.name.includes('-totem'))
                        .map((p: any) => ({
                            name: p.name,
                            url: state.pokemonUrlMap.get(p.name) || p.url,
                            id: getPokemonIdFromUrl(p.url)
                        }));

                    return {
                        id: attack.id,
                        name: moveName,
                        type: (attack.type.name.charAt(0).toUpperCase() + attack.type.name.slice(1)) as PokemonType,
                        power: attack.power,
                        pp: attack.pp,
                        accuracy: attack.accuracy,
                        damageClass: attack.damage_class.name as 'physical' | 'special' | 'status',
                        effectChance: attack.effect_chance,
                        effect: String(effect).replace(/[\f\n]/g, ' '),
                        shortEffect: String(shortEffect).replace(/[\f\n]/g, ' '),
                        flavorText: String(englishFlavorText?.flavor_text || '').replace(/[\f\n]/g, ' '),
                        generation: attack.generation.name.replace(/-/g, ' ').replace('generation ', 'Gen '),
                        pokemon: pokemonList,
                        machines: machineData,
                    };
                })
                .filter((attack): attack is AttackData => attack !== null);
            
            allAttacks.push(...attacksFromChunk);
            await new Promise(res => setTimeout(res, 200));
        }
        
        state.attacksDB = allAttacks;
        
    } catch (error) {
        console.error("Failed to fetch attack database:", error);
    }
}


export async function fetchAllPokemon() {
    try {
        // Fetch all species to get canonical names and forms data
        const response = await fetchWithRetry('https://pokeapi.co/api/v2/pokemon-species?limit=1025');
        if (!response.ok) throw new Error(`Pokémon species list fetch failed: ${response.status} ${response.statusText}`);
        const data = await response.json();

        // Fetch all pokemon form names and their URLs
        const allPokemonResponse = await fetchWithRetry('https://pokeapi.co/api/v2/pokemon?limit=1302');
        if (!allPokemonResponse.ok) throw new Error(`Pokémon form list fetch failed: ${allPokemonResponse.status} ${allPokemonResponse.statusText}`);
        const allPokemonData = await allPokemonResponse.json();
        
        for (const p of allPokemonData.results) {
            state.pokemonUrlMap.set(p.name, p.url);
        }

        const families: PokemonFamily[] = [];
        const flatList: any[] = [];
        
        const speciesUrls = data.results.map((s: { url: string }) => s.url);
        const chunkSize = 50; 
        
        for (let i = 0; i < speciesUrls.length; i += chunkSize) {
            const chunkUrls = speciesUrls.slice(i, i + chunkSize);
            const speciesPromises = chunkUrls.map(async (url: string) => {
                try {
                    const res = await fetchWithRetry(url);
                    if (!res.ok) {
                        throw new Error(`Failed to fetch species ${url}: ${res.status} ${res.statusText}`);
                    }
                    return await res.json();
                } catch (e) {
                    throw new Error(`Network error fetching species ${url}`);
                }
            });

            const chunkResults = await Promise.allSettled(speciesPromises);
            
            // For each species, fetch its forms' full data to get types
            const formsToFetch = [];
            for (const res of chunkResults) {
                if (res.status === 'fulfilled') {
                    for (const v of res.value.varieties) {
                        const url = state.pokemonUrlMap.get(v.pokemon.name);
                        if (url) formsToFetch.push(url);
                    }
                }
            }
            
            const formDetailPromises = formsToFetch.map(url => 
                fetchWithRetry(url)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null)
            );
            const formsData = (await Promise.all(formDetailPromises)).filter(Boolean);
            const formsDataMap = new Map(formsData.map(f => [f.name, f]));

            for (const speciesResult of chunkResults) {
                if (speciesResult.status === 'rejected') {
                    console.warn("A Pokémon species failed to load:", speciesResult.reason);
                    continue;
                }
                
                const speciesDetails = speciesResult.value;

                if (!speciesDetails?.name || !speciesDetails.varieties) {
                    continue;
                }

                const speciesName = speciesDetails.name;
                for (const variety of speciesDetails.varieties) {
                    const formUrl = state.pokemonUrlMap.get(variety.pokemon.name);
                    if (formUrl) {
                        state.pokemonFormInfo.set(variety.pokemon.name, {
                            speciesName: speciesName,
                            isDefault: variety.is_default
                        });
                    }
                }

                const baseId = speciesDetails.id;

                const allFormsForFamily = speciesDetails.varieties
                    .map((v: any) => {
                        const formData = formsDataMap.get(v.pokemon.name);
                        if (!formData) return null;
                        
                        const formUrl = state.pokemonUrlMap.get(v.pokemon.name);
                        if (!formUrl) return null;

                        const types: PokemonType[] = formData.types.map((typeSlot: any) => 
                            typeSlot.type.name.charAt(0).toUpperCase() + typeSlot.type.name.slice(1)
                        );

                        return { 
                            name: v.pokemon.name, 
                            url: formUrl,
                            id: getPokemonIdFromUrl(formUrl),
                            types: types
                        };
                    })
                    .filter(Boolean)
                    .filter((f: any) => !f.name.includes('-totem'));


                if (allFormsForFamily.length === 0) continue; 

                const defaultVariety = speciesDetails.varieties.find((v: any) => v.is_default);
                const baseForm = defaultVariety 
                    ? allFormsForFamily.find(f => f.name === defaultVariety.pokemon.name)
                    : allFormsForFamily[0];
                
                if (!baseForm) continue;

                const hasGmaxForSpecies = allFormsForFamily.some(f => f.name.endsWith('-gmax'));
                const basePokemonForFamily: Pokemon = { name: speciesName, url: baseForm.url, id: baseId };

                families.push({ 
                    base: basePokemonForFamily, 
                    forms: allFormsForFamily.filter(f => f.id !== baseForm.id) as Pokemon[]
                });

                for (const form of allFormsForFamily) {
                    // Exclude Totem Pokémon from all lists
                    if (form.name.includes('-totem')) continue;

                    const info = state.pokemonFormInfo.get(form.name);
                    // A form can G-Max if it's the default form AND the species has a G-Max variant.
                    const canThisFormGmax = !!(hasGmaxForSpecies && info?.isDefault);

                    flatList.push({
                        name: form.name,
                        url: form.url,
                        id: form.id,
                        baseId: baseId,
                        hasGmax: canThisFormGmax,
                        types: form.types
                    });
                }
            }
            await new Promise(res => setTimeout(res, 200));
        }
        
        families.sort((a,b) => a.base.id - b.base.id);
        state.pokemonDB = families;
        state.displayablePokemon = flatList.sort((a, b) => a.id - b.id);

    } catch (error) {
        console.error("Failed to fetch Pokémon database:", error);
    }
}

export async function fetchPokedexList() {
    if (!state.selectedPokedex) return;
    try {
        if (state.selectedPokedex.id.startsWith('egg-group-')) {
            const eggGroupName = state.selectedPokedex.id.replace('egg-group-', '');
            try {
                const response = await fetchWithRetry(`https://pokeapi.co/api/v2/egg-group/${eggGroupName}`);
                if (!response.ok) throw new Error(`Could not fetch egg group: ${eggGroupName}`);
                const eggGroupData = await response.json();
                const speciesNames = new Set(eggGroupData.pokemon_species.map((s: any) => s.name));
        
                const pokemonInEggGroup = state.displayablePokemon.filter(p => {
                    const speciesName = state.pokemonFormInfo.get(p.name)?.speciesName;
                    return speciesName && speciesNames.has(speciesName);
                });
                
                const pokemonBySpecies = new Map<number, any[]>();
                pokemonInEggGroup.forEach(p => {
                    if (!pokemonBySpecies.has(p.baseId)) {
                        pokemonBySpecies.set(p.baseId, []);
                    }
                    pokemonBySpecies.get(p.baseId)!.push(p);
                });
        
                const defaultForms = [];
                for (const forms of pokemonBySpecies.values()) {
                    const defaultForm = forms.find(f => state.pokemonFormInfo.get(f.name)?.isDefault);
                    if (defaultForm) {
                        defaultForms.push(defaultForm);
                    } else if (forms.length > 0) {
                        defaultForms.push(forms[0]);
                    }
                }
                
                const list = defaultForms.map(p => ({
                    name: p.name,
                    url: p.url,
                    id: p.id,
                    pokedexNumber: p.baseId,
                    hasGmax: p.hasGmax
                }));
                
                list.sort((a, b) => a.pokedexNumber - b.pokedexNumber);
                state.currentPokemonList = list;
            } catch (e) {
                console.error(`Failed to fetch egg group list for ${eggGroupName}`, e);
                state.currentPokemonList = [];
            }
            return;
        }

        let potentialPokemon = state.displayablePokemon;

        // Filter out Mega and G-Max forms from all lists, as they are handled on the base form's page.
        potentialPokemon = potentialPokemon.filter(p => !p.name.endsWith('-gmax') && !p.name.includes('-mega'));
        
        // For all dexes except national, apply generation-based filtering for forms.
        if (state.selectedPokedex.id !== 'national') {
            const romanMap: { [key: string]: number } = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9 };
            // Default to Gen IX if era isn't specified, though it should be for non-national/extra dexes.
            const era = state.selectedPokedex.era || 'Gen IX';
            const eraName = era.replace('Gen ', '');
            const pokedexGen = romanMap[eraName];

            const getSpeciesGen = (baseId: number) => {
                const gen = GENERATIONS.find(g => baseId >= g.start && baseId <= g.end);
                return gen ? gen.id : 99; // Default to a high number if not found
            };
    
            const getFormIntroGen = (formName: string) => {
                if (formName.includes('-alola')) return 7;
                if (formName.includes('-galar')) return 8;
                if (formName.includes('-hisui')) return 8;
                if (formName.includes('-paldea')) return 9;
                return null; // It's a base form or other type of form
            };

            if (pokedexGen) {
                potentialPokemon = potentialPokemon.filter(p => {
                    const speciesGen = getSpeciesGen(p.baseId);
                    if (speciesGen > pokedexGen) return false;

                    const formIntroGen = getFormIntroGen(p.name);
                    return !formIntroGen || formIntroGen <= pokedexGen;
                });
            }
        }
        
        // --- Form Filtering Logic ---
        const regionalDexMap: { [key: string]: string } = {
            'updated-alola': 'alola',
            'galar': 'galar',
            'isle-of-armor': 'galar',
            'crown-tundra': 'galar',
            'hisui': 'hisui',
            'paldea': 'paldea',
            'kitakami': 'paldea',
            'blueberry': 'paldea',
        };
        const selectedRegion = state.selectedPokedex.id in regionalDexMap ? regionalDexMap[state.selectedPokedex.id] : null;

        const pokemonBySpecies = new Map<number, any[]>();
        potentialPokemon.forEach(p => {
            if (!pokemonBySpecies.has(p.baseId)) {
                pokemonBySpecies.set(p.baseId, []);
            }
            pokemonBySpecies.get(p.baseId)!.push(p);
        });

        const filteredPokemonList = [];
        for (const [baseId, forms] of pokemonBySpecies.entries()) {
            if (selectedRegion) {
                let regionalForms = forms.filter(f => f.name.includes(`-${selectedRegion}`));
                if (selectedRegion === 'hisui' && baseId === 550) {
                    const whiteStripedForm = forms.find(f => f.name === 'basculin-white-striped');
                    if (whiteStripedForm) regionalForms.push(whiteStripedForm);
                }

                if (regionalForms.length > 0) {
                    filteredPokemonList.push(...regionalForms);
                } else {
                    const defaultForm = forms.find(f => state.pokemonFormInfo.get(f.name)?.isDefault);
                    if (defaultForm) filteredPokemonList.push(defaultForm);
                }
            } else {
                const defaultForm = forms.find(f => state.pokemonFormInfo.get(f.name)?.isDefault);
                if (defaultForm) {
                    filteredPokemonList.push(defaultForm);
                } else if (forms.length > 0) {
                    filteredPokemonList.push(forms[0]);
                }
            }
        }
        potentialPokemon = filteredPokemonList;
        // --- End Form Filtering Logic ---

        if (state.selectedPokedex.id === 'extra') {
            potentialPokemon = potentialPokemon.filter(p => p.baseId > 1025);
        } else if (state.selectedPokedex.id !== 'national') {
            potentialPokemon = potentialPokemon.filter(p => p.baseId <= 1025);
        }

        if (state.selectedPokedex.id === 'national') {
             const list = potentialPokemon
                .map(p => ({
                    name: p.name,
                    url: p.url,
                    id: p.id,
                    pokedexNumber: p.baseId,
                    hasGmax: p.hasGmax
                }));
            list.sort((a,b) => a.pokedexNumber - b.pokedexNumber || a.id - b.id);
            state.currentPokemonList = list;
        } else if (state.selectedPokedex.id === 'extra') {
             const list = potentialPokemon
                .map(p => ({
                    name: p.name,
                    url: p.url,
                    id: p.id,
                    pokedexNumber: p.id,
                    hasGmax: p.hasGmax
                }));
            list.sort((a,b) => a.id - b.id);
            state.currentPokemonList = list;
        } else if (state.selectedPokedex.isGeneration && state.selectedPokedex.genId) {
            const gen = GENERATIONS.find(g => g.id === state.selectedPokedex!.genId);
            if (gen) {
                const list = potentialPokemon
                    .filter(p => p.baseId >= gen.start && p.baseId <= gen.end)
                    .map(p => ({
                        name: p.name,
                        url: p.url,
                        id: p.id,
                        pokedexNumber: p.baseId,
                        hasGmax: p.hasGmax
                    }));
                list.sort((a,b) => a.pokedexNumber - b.pokedexNumber || a.id - b.id);
                state.currentPokemonList = list;
            }
        } else { // Game or other non-generation dex
            const response = await fetchWithRetry(`https://pokeapi.co/api/v2/pokedex/${state.selectedPokedex.id}`);
            if (!response.ok) throw new Error(`Could not fetch pokedex: ${state.selectedPokedex.id}`);
            const dexData = await response.json();
            const entries = dexData.pokemon_entries;

            const speciesNameToNumberMap = new Map<string, number>();
            for (const entry of entries) {
                speciesNameToNumberMap.set(entry.pokemon_species.name, entry.entry_number);
            }

            const list: PokemonGridItem[] = potentialPokemon
                .map(p => {
                    const speciesName = state.pokemonFormInfo.get(p.name)?.speciesName;
                    if (!speciesName || !speciesNameToNumberMap.has(speciesName)) {
                        return null;
                    }
                    return {
                        name: p.name,
                        url: p.url,
                        id: p.id,
                        pokedexNumber: speciesNameToNumberMap.get(speciesName)!,
                        hasGmax: p.hasGmax
                    };
                })
                .filter((p): p is PokemonGridItem => p !== null);
            
            list.sort((a, b) => a.pokedexNumber - b.pokedexNumber || a.id - b.id);
            state.currentPokemonList = list;
        }
    } catch (e) {
        console.error("Failed to fetch pokedex list", e);
        state.currentPokemonList = [];
    }
}

export async function fetchEvolutionChain(evolutionChainUrl: string, activeFormName: string): Promise<EvolutionNode | null> {
    
    // This map is the definitive source of truth for all evolution paths, especially for regional forms.
    // It overrides the ambiguous, species-based data from the API to ensure correctness.
    const FORM_EVOLUTION_MAP: { [key: string]: { prevo: string | null; evos: { to: string; details: any[] }[] } } = {
        // Kanto
        'rattata': { prevo: null, evos: [{ to: 'raticate', details: [{ trigger: { name: 'level-up' }, min_level: 20 }] }] },
        'raticate': { prevo: 'rattata', evos: [] },
        'rattata-alola': { prevo: null, evos: [{ to: 'raticate-alola', details: [{ trigger: { name: 'level-up' }, min_level: 20, time_of_day: 'night' }] }] },
        'raticate-alola': { prevo: 'rattata-alola', evos: [] },
        'pichu': { prevo: null, evos: [{ to: 'pikachu', details: [{ trigger: { name: 'level-up' }, min_happiness: 160 }] }] },
        'pikachu': { prevo: 'pichu', evos: [{ to: 'raichu', details: [{ trigger: { name: 'use-item' }, item: { name: 'thunder-stone' }}]}, { to: 'raichu-alola', details: [{ trigger: { name: 'use-item' }, item: { name: 'thunder-stone' }, custom_string: 'In Alola region' }] }] },
        'raichu': { prevo: 'pikachu', evos: [] },
        'raichu-alola': { prevo: 'pikachu', evos: [] },
        'sandshrew': { prevo: null, evos: [{ to: 'sandslash', details: [{ trigger: { name: 'level-up' }, min_level: 22 }] }] },
        'sandslash': { prevo: 'sandshrew', evos: [] },
        'sandshrew-alola': { prevo: null, evos: [{ to: 'sandslash-alola', details: [{ trigger: { name: 'use-item' }, item: { name: 'ice-stone' }}] }] },
        'sandslash-alola': { prevo: 'sandshrew-alola', evos: [] },
        'vulpix': { prevo: null, evos: [{ to: 'ninetales', details: [{ trigger: { name: 'use-item' }, item: { name: 'fire-stone' }}] }] },
        'ninetales': { prevo: 'vulpix', evos: [] },
        'vulpix-alola': { prevo: null, evos: [{ to: 'ninetales-alola', details: [{ trigger: { name: 'use-item' }, item: { name: 'ice-stone' }}] }] },
        'ninetales-alola': { prevo: 'vulpix-alola', evos: [] },
        'diglett': { prevo: null, evos: [{ to: 'dugtrio', details: [{ trigger: { name: 'level-up' }, min_level: 26 }] }] },
        'dugtrio': { prevo: 'diglett', evos: [] },
        'diglett-alola': { prevo: null, evos: [{ to: 'dugtrio-alola', details: [{ trigger: { name: 'level-up' }, min_level: 26 }] }] },
        'dugtrio-alola': { prevo: 'diglett-alola', evos: [] },
        'meowth': { prevo: null, evos: [{ to: 'persian', details: [{ trigger: { name: 'level-up' }, min_level: 28 }] }] },
        'persian': { prevo: 'meowth', evos: [] },
        'meowth-alola': { prevo: null, evos: [{ to: 'persian-alola', details: [{ trigger: { name: 'level-up' }, min_happiness: 160 }] }] },
        'persian-alola': { prevo: 'meowth-alola', evos: [] },
        'meowth-galar': { prevo: null, evos: [{ to: 'perrserker', details: [{ trigger: { name: 'level-up' }, min_level: 28 }] }] },
        'perrserker': { prevo: 'meowth-galar', evos: [] },
        'mankey': { prevo: null, evos: [{ to: 'primeape', details: [{ trigger: { name: 'level-up' }, min_level: 28 }] }] },
        'primeape': { prevo: 'mankey', evos: [{ to: 'annihilape', details: [{ custom_string: 'Use Rage Fist 20 times' }] }] },
        'annihilape': { prevo: 'primeape', evos: [] },
        'growlithe': { prevo: null, evos: [{ to: 'arcanine', details: [{ trigger: { name: 'use-item' }, item: { name: 'fire-stone' }}] }] },
        'arcanine': { prevo: 'growlithe', evos: [] },
        'growlithe-hisui': { prevo: null, evos: [{ to: 'arcanine-hisui', details: [{ trigger: { name: 'use-item' }, item: { name: 'fire-stone' }}] }] },
        'arcanine-hisui': { prevo: 'growlithe-hisui', evos: [] },
        'geodude': { prevo: null, evos: [{ to: 'graveler', details: [{ trigger: { name: 'level-up' }, min_level: 25 }] }] },
        'graveler': { prevo: 'geodude', evos: [{ to: 'golem', details: [{ trigger: { name: 'trade' }}] }] },
        'golem': { prevo: 'graveler', evos: [] },
        'geodude-alola': { prevo: null, evos: [{ to: 'graveler-alola', details: [{ trigger: { name: 'level-up' }, min_level: 25 }] }] },
        'graveler-alola': { prevo: 'geodude-alola', evos: [{ to: 'golem-alola', details: [{ trigger: { name: 'trade' }}] }] },
        'golem-alola': { prevo: 'graveler-alola', evos: [] },
        'ponyta': { prevo: null, evos: [{ to: 'rapidash', details: [{ trigger: { name: 'level-up' }, min_level: 40 }] }] },
        'rapidash': { prevo: 'ponyta', evos: [] },
        'ponyta-galar': { prevo: null, evos: [{ to: 'rapidash-galar', details: [{ trigger: { name: 'level-up' }, min_level: 40 }] }] },
        'rapidash-galar': { prevo: 'ponyta-galar', evos: [] },
        'slowpoke': { prevo: null, evos: [{ to: 'slowbro', details: [{ trigger: { name: 'level-up' }, min_level: 37 }]}, { to: 'slowking', details: [{ trigger: { name: 'trade' }, held_item: { name: 'kings-rock' }}] }] },
        'slowbro': { prevo: 'slowpoke', evos: [] },
        'slowking': { prevo: 'slowpoke', evos: [] },
        'slowpoke-galar': { prevo: null, evos: [{ to: 'slowbro-galar', details: [{ trigger: { name: 'use-item' }, item: { name: 'galarica-cuff' } }]}, { to: 'slowking-galar', details: [{ trigger: { name: 'use-item' }, item: { name: 'galarica-wreath' }}] }] },
        'slowbro-galar': { prevo: 'slowpoke-galar', evos: [] },
        'slowking-galar': { prevo: 'slowpoke-galar', evos: [] },
        'farfetchd': { prevo: null, evos: [] },
        'farfetchd-galar': { prevo: null, evos: [{ to: 'sirfetchd', details: [{ custom_string: '3 Critical Hits<br>in one battle' }] }] },
        'sirfetchd': { prevo: 'farfetchd-galar', evos: [] },
        'grimer': { prevo: null, evos: [{ to: 'muk', details: [{ trigger: { name: 'level-up' }, min_level: 38 }] }] },
        'muk': { prevo: 'grimer', evos: [] },
        'grimer-alola': { prevo: null, evos: [{ to: 'muk-alola', details: [{ trigger: { name: 'level-up' }, min_level: 38 }] }] },
        'muk-alola': { prevo: 'grimer-alola', evos: [] },
        'exeggcute': { prevo: null, evos: [{ to: 'exeggutor', details: [{ trigger: { name: 'use-item' }, item: { name: 'leaf-stone' }}]}, { to: 'exeggutor-alola', details: [{ trigger: { name: 'use-item' }, item: { name: 'leaf-stone' }, custom_string: 'In Alola region' }] }] },
        'exeggutor': { prevo: 'exeggcute', evos: [] },
        'exeggutor-alola': { prevo: 'exeggcute', evos: [] },
        'cubone': { prevo: null, evos: [{ to: 'marowak', details: [{ trigger: { name: 'level-up' }, min_level: 28 }]}, { to: 'marowak-alola', details: [{ trigger: { name: 'level-up' }, min_level: 28, time_of_day: 'night', custom_string: 'Level 28 at Night<br>(in Alola)' }] }] },
        'marowak': { prevo: 'cubone', evos: [] },
        'marowak-alola': { prevo: 'cubone', evos: [] },
        'koffing': { prevo: null, evos: [{ to: 'weezing', details: [{ trigger: { name: 'level-up' }, min_level: 35 }]}, { to: 'weezing-galar', details: [{ trigger: { name: 'level-up' }, min_level: 35, custom_string: 'Level 35 in Galar' }] }] },
        'weezing': { prevo: 'koffing', evos: [] },
        'weezing-galar': { prevo: 'koffing', evos: [] },
        'mime-jr': { prevo: null, evos: [{ to: 'mr-mime', details: [{ trigger: { name: 'level-up' }, known_move: { name: 'mimic' }}]}, { to: 'mr-mime-galar', details: [{ trigger: { name: 'level-up' }, known_move: { name: 'mimic' }, custom_string: 'Knowing Mimic<br>(in Galar)' }] }] },
        'mr-mime': { prevo: 'mime-jr', evos: [] },
        'mr-mime-galar': { prevo: 'mime-jr', evos: [{ to: 'mr-rime', details: [{ trigger: { name: 'level-up' }, min_level: 42 }] }] },
        'mr-rime': { prevo: 'mr-mime-galar', evos: [] },
        'scyther': { prevo: null, evos: [{ to: 'scizor', details: [{ trigger: { name: 'trade' }, held_item: { name: 'metal-coat' }}]}, { to: 'kleavor', details: [{ trigger: { name: 'use-item' }, item: { name: 'black-augurite' } }] }] },
        'scizor': { prevo: 'scyther', evos: [] },
        'kleavor': { prevo: 'scyther', evos: [] },
        // Johto
        'cyndaquil': { prevo: null, evos: [{ to: 'quilava', details: [{ trigger: { name: 'level-up' }, min_level: 14 }] }] },
        'quilava': { prevo: 'cyndaquil', evos: [{ to: 'typhlosion', details: [{ trigger: { name: 'level-up' }, min_level: 36 }]}, { to: 'typhlosion-hisui', details: [{ trigger: { name: 'level-up' }, min_level: 36, custom_string: 'Level 36 in Hisui' }] }] },
        'typhlosion': { prevo: 'quilava', evos: [] },
        'typhlosion-hisui': { prevo: 'quilava', evos: [] },
        'wooper': { prevo: null, evos: [{ to: 'quagsire', details: [{ trigger: { name: 'level-up' }, min_level: 20 }] }] },
        'quagsire': { prevo: 'wooper', evos: [] },
        'wooper-paldea': { prevo: null, evos: [{ to: 'clodsire', details: [{ trigger: { name: 'level-up' }, min_level: 20 }] }] },
        'clodsire': { prevo: 'wooper-paldea', evos: [] },
        'qwilfish': { prevo: null, evos: [] },
        'qwilfish-hisui': { prevo: null, evos: [{ to: 'overqwil', details: [{ custom_string: 'Use Barb Barrage<br>(Strong Style) 20 times' }] }] },
        'overqwil': { prevo: 'qwilfish-hisui', evos: [] },
        'sneasel': { prevo: null, evos: [{ to: 'weavile', details: [{ trigger: { name: 'level-up' }, held_item: { name: 'razor-claw' }, time_of_day: 'night' }] }] },
        'weavile': { prevo: 'sneasel', evos: [] },
        'sneasel-hisui': { prevo: null, evos: [{ to: 'sneasler', details: [{ trigger: { name: 'level-up' }, held_item: { name: 'razor-claw' }, time_of_day: 'day' }] }] },
        'sneasler': { prevo: 'sneasel-hisui', evos: [] },
        'teddiursa': { prevo: null, evos: [{ to: 'ursaring', details: [{ trigger: { name: 'level-up' }, min_level: 30 }] }] },
        'ursaring': { prevo: 'teddiursa', evos: [{ to: 'ursaluna', details: [{ trigger: { name: 'use-item' }, item: { name: 'peat-block' }, custom_string: 'Use Peat Block during<br>a Full Moon' }] }] },
        'ursaluna': { prevo: 'ursaring', evos: [] },
        'corsola': { prevo: null, evos: [] },
        'corsola-galar': { prevo: null, evos: [{ to: 'cursola', details: [{ trigger: { name: 'level-up' }, min_level: 38 }] }] },
        'cursola': { prevo: 'corsola-galar', evos: [] },
        'stantler': { prevo: null, evos: [{ to: 'wyrdeer', details: [{ custom_string: 'Use Psyshield Bash<br>(Agile Style) 20 times' }] }] },
        'wyrdeer': { prevo: 'stantler', evos: [] },
        // Hoenn
        'zigzagoon': { prevo: null, evos: [{ to: 'linoone', details: [{ trigger: { name: 'level-up' }, min_level: 20 }] }] },
        'linoone': { prevo: 'zigzagoon', evos: [] },
        'zigzagoon-galar': { prevo: null, evos: [{ to: 'linoone-galar', details: [{ trigger: { name: 'level-up' }, min_level: 20 }] }] },
        'linoone-galar': { prevo: 'zigzagoon-galar', evos: [{ to: 'obstagoon', details: [{ trigger: { name: 'level-up' }, min_level: 35, time_of_day: 'night' }] }] },
        'obstagoon': { prevo: 'linoone-galar', evos: [] },
        // Unova
        'darumaka': { prevo: null, evos: [{ to: 'darmanitan-standard', details: [{ trigger: { name: 'level-up' }, min_level: 35 }] }] },
        'darmanitan-standard': { prevo: 'darumaka', evos: [] },
        'darumaka-galar': { prevo: null, evos: [{ to: 'darmanitan-galar-standard', details: [{ trigger: { name: 'use-item' }, item: { name: 'ice-stone' } }] }] },
        'darmanitan-galar-standard': { prevo: 'darumaka-galar', evos: [] },
        'yamask': { prevo: null, evos: [{ to: 'cofagrigus', details: [{ trigger: { name: 'level-up' }, min_level: 34 }] }] },
        'cofagrigus': { prevo: 'yamask', evos: [] },
        'yamask-galar': { prevo: null, evos: [{ to: 'runerigus', details: [{ custom_string: 'Take 49+ damage &<br>walk under arch' }] }] },
        'runerigus': { prevo: 'yamask-galar', evos: [] },
        'zorua': { prevo: null, evos: [{ to: 'zoroark', details: [{ trigger: { name: 'level-up' }, min_level: 30 }] }] },
        'zoroark': { prevo: 'zorua', evos: [] },
        'zorua-hisui': { prevo: null, evos: [{ to: 'zoroark-hisui', details: [{ trigger: { name: 'level-up' }, min_level: 30 }] }] },
        'zoroark-hisui': { prevo: 'zorua-hisui', evos: [] },
        // Kalos
        'goomy': { prevo: null, evos: [{ to: 'sliggoo', details: [{ trigger: { name: 'level-up' }, min_level: 40 }]}, { to: 'sliggoo-hisui', details: [{ trigger: { name: 'level-up' }, min_level: 40, custom_string: 'Level 40 in Hisui' }] }] },
        'sliggoo': { prevo: 'goomy', evos: [{ to: 'goodra', details: [{ trigger: { name: 'level-up' }, min_level: 50, needs_overworld_rain: true }] }] },
        'goodra': { prevo: 'sliggoo', evos: [] },
        'sliggoo-hisui': { prevo: 'goomy', evos: [{ to: 'goodra-hisui', details: [{ trigger: { name: 'level-up' }, min_level: 50, needs_overworld_rain: true }] }] },
        'goodra-hisui': { prevo: 'sliggoo-hisui', evos: [] },
        'bergmite': { prevo: null, evos: [{ to: 'avalugg', details: [{ trigger: { name: 'level-up' }, min_level: 37 }]}, { to: 'avalugg-hisui', details: [{ trigger: { name: 'level-up' }, min_level: 37, custom_string: 'Level 37 in Hisui' }] }] },
        'avalugg': { prevo: 'bergmite', evos: [] },
        'avalugg-hisui': { prevo: 'bergmite', evos: [] },
        // Alola
        'rowlet': { prevo: null, evos: [{ to: 'dartrix', details: [{ trigger: { name: 'level-up' }, min_level: 17 }] }] },
        'dartrix': { prevo: 'rowlet', evos: [{ to: 'decidueye', details: [{ trigger: { name: 'level-up' }, min_level: 34 }]}, { to: 'decidueye-hisui', details: [{ trigger: { name: 'level-up' }, min_level: 36, custom_string: 'Level 36 in Hisui' }] }] },
        'decidueye': { prevo: 'dartrix', evos: [] },
        'decidueye-hisui': { prevo: 'dartrix', evos: [] },
        // Special Cases
        'basculin-white-striped': { prevo: null, evos: [{ to: 'basculegion-male', details: [{ custom_string: 'Take 294+ recoil damage.<br/>(Evolves to Male form)' }] }, { to: 'basculegion-female', details: [{ custom_string: 'Take 294+ recoil damage.<br/>(Evolves to Female form)' }] }] },
        'basculegion-male': { prevo: 'basculin-white-striped', evos: [] },
        'basculegion-female': { prevo: 'basculin-white-striped', evos: [] },
    };
    
    // --- UTILITY: Format evolution details from API data ---
    function formatEvolutionDetails(details: any[]): string {
        if (!details || details.length === 0) return '';
        const detail = details[0];
        
        // Prioritize custom-defined strings for complex evolution methods
        if (detail.custom_string) {
            return `<div class="flex flex-col items-center justify-center gap-1">
                <div class="text-3xl" title="Special Condition">✨</div>
                <div class="text-xs text-zinc-400 leading-tight">${detail.custom_string}</div>
            </div>`;
        }

        const trigger = detail.trigger?.name || '';
        const conditionParts: string[] = [];

        if (detail.min_level) conditionParts.push(`Level ${detail.min_level}`);
        if (detail.min_happiness) conditionParts.push(`High Friendship`);
        if (detail.min_affection) conditionParts.push(`High Affection`);
        if (detail.time_of_day) conditionParts.push(`at ${detail.time_of_day}`);
        if (detail.held_item) conditionParts.push(`holding ${detail.held_item.name.replace(/-/g, ' ')}`);
        if (detail.known_move) conditionParts.push(`knowing ${detail.known_move.name.replace(/-/g, ' ')}`);
        if (detail.gender === 1) conditionParts.push('(Female)'); // API gender: 1=Female, 2=Male
        else if (detail.gender === 2) conditionParts.push('(Male)');
        if (detail.location) conditionParts.push(`at ${detail.location.name.replace(/-/g, ' ')}`);
        if (detail.relative_physical_stats === 1) conditionParts.push('Atk > Def');
        else if (detail.relative_physical_stats === -1) conditionParts.push('Atk < Def');
        else if (detail.relative_physical_stats === 0) conditionParts.push('Atk = Def');
        if (detail.needs_overworld_rain) conditionParts.push('in Rain');

        let mainElement = '';
        const itemName = detail.item?.name;
        
        if (trigger === 'use-item' && itemName) {
            const itemImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
            mainElement = `
                <div class="flex flex-col items-center text-center gap-1" title="Use ${itemName.replace(/-/g, ' ')}">
                    <img src="${itemImageUrl}" alt="${itemName}" class="h-8 w-8 object-contain" onerror="this.style.display='none'"/>
                    <span class="text-xs capitalize">${itemName.replace(/-/g, ' ')}</span>
                </div>`;
        } else if (trigger === 'trade') {
            mainElement = `<div class="flex flex-col items-center gap-1"><div class="text-3xl" title="Trade">🔄</div><span class="text-xs">Trade</span></div>`;
        } else if (detail.min_happiness || detail.min_affection) {
             mainElement = `<div class="flex flex-col items-center gap-1"><div class="text-3xl" title="High Friendship/Affection">😊</div></div>`;
        }
        
        const conditionsText = conditionParts.length > 0 ? `<div class="text-xs text-zinc-400 leading-tight">${conditionParts.join('<br>')}</div>` : '';
        if (!mainElement && !conditionsText && trigger) return `<span class="font-bold capitalize">${trigger.replace(/-/g, ' ')}</span>`;
        return `<div class="flex flex-col items-center justify-center gap-1">${mainElement}${conditionsText}</div>`;
    }
    
    // --- Build node from our hardcoded map ---
    function buildNodeFromMap(formName: string): EvolutionNode | null {
        const formUrl = state.pokemonUrlMap.get(formName);
        if (!formUrl) {
            console.warn(`Could not find a valid form URL for: ${formName}`);
            return null;
        }
        const formId = getPokemonIdFromUrl(formUrl);

        const node: EvolutionNode = {
            name: formName,
            id: formId,
            url: formUrl,
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formId}.png`,
            evolvesTo: [],
        };

        const evoData = FORM_EVOLUTION_MAP[formName];
        if (evoData && evoData.evos.length > 0) {
            node.evolvesTo = evoData.evos
                .map(evo => {
                    const childNode = buildNodeFromMap(evo.to);
                    if (!childNode) return null;
                    return { details: formatEvolutionDetails(evo.details), node: childNode };
                })
                .filter((e): e is { details: string; node: EvolutionNode; } => e !== null);
        }

        return node;
    }
    
    // --- Build node from PokeAPI chain data ---
    async function buildNodeFromApi(chainUrl: string): Promise<EvolutionNode | null> {
        const chainRes = await fetchWithRetry(chainUrl);
        const chainData = await chainRes.json();
        
        function parseApiChain(chain: any): EvolutionNode | null {
            if (!chain) return null;
            const speciesName = chain.species.name;
            
            // Find the default form for this species
            const defaultForm = state.displayablePokemon.find(p => {
                const info = state.pokemonFormInfo.get(p.name);
                return info?.speciesName === speciesName && info.isDefault;
            });

            // If a specific default form is found (e.g., 'bulbasaur'), use it. Otherwise, fallback to species name.
            const formName = defaultForm?.name || speciesName;
            const formUrl = state.pokemonUrlMap.get(formName);
            if (!formUrl) return null;
            const formId = getPokemonIdFromUrl(formUrl);

            const evolvesTo = chain.evolves_to.map((evo: any) => {
                const details = formatEvolutionDetails(evo.evolution_details);
                const node = parseApiChain(evo);
                return node ? { details, node } : null;
            }).filter((e): e is { details: string; node: EvolutionNode; } => e !== null);

            return {
                name: formName,
                id: formId,
                url: formUrl,
                imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formId}.png`,
                evolvesTo: evolvesTo,
            };
        }
        
        return parseApiChain(chainData.chain);
    }
    
    try {
        let chainRootForm = activeFormName;
        // Traverse up the evolution chain using our map to find the true base form.
        while (FORM_EVOLUTION_MAP[chainRootForm]?.prevo) {
            chainRootForm = FORM_EVOLUTION_MAP[chainRootForm].prevo!;
        }
        
        // If the form IS in our map, we use our hardcoded data for maximum accuracy.
        if (FORM_EVOLUTION_MAP[chainRootForm]) {
            return buildNodeFromMap(chainRootForm);
        }

        // If the form isn't in our map, it's a standard Pokémon.
        // We fetch from the API and build the chain dynamically.
        if (evolutionChainUrl) {
            return await buildNodeFromApi(evolutionChainUrl);
        }
        
        return null; // No evolution chain URL found

    } catch (error) {
        console.error("Failed to fetch and parse evolution chain:", error);
        return null;
    }
}


export async function fetchPokedexEntry(url: string) {
    try {
        const pokemonRes = await fetchWithRetry(url);
        if (!pokemonRes.ok) throw new Error(`Could not fetch pokemon data for ${url}`);
        const pokemonData = await pokemonRes.json();
        
        const speciesRes = await fetchWithRetry(pokemonData.species.url);
        if (!speciesRes.ok) throw new Error(`Could not fetch species data for ${pokemonData.species.url}`);
        const speciesData = await speciesRes.json();
        
        const evolutionChainUrl = speciesData.evolution_chain?.url;

        // Fetch details for all other forms of the same species
        const varieties = speciesData.varieties || [];
        const formPromises = varieties
            .filter((v: any) => v.pokemon.name !== pokemonData.name && v.pokemon.url)
            .map((v: any) => 
                fetchWithRetry(v.pokemon.url)
                .then(res => {
                    if (!res.ok) return null; // Silently fail if a form doesn't resolve
                    return res.json();
                })
                .catch(() => null) // Catch network errors
            );

        // Fetch location and growth rate data
        const locationPromise = fetchWithRetry(pokemonData.location_area_encounters).then(res => res.ok ? res.json() : Promise.resolve([])).catch(() => []);
        const growthRatePromise = speciesData.growth_rate?.url ? fetchWithRetry(speciesData.growth_rate.url).then(res => res.ok ? res.json() : Promise.resolve(null)).catch(() => null) : Promise.resolve(null);
        
        const [locationDetails, growthRateDetails, allOtherFormsDetails, evolutionChain] = await Promise.all([
            locationPromise,
            growthRatePromise,
            Promise.all(formPromises).then(forms => forms.filter(Boolean)),
            evolutionChainUrl ? fetchEvolutionChain(evolutionChainUrl, pokemonData.name) : Promise.resolve(null),
        ]);

        return {
            pokemon: { ...pokemonData, speciesData, allOtherFormsDetails, locationDetails, growthRateDetails },
            evolutionChain: evolutionChain,
        }

    } catch (error) {
        console.error("Failed to fetch Pokémon details:", error);
        return { pokemon: null, evolutionChain: null };
    }
}