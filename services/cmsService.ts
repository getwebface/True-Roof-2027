import { Sheet2DBClient } from '@sheet2db/sdk';
import { PageConfig, GlobalConfig, ComponentData } from '../types';
import { validatePageConfig } from '../lib/validation';

// SDK INITIALIZATION
const db = new Sheet2DBClient('e9028d49-1711-4b29-90d2-5de17bbf21b9');

// RATE LIMITER (Additional safety buffer for SDK)
const RATE_LIMIT_DELAY = 2000; // 2 second buffer
const requestQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  const request = requestQueue.shift();
  if (request) {
    await request();
    setTimeout(() => {
      isProcessingQueue = false;
      processQueue();
    }, RATE_LIMIT_DELAY);
  } else {
    isProcessingQueue = false;
  }
};

const throttledSDK = (operation: () => Promise<any>): Promise<any> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await operation();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
    processQueue();
  });
};

// --- CORE API METHODS ---

/**
 * 1. READ GLOBAL: Fetches Site-wide settings only
 */
export const fetchGlobalConfig = async (): Promise<GlobalConfig> => {
    try {
        const raw = await throttledSDK(() => db.Read({}, 'global'));
        const config: GlobalConfig = {
            companyName: "Gen Roof Tiling",
            phone: "",
            email: "",
            navigation: [],
        };

        if (Array.isArray(raw)) {
            raw.forEach((row: any) => {
                if (row.key === 'navigation') {
                    config.navigation = JSON.parse(row.value || '[]');
                } else if (row.key && row.value) {
                    (config as any)[row.key] = row.value;
                }
            });
        }
        return config;
    } catch (e) {
        console.error("Global config fetch failed:", e);
        throw e;
    }
}

/**
 * 2. READ PAGE: Fetches specific page by Slug
 */
export const fetchPageBySlug = async (slug: string): Promise<PageConfig | null> => {
    try {
        const rawArray = await throttledSDK(() => db.Read({ filter: `slug:eq:${slug}` }, 'pages'));

        if (!Array.isArray(rawArray) || rawArray.length === 0) {
            return null;
        }

        const row = rawArray[0]; // Take first match

        const config: PageConfig = {
            slug: row.slug,
            metaTitle: row.meta_title,
            metaDescription: row.meta_description,
            layout: JSON.parse(row.layout || '[]'),
            components: JSON.parse(row.components || '{}'),
            themeOverrides: JSON.parse(row.theme_overrides || '{}')
        };

        if (validatePageConfig(config, slug)) {
            return config;
        }
        return null;

    } catch (e) {
        console.error(`Page fetch failed for slug "${slug}":`, e);
        return null;
    }
}


/**
 * 3. CREATE: Lead Capture
 */
export const submitLead = async (formData: Record<string, any>) => {
  const payload = {
      created_at: new Date().toISOString(),
      ...formData
  };

  const result = await throttledSDK(() => db.Insert({ data: [payload] }, 'leads'));
  return { inserted: result.inserted };
};

/**
 * 4. UPDATE: Genkit Mutation Service
 */
export const updatePageLayout = async (slug: string, mutationType: string, newLayout: string[], newComponents: Record<string, ComponentData>) => {
    const data = {
        layout: JSON.stringify(newLayout),
        components: JSON.stringify(newComponents),
        last_optimized: new Date().toISOString(),
        last_mutation: mutationType
    };

    const result = await throttledSDK(() => db.Update({
        type: 'filter',
        filter: `slug:eq:${slug}`,
        data
    }, 'pages'));

    return { updated: result.updated };
};

/**
 * 5. LOG: Analytics Signals
 * Supports Batching (Array of Signals)
 */
export const logAnalyticsSignal = async (signalOrBatch: Record<string, any> | Record<string, any>[]) => {
    // Normalize to array for Sheet2DB 'data' wrapper
    let items = Array.isArray(signalOrBatch) ? signalOrBatch : [signalOrBatch];

    // Prepare payload
    items = items.map(item => {
        const payload: any = {
            ...item,
            timestamp: new Date().toISOString(),
        };
        if (payload.metadata && typeof payload.metadata === 'object') {
            payload.metadata = JSON.stringify(payload.metadata);
        }
        return payload;
    });

    // Fire and forget
    throttledSDK(() => db.Insert({ data: items }, 'signals'))
        .catch(err => console.error("[CMS Signals] Failed to log signal batch", err));
};
