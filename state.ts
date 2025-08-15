

import { PokemonType } from './constants.ts';
import { View, PokemonFamily, DisplayPokemon, PokedexInfo, PokemonGridItem, EvolutionNode, Generation, ItemData, AbilityData, AbilityViewMode, AttackData, AttackViewMode } from './types.ts';

interface AppState {
    // Chart view state
    selectedDefendingTypes: PokemonType[];
    selectedGeneration: Generation;
    displayedTypes: PokemonType[];

    // View routing and global state
    currentView: View;
    previousView: View;
    pokemonDB: PokemonFamily[];
    displayablePokemon: DisplayPokemon[];
    pokemonUrlMap: Map<string, string>;
    pokemonFormInfo: Map<string, { speciesName: string; isDefault: boolean }>;
    isLoadingDB: boolean;
    globalSearchTerm: string;
    isSearchOverlayVisible: boolean;

    // Home View state
    homeViewMode: 'selection' | 'list';
    selectedPokedex: PokedexInfo | null;
    currentPokemonList: PokemonGridItem[];
    isLoadingPokedexList: boolean;
    homeScrollPosition: number;

    // Pokedex view state
    selectedPokemonUrl: string | null;
    selectedPokemonDetails: any | null;
    activeFormName: string | null;
    isLoadingPokedexEntry: boolean;
    isLoadingEvolution: boolean;
    selectedGameEraName: string | null;
    selectedPokemonEvolutionChain: EvolutionNode | null;

    // Item Index state
    itemsDB: ItemData[];
    isLoadingItems: boolean;
    itemViewMode: 'categories' | 'list' | 'detail';
    selectedItemCategory: string | null;
    selectedItemData: ItemData | null;

    // Ability Index state
    abilitiesDB: AbilityData[];
    isLoadingAbilities: boolean;
    abilitySearchTerm: string;
    abilityViewMode: AbilityViewMode;
    selectedAbilityData: AbilityData | null;

    // Attack Index state
    attacksDB: AttackData[];
    isLoadingAttacks: boolean;
    attackViewMode: AttackViewMode;
    selectedAttackData: AttackData | null;
}


export const state: AppState = {
    // Chart view state
    selectedDefendingTypes: [],
    selectedGeneration: 'gen6',
    displayedTypes: [],

    // View routing and global state
    currentView: 'home',
    previousView: 'home',
    pokemonDB: [],
    displayablePokemon: [],
    pokemonUrlMap: new Map<string, string>(),
    pokemonFormInfo: new Map<string, { speciesName: string, isDefault: boolean }>(),
    isLoadingDB: true,
    globalSearchTerm: '',
    isSearchOverlayVisible: false,

    // Home View state
    homeViewMode: 'selection',
    selectedPokedex: null,
    currentPokemonList: [],
    isLoadingPokedexList: false,
    homeScrollPosition: 0,

    // Pokedex view state
    selectedPokemonUrl: null,
    selectedPokemonDetails: null,
    activeFormName: null,
    isLoadingPokedexEntry: false,
    isLoadingEvolution: false,
    selectedGameEraName: null,
    selectedPokemonEvolutionChain: null,

    // Item Index state
    itemsDB: [],
    isLoadingItems: true,
    itemViewMode: 'categories',
    selectedItemCategory: null,
    selectedItemData: null,

    // Ability Index state
    abilitiesDB: [],
    isLoadingAbilities: true,
    abilitySearchTerm: '',
    abilityViewMode: 'list',
    selectedAbilityData: null,

    // Attack Index state
    attacksDB: [],
    isLoadingAttacks: true,
    attackViewMode: 'list',
    selectedAttackData: null,
};