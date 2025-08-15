import { state } from './state.ts';

export const getPokemonIdFromUrl = (url: string): number => parseInt(url.split('/').slice(-2)[0], 10);

export function escapeHtml(unsafe: string): string {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export function getPokemonNameAndBadges(formName: string): { baseName: string, badges: string[] } {
    if (formName === 'basculin-white-striped') {
        return { baseName: 'Basculin', badges: ['Hisuian'] };
    }

    const info = state.pokemonFormInfo.get(formName);

    if (!info) {
        const capitalized = formName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return { baseName: capitalized, badges: [] };
    }

    const { speciesName, isDefault } = info;
    const baseName = speciesName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (isDefault) {
        return { baseName, badges: [] };
    }

    const suffix = formName.substring(speciesName.length).replace(/^-/, '');
    
    if (!suffix) {
        return { baseName, badges: [] };
    }

    // Exclude 'G-Max' badge as per user request, since there's an icon.
    if (suffix === 'gmax') {
        return { baseName, badges: [] };
    }

    // Consolidate multi-word forms into a single badge.
    const badgeText = suffix.split('-').map(tag => {
        // Special case for 'mega' to ensure correct capitalization if it's the start of a multi-word tag.
        if (tag === 'mega') return 'Mega';
        return tag.charAt(0).toUpperCase() + tag.slice(1);
    }).join(' ');

    return { baseName, badges: [badgeText] };
}

/**
 * Determines if the evolution chain should be displayed for a given Pokémon form.
 * The chain is shown for any Pokémon that is part of a multi-stage evolution line.
 * It's hidden for single-stage Pokémon and special non-evolving forms (like Megas, G-Max, etc.).
 * @param pokemon The full Pokémon details object.
 * @returns True if the evolution chain should be shown, false otherwise.
 */
export function shouldShowEvolutionChain(pokemon: any): boolean {
    const name = pokemon.name;

    // First, check for special, non-evolving forms that should never show an evolution chain.
    const isSpecialNonEvolvingForm = name.includes('-mega') || name.includes('-gmax') || name.includes('-primal') || (name.startsWith('pikachu-') && name !== 'pikachu');
    if (isSpecialNonEvolvingForm) {
        return false;
    }

    // If we don't have the evolution chain data, we can't show it.
    if (!state.selectedPokemonEvolutionChain) {
        return false;
    }

    // A chain should be shown if the species is part of a multi-stage line.
    // This is true if the base form has evolutions.
    const isMultiStage = state.selectedPokemonEvolutionChain.evolvesTo && state.selectedPokemonEvolutionChain.evolvesTo.length > 0;
    
    return isMultiStage;
}


export function formatHeight(dm: number): string {
    if (dm === undefined || dm === null) return 'N/A';
    const meters = (dm / 10).toFixed(1);
    const inches = dm * 3.937;
    const feet = Math.floor(inches / 12);
    const remInches = Math.round(inches % 12);
    return `${meters} m (${feet}'${remInches.toString().padStart(2, '0')}")`;
}

export function formatWeight(hg: number): string {
    if (hg === undefined || hg === null) return 'N/A';
    const kg = (hg / 10).toFixed(1);
    const lbs = (hg * 0.220462).toFixed(1);
    return `${kg} kg (${lbs} lbs)`;
}

export function toTitleCase(str: string): string {
    if (!str) return '';
    return str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}