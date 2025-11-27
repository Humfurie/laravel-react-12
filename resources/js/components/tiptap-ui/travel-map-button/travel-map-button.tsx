import * as React from 'react';
import { MapPin } from 'lucide-react';

// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';

export interface TravelMapButtonProps extends Omit<ButtonProps, 'type'> {
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Whether to hide the button when there are no locations.
     * @default false
     */
    hideWhenNoLocations?: boolean;
    /**
     * Number of locations available (passed from parent).
     */
    locationCount?: number;
}

/**
 * Button component for inserting a travel map in a Tiptap editor.
 */
export const TravelMapButton = React.forwardRef<HTMLButtonElement, TravelMapButtonProps>(
    ({ editor: providedEditor, text, hideWhenNoLocations = false, locationCount = 0, onClick, children, ...buttonProps }, ref) => {
        const { editor } = useTiptapEditor(providedEditor);

        const canInsert = React.useMemo(() => {
            if (!editor) return false;
            return editor.can().setTravelMap?.() ?? false;
        }, [editor]);

        const isActive = editor?.isActive('travelMap') ?? false;

        const handleClick = React.useCallback(
            (event: React.MouseEvent<HTMLButtonElement>) => {
                onClick?.(event);
                if (event.defaultPrevented) return;
                editor?.chain().focus().setTravelMap().run();
            },
            [editor, onClick],
        );

        // Hide if no locations and hideWhenNoLocations is true
        if (hideWhenNoLocations && locationCount === 0) {
            return null;
        }

        const label = locationCount > 0
            ? `Insert Travel Map (${locationCount} location${locationCount !== 1 ? 's' : ''})`
            : 'Insert Travel Map';

        return (
            <Button
                type="button"
                data-style="ghost"
                data-active-state={isActive ? 'on' : 'off'}
                role="button"
                tabIndex={-1}
                disabled={!canInsert || locationCount === 0}
                data-disabled={!canInsert || locationCount === 0}
                aria-label={label}
                aria-pressed={isActive}
                tooltip={label}
                onClick={handleClick}
                {...buttonProps}
                ref={ref}
            >
                {children ?? (
                    <>
                        <MapPin className="tiptap-button-icon" />
                        {text && <span className="tiptap-button-text">{text}</span>}
                    </>
                )}
            </Button>
        );
    },
);

TravelMapButton.displayName = 'TravelMapButton';
