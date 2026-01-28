/**
 * @file dateUtils.ts
 * @description Utilitaires de formatage de dates
 *
 * FIXED: Now properly calculates calendar days (not raw time difference)
 * - "Aujourd'hui" = same calendar day
 * - "Hier" = previous calendar day
 * - Otherwise shows date
 */

/**
 * Get the start of day (midnight) for a date
 */
function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Calculate the difference in calendar days between two dates
 * This properly handles timezone and gives correct "Today" vs "Yesterday"
 */
function diffInCalendarDays(dateLeft: Date, dateRight: Date): number {
    const startOfDayLeft = startOfDay(dateLeft);
    const startOfDayRight = startOfDay(dateRight);

    const diffMs = startOfDayLeft.getTime() - startOfDayRight.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formate une date ISO en format français complet
 */
export function formatDateFull(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Formate une date ISO en format relatif (Aujourd'hui, Hier, ou date)
 * FIXED: Now uses calendar days, not raw time difference
 */
export function formatDateRelative(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    // Calculate difference in calendar days (not raw time)
    const diffDays = diffInCalendarDays(now, date);

    if (diffDays === 0) {
        return "Aujourd'hui";
    }
    if (diffDays === 1) {
        return 'Hier';
    }
    if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
    }
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }

    // For older dates, show day + month
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
    });
}

/**
 * Formate une date ISO pour l'affichage dans les sessions
 * Shows: "Aujourd'hui à HH:MM", "Hier", or "DD mois"
 */
export function formatSessionDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    // Calculate difference in calendar days
    const diffDays = diffInCalendarDays(now, date);

    if (diffDays === 0) {
        // Today - show time
        return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    }
    if (diffDays === 1) {
        // Yesterday - show "Hier à HH:MM"
        return `Hier à ${date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    }
    if (diffDays < 7) {
        // This week - show day name
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
    }

    // Older - show full date
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
    });
}

/**
 * Formate une date ISO en format court sans heure
 */
export function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    });
}

/**
 * Formate une date pour l'historique des sessions (avec plus de détails)
 * Shows: "Aujourd'hui à HH:MM", "Hier à HH:MM", "DD mois à HH:MM"
 */
export function formatSessionHistoryDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffDays = diffInCalendarDays(now, date);
    const timeStr = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (diffDays === 0) {
        return `Aujourd'hui à ${timeStr}`;
    }
    if (diffDays === 1) {
        return `Hier à ${timeStr}`;
    }

    // Show date with time
    const dateStr = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
    });
    return `${dateStr} à ${timeStr}`;
}