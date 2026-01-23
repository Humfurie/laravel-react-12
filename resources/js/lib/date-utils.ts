import { format, parseISO } from 'date-fns';

/**
 * Format date for datetime-local input (YYYY-MM-DDTHH:mm)
 * Used for HTML5 datetime-local input fields
 */
export function formatForDatetimeLocal(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
        return '';
    }
}

/**
 * Format date for backend submission (YYYY-MM-DD HH:mm:ss)
 * Used when sending datetime data to Laravel backend
 */
export function formatForBackend(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch {
        return '';
    }
}

/**
 * Format date for display (Month DD, YYYY)
 * Used for displaying dates without time in a user-friendly format
 */
export function formatForDisplay(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        return format(date, 'MMMM dd, yyyy');
    } catch {
        return '';
    }
}

/**
 * Format datetime for display with time (MMM DD, YYYY at HH:mm AM/PM)
 * Used for displaying full datetime in a user-friendly format
 */
export function formatDatetimeForDisplay(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        return format(date, "MMM dd, yyyy 'at' h:mm a");
    } catch {
        return '';
    }
}
