/**
 * GENKIT TOOL SCHEMA
 * 
 * This file defines the structure of the "Tools" available to the AI.
 * It is used to generate the system prompt instructions.
 */

export const AVAILABLE_COMPONENTS = [
    {
        type: "hero_magic",
        description: "A high-conversion visual hero section with animated meteor effects. Best for Homepage.",
        props: {
            headline: "string",
            subheadline: "string",
            ctaText: "string"
        }
    },
    {
        type: "hero_v2",
        description: "Modern SaaS-style centered hero with background image.",
        props: {
            headline: "string",
            subheadline: "string",
            ctaText: "string",
            imageUrl: "string (url)"
        }
    },
    {
        type: "bento_grid",
        description: "Apple-style grid layout for displaying 3-4 key features or benefits.",
        props: {
            title: "string",
            items: "Array<{ title: string, description: string, colSpan: 1 | 2 }>"
        }
    },
    {
        type: "trust_marquee",
        description: "Infinite scrolling list of reviews. Use for Social Proof.",
        props: {
            reviews: "Array<{ name: string, text: string, rating: number }>"
        }
    },
    {
        type: "lead_form_split",
        description: "High-conversion form with value props on left, input fields on right.",
        props: {
            title: "string",
            subtitle: "string"
        }
    },
    {
        type: "local_map",
        description: "Geo-targeted section showing service area. MANDATORY for Local Landing Pages.",
        props: {
            areaName: "string",
            serviceRadius: "string"
        }
    }
];

export const GENKIT_SYSTEM_PROMPT = `
You are an autonomous AI Site Reliability Engineer.
Your toolkit consists of the following React Components (Lego Blocks):
${JSON.stringify(AVAILABLE_COMPONENTS, null, 2)}

When optimizing a page:
1. Choose components that match the user intent (e.g., 'local_map' for area pages).
2. Output the full JSON structure for the 'components' column in the Sheet.
3. Do not invent new component types.
`;