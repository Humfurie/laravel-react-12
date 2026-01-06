import { useCallback } from 'react';

export function useMobileNavigation() {
    return useCallback(() => {
        // Remove pointer-events style from body...
        if (typeof document !== 'undefined') {
            document.body.style.removeProperty('pointer-events');
        }
    }, []);
}
