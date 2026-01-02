import { PageConfig, ComponentData } from '../types';

/**
 * SCHEMA VALIDATION LAYER
 * 
 * Ensures that data fetched from the Google Sheet matches the strict
 * JSON structure required by the React components. This prevents the
 * site from crashing if the AI (Genkit) or a human writes bad JSON.
 */

export const isValidComponentData = (data: any): data is ComponentData => {
    if (typeof data !== 'object' || data === null) return false;
    
    const hasId = typeof data.id === 'string';
    const hasType = typeof data.type === 'string';
    const hasProps = typeof data.props === 'object' && data.props !== null;
    
    if (!hasId || !hasType || !hasProps) {
        return false;
    }
    return true;
}

export const validatePageConfig = (data: any, slug: string): data is PageConfig => {
    if (typeof data !== 'object' || data === null) {
        console.warn(`[Validation] Page '${slug}' is null or not an object.`);
        return false;
    }

    // 1. Check Metadata
    if (typeof data.metaTitle !== 'string') {
        // Auto-fix optional string fields if missing in non-strict mode
        data.metaTitle = data.metaTitle || "Gen Roof Tiling";
    }

    // 2. Check Layout Array
    if (!Array.isArray(data.layout)) {
        console.error(`[Validation] Page '${slug}' has invalid layout. Expected Array, got ${typeof data.layout}.`);
        return false;
    }

    // 3. Check Components Map
    if (typeof data.components !== 'object' || data.components === null) {
        console.error(`[Validation] Page '${slug}' has invalid components map.`);
        return false;
    }

    // 4. Deep Check Components
    for (const key of data.layout) {
        const component = data.components[key];
        if (!component) {
            console.warn(`[Validation] Page '${slug}' layout references '${key}' but it is missing in components map.`);
            // We allow this but log a warning (renderer will skip it)
            continue;
        }
        if (!isValidComponentData(component)) {
            console.error(`[Validation] Page '${slug}' has malformed component data for '${key}'.`);
            return false;
        }
    }
    
    return true;
}