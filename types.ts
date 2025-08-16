

import { PokemonType } from './constants.ts';

export type Generation = 'gen1' | 'gen2-5' | 'gen6';
export type Pokemon = { name: string; url: string; id: number; };
export type PokemonFamily = { base: Pokemon; forms: Pokemon[]; };
export type View = 'home' | 'chart' | 'pokedex' | 'items' | 'abilities' | 'attacks';
export type AbilityViewMode = 'list' | 'detail';
export type AttackViewMode = 'list' | 'detail';
export type DisplayPokemon = { name: string; url: string; id: number; baseId: number; hasGmax: boolean; types: PokemonType[]; };
export type PokemonGridItem = { name: string, url: string, id: number, pokedexNumber: number, hasGmax: boolean };
export type PokedexInfo = { id: string, name: string, isGeneration: boolean, genId?: number, category: 'generation' | 'game' | 'other', era?: string, versionGroup?: string };
export type ItemData = { 
    id: number;
    name: string;
    cost: number;
    flavorText: string;
    games: string[];
    effect: string;
    category: string;
};

export type HistoryEntry = { 
    view: View; 
    url: string | null; 
    homeViewMode: 'selection' | 'list';
};

export type AbilityData = {
    id: number;
    name: string;
    effect: string;
    flavorText: string;
    generation: string;
    pokemon: {
        name: string;
        url: string;
        id: number;
    }[];
};

export type AttackData = {
    id: number;
    name: string;
    type: PokemonType;
    power: number | null;
    pp: number;
    accuracy: number | null;
    damageClass: 'physical' | 'special' | 'status';
    effectChance: number | null;
    effect: string;
    shortEffect: string;
    flavorText: string;
    generation: string;
    pokemon: {
        name: string;
        url: string;
        id: number;
    }[];
    machines: {
        versionGroup: string;
        tmNumber: string;
    }[];
};

export type EvolutionNode = {
    name: string;
    url: string;
    imageUrl: string;
    id: number;
    evolvesTo: {
        details: string;
        node: EvolutionNode;
    }[];
};