import { TravelMapNodeComponent } from '@/components/tiptap-node/travel-map-node/travel-map-node';
import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react';
import type { BlogLocation } from '@/types';

export interface TravelMapNodeOptions {
    /**
     * The blog locations to display on the map.
     * This is passed from the editor context.
     */
    locations?: BlogLocation[];
}

declare module '@tiptap/react' {
    interface Commands<ReturnType> {
        travelMap: {
            /**
             * Insert a travel map node into the editor.
             * @param attrs - Optional attributes for the map (locationIds, height)
             */
            setTravelMap: (attrs?: { locationIds?: number[]; height?: string }) => ReturnType;
        };
    }
}

/**
 * A Tiptap node extension that creates an interactive travel map component.
 * Shows locations from the blog's travel locations with numbered pins and route lines.
 */
export const TravelMapNode = Node.create<TravelMapNodeOptions>({
    name: 'travelMap',

    group: 'block',

    draggable: true,

    atom: true,

    addOptions() {
        return {
            locations: [],
        };
    },

    addAttributes() {
        return {
            // Store which location IDs to show (empty = show all)
            locationIds: {
                default: [],
                parseHTML: (element) => {
                    const attr = element.getAttribute('data-location-ids');
                    return attr ? JSON.parse(attr) : [];
                },
                renderHTML: (attributes) => {
                    if (!attributes.locationIds?.length) return {};
                    return { 'data-location-ids': JSON.stringify(attributes.locationIds) };
                },
            },
            // Map height
            height: {
                default: '300px',
                parseHTML: (element) => element.getAttribute('data-height') || '300px',
                renderHTML: (attributes) => ({ 'data-height': attributes.height }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="travel-map"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(
                {
                    'data-type': 'travel-map',
                    class: 'travel-map-embed',
                },
                HTMLAttributes
            ),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TravelMapNodeComponent);
    },

    addCommands() {
        return {
            setTravelMap:
                (attrs = {}) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: {
                            locationIds: attrs.locationIds || [],
                            height: attrs.height || '300px',
                        },
                    });
                },
        };
    },
});

export default TravelMapNode;
