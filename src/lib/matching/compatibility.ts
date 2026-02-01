/**
 * Compatibility Matching Algorithm
 * 
 * Approach: Filter + Score (B)
 * - First filter out incompatible profiles
 * - Then calculate weighted compatibility score
 * 
 * Weights (approved by user):
 * - Objetivo igual: 10
 * - Preferências iguais: 9
 * - Mesma universidade: 8  
 * - Orçamento semelhante (±20%): 8
 * - Idade próxima (±3 anos): 4
 * - Mesma cidade de origem: 2
 */

import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Preferences = {
    smoker?: boolean
    pets?: boolean
    party?: boolean
    sleep_early?: boolean
    clean?: boolean
}

// Weight configuration
const WEIGHTS = {
    OBJECTIVE: 10,
    PREFERENCES: 9,
    UNIVERSITY: 8,
    BUDGET: 8,
    AGE: 4,
    CITY: 2,
}

const TOTAL_MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)

// Critical preferences that are deal-breakers
const CRITICAL_PREFERENCES: (keyof Preferences)[] = ['smoker', 'pets']

/**
 * Filter out profiles that are fundamentally incompatible
 */
export function filterCompatible(currentUser: Profile, profiles: Profile[]): Profile[] {
    return profiles.filter(target => {
        // Must have same objective (roommate vs housing)
        if (currentUser.looking_for && target.looking_for) {
            if (currentUser.looking_for !== target.looking_for) {
                return false
            }
        }

        // Budget must be within ±20%
        if (currentUser.budget && target.budget) {
            const diff = Math.abs(currentUser.budget - target.budget)
            const threshold = currentUser.budget * 0.2
            if (diff > threshold) {
                return false
            }
        }

        // Critical preferences must not conflict
        const userPrefs = currentUser.preferences as Preferences | null
        const targetPrefs = target.preferences as Preferences | null

        if (userPrefs && targetPrefs) {
            for (const pref of CRITICAL_PREFERENCES) {
                // If user explicitly doesn't want something and target has it
                if (userPrefs[pref] === false && targetPrefs[pref] === true) {
                    return false
                }
                // If user explicitly wants something and target doesn't
                if (userPrefs[pref] === true && targetPrefs[pref] === false) {
                    return false
                }
            }
        }

        return true
    })
}

/**
 * Calculate compatibility score between two profiles
 * Returns a percentage (0-100)
 */
export function calculateCompatibility(currentUser: Profile, target: Profile): number {
    let score = 0

    // 1. Objective match (10 points)
    if (currentUser.looking_for && target.looking_for) {
        if (currentUser.looking_for === target.looking_for) {
            score += WEIGHTS.OBJECTIVE
        }
    } else {
        // If either is null, partial score
        score += WEIGHTS.OBJECTIVE * 0.5
    }

    // 2. Preferences similarity (9 points)
    const userPrefs = currentUser.preferences as Preferences | null
    const targetPrefs = target.preferences as Preferences | null

    if (userPrefs && targetPrefs) {
        const prefKeys: (keyof Preferences)[] = ['smoker', 'pets', 'party', 'sleep_early', 'clean']
        let matchCount = 0
        let totalComparable = 0

        for (const key of prefKeys) {
            if (userPrefs[key] !== undefined && targetPrefs[key] !== undefined) {
                totalComparable++
                if (userPrefs[key] === targetPrefs[key]) {
                    matchCount++
                }
            }
        }

        if (totalComparable > 0) {
            score += (matchCount / totalComparable) * WEIGHTS.PREFERENCES
        } else {
            score += WEIGHTS.PREFERENCES * 0.5 // Neutral if no data
        }
    } else {
        score += WEIGHTS.PREFERENCES * 0.5
    }

    // 3. Same university (8 points)
    if (currentUser.university && target.university) {
        if (currentUser.university.toLowerCase() === target.university.toLowerCase()) {
            score += WEIGHTS.UNIVERSITY
        }
    }

    // 4. Budget similarity (8 points)
    if (currentUser.budget && target.budget) {
        const diff = Math.abs(currentUser.budget - target.budget)
        const maxBudget = Math.max(currentUser.budget, target.budget)
        const similarity = 1 - (diff / maxBudget)
        score += similarity * WEIGHTS.BUDGET
    } else {
        score += WEIGHTS.BUDGET * 0.3 // Low score if budget not specified
    }

    // 5. Age proximity (4 points) - max 3 years difference for full score
    if (currentUser.age && target.age) {
        const ageDiff = Math.abs(currentUser.age - target.age)
        if (ageDiff <= 3) {
            score += WEIGHTS.AGE
        } else if (ageDiff <= 5) {
            score += WEIGHTS.AGE * 0.7
        } else if (ageDiff <= 10) {
            score += WEIGHTS.AGE * 0.3
        }
        // More than 10 years = 0 points
    } else {
        score += WEIGHTS.AGE * 0.5
    }

    // 6. Same city of origin (2 points)
    if (currentUser.city_origin && target.city_origin) {
        if (currentUser.city_origin.toLowerCase() === target.city_origin.toLowerCase()) {
            score += WEIGHTS.CITY
        }
    }

    // Convert to percentage
    const percentage = Math.round((score / TOTAL_MAX_SCORE) * 100)
    return Math.min(100, Math.max(0, percentage))
}

/**
 * Get profiles sorted by compatibility
 */
export function getCompatibleProfiles(
    currentUser: Profile,
    allProfiles: Profile[]
): { profile: Profile; compatibility: number }[] {
    // First filter incompatible profiles
    const compatible = filterCompatible(currentUser, allProfiles)

    // Calculate scores and sort
    const scored = compatible.map(profile => ({
        profile,
        compatibility: calculateCompatibility(currentUser, profile)
    }))

    // Sort by compatibility descending
    scored.sort((a, b) => b.compatibility - a.compatibility)

    return scored
}

/**
 * Get compatibility label based on percentage
 */
export function getCompatibilityLabel(percentage: number): {
    label: string
    color: string
} {
    if (percentage >= 80) {
        return { label: 'Excelente', color: 'text-emerald-500' }
    } else if (percentage >= 60) {
        return { label: 'Bom', color: 'text-blue-500' }
    } else if (percentage >= 40) {
        return { label: 'Razoável', color: 'text-amber-500' }
    } else {
        return { label: 'Baixo', color: 'text-zinc-400' }
    }
}
