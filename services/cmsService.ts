import { ApiResponse, PageConfig, GlobalConfig, ComponentData } from '../types';
import { validatePageConfig } from '../lib/validation';

// CONFIGURATION
const API_ID = "e9028d49-1711-4b29-90d2-5de17bbf21b9"; // True Roof 2026 API ID
const BASE_URL = `https://api.sheet2db.com/v1/${API_ID}`;
const ENABLE_MOCK_FALLBACK = true;

// RATE LIMITER (Google Sheets: 100 reqs / 100 sec)
const RATE_LIMIT_DELAY = 1000; // 1 second buffer
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

const throttledFetch = (url: string, options?: RequestInit): Promise<Response> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const response = await fetch(url, options);
        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
    processQueue();
  });
};

// --- DATA HELPERS ---

const safeJsonParse = <T>(input: any, fallback: T): T => {
  if (typeof input === 'object' && input !== null) return input;
  if (typeof input !== 'string') return fallback;
  try {
    const sanitized = input
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");
    return JSON.parse(sanitized);
  } catch (e) {
    console.warn("JSON Parse Error for input:", input);
    return fallback;
  }
};

// --- CORE API METHODS ---

/**
 * 1. READ GLOBAL (GET): Fetches Site-wide settings only
 */
export const fetchGlobalConfig = async (): Promise<GlobalConfig> => {
    try {
        const response = await throttledFetch(`${BASE_URL}?sheet=global`);
        if (!response.ok) throw new Error("Global config fetch failed");
        
        const raw = await response.json();
        const config: GlobalConfig = {
            companyName: "Gen Roof Tiling",
            phone: "",
            email: "",
            navigation: [],
        };

        if (Array.isArray(raw)) {
            raw.forEach((row: any) => {
                if (row.key === 'navigation') {
                    config.navigation = safeJsonParse(row.value, []);
                } else if (row.key && row.value) {
                    (config as any)[row.key] = row.value;
                }
            });
        }
        return config;
    } catch (e) {
        if (ENABLE_MOCK_FALLBACK) return getMockData().global;
        throw e;
    }
}

/**
 * 2. READ PAGE (GET): Fetches specific page by Slug
 * Uses Query Filtering to reduce payload size.
 */
export const fetchPageBySlug = async (slug: string): Promise<PageConfig | null> => {
    try {
        // Query Filter: ?sheet=pages&slug=...
        const response = await throttledFetch(`${BASE_URL}?sheet=pages&slug=${encodeURIComponent(slug)}`);
        
        if (!response.ok) return null;
        
        const rawArray = await response.json();
        
        if (!Array.isArray(rawArray) || rawArray.length === 0) {
             // Fallback: If strict query filtering fails, check if we need to mock or if it's 404
             if (ENABLE_MOCK_FALLBACK) return getMockPage(slug);
             return null;
        }

        const row = rawArray[0]; // Take first match
        
        const config: PageConfig = {
            slug: row.slug,
            metaTitle: row.meta_title,
            metaDescription: row.meta_description,
            layout: safeJsonParse(row.layout, []),
            components: safeJsonParse(row.components, {}),
            themeOverrides: safeJsonParse(row.theme_overrides, {})
        };
        
        if (validatePageConfig(config, slug)) {
            return config;
        }
        return null;

    } catch (e) {
        if (ENABLE_MOCK_FALLBACK) return getMockPage(slug);
        return null;
    }
}


/**
 * 3. CREATE (POST): Lead Capture
 */
export const submitLead = async (formData: Record<string, any>) => {
  if (ENABLE_MOCK_FALLBACK) {
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }

  const payload = {
      created_at: new Date().toISOString(),
      ...formData
  };

  const response = await throttledFetch(`${BASE_URL}?sheet=leads`, {
    method: 'POST',
    headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ data: [payload] })
  });

  return response.json();
};

/**
 * 4. UPDATE (PATCH): Genkit Mutation Service
 */
export const updatePageLayout = async (slug: string, mutationType: string, newLayout: string[], newComponents: Record<string, ComponentData>) => {
    const payload = {
        layout: JSON.stringify(newLayout),
        components: JSON.stringify(newComponents),
        last_optimized: new Date().toISOString(),
        last_mutation: mutationType
    };

    if (ENABLE_MOCK_FALLBACK) {
        return { success: true, message: "Simulation: Sheet updated." };
    }

    const response = await throttledFetch(`${BASE_URL}/slug/${encodeURIComponent(slug)}?sheet=pages`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    });

    return response.json();
};

/**
 * 5. LOG (POST): Analytics Signals
 * UPDATED: Supports Batching (Array of Signals)
 */
export const logAnalyticsSignal = async (signalOrBatch: Record<string, any> | Record<string, any>[]) => {
    if (ENABLE_MOCK_FALLBACK) {
        return;
    }

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
    throttledFetch(`${BASE_URL}?sheet=signals`, {
        method: 'POST',
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ data: items }) 
    }).catch(err => console.error("[CMS Signals] Failed to log signal batch", err));
};


// --- INTERNAL PARSERS & MOCK DATA ---

const getMockData = (): ApiResponse => {
  return {
    global: {
      companyName: "Gen Roof Tiling",
      phone: "1300 ROOF GEN",
      email: "quotes@genroofing.com.au",
      navigation: [
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Service Areas", href: "/areas/bondi" },
      ],
    },
    pages: {} 
  };
};

// Helper for granular mock fetch
const getMockPage = (slug: string): PageConfig | null => {
    const fullMock = {
      // THE CHAMPION SEED (Row 2 in Sheets)
      '/': {
        slug: '/',
        metaTitle: "Gen Roof Tiling - AI Optimized Restoration",
        metaDescription: "Experience the future of roofing. AI leak detection and premium restoration services.",
        themeOverrides: { primaryColor: '221.2 83.2% 53.3%' },
        layout: ['hero_main', 'stats_bar', 'features_grid', 'reviews_marquee', 'cta_footer'],
        components: {
          'hero_main': {
            id: 'hero_main',
            type: 'hero_magic',
            props: {
              headline: "Roofing. Evolved.",
              subheadline: "We use thermal imaging drones and AI analysis to guarantee a leak-free home for 10 years.",
              ctaText: "Get AI Assessment"
            }
          },
          'stats_bar': {
            id: 'stats_bar',
            type: 'stats_bar',
            props: {
              stats: [
                { label: "Leaks Fixed", value: "12,000+" },
                { label: "Avg Response", value: "55 min" },
                { label: "Warranty", value: "10 Years" }
              ]
            }
          },
          'features_grid': {
            id: 'features_grid',
            type: 'bento_grid',
            props: {
              title: "Why Choose Gen?",
              items: [
                { title: "Precision Reports", description: "You get a digital twin of your roof.", colSpan: 2 },
                { title: "Transparent Pricing", description: "AI calculated materials. No waste.", colSpan: 1 },
                { title: "Licensed Pros", description: "Master builders only.", colSpan: 1 }
              ]
            }
          },
          'reviews_marquee': {
            id: 'reviews_marquee',
            type: 'trust_marquee',
            props: {
              reviews: [
                { name: "Sarah J.", text: "They found a leak 3 other plumbers missed.", rating: 5 },
                { name: "Mike D.", text: "The digital report was insane. Great work.", rating: 5 },
                { name: "Estate Co.", text: "Our go-to for strata repairs.", rating: 5 }
              ]
            }
          },
          'cta_footer': {
            id: 'cta_footer',
            type: 'lead_form_split',
            props: {
              title: "Future-proof your home.",
              subtitle: "Join the waitlist for our next availability window."
            }
          }
        }
      },
      // CHALLENGER VARIANT
      '/_B': {
          slug: '/_B',
          metaTitle: "Gen Roof - Fast Quotes",
          metaDescription: "Variant B Testing",
          layout: ['hero_simple', 'cta_simple'],
          components: {
              'hero_simple': {
                  id: 'hero_simple', type: 'hero_v2',
                  props: { 
                      headline: "We Fix Roofs.", 
                      subheadline: "No nonsense. Just fixed.", 
                      ctaText: "Call Now", 
                      imageUrl: "https://images.unsplash.com/photo-1632759995252-8d769e46927d" 
                  }
              },
              'cta_simple': {
                  id: 'cta_simple', type: 'lead_form_simple', props: { title: "Get a callback" }
              }
          }
      },
      '/areas/bondi': {
        slug: '/areas/bondi',
        metaTitle: "Bondi Roofers",
        metaDescription: "Local.",
        layout: ['local_hero', 'local_map', 'lead_cta_local'],
        components: {
            'local_hero': {
                id: 'local_hero', type: 'hero_v1',
                props: { headline: "Bondi Roofers", subheadline: "Your local specialists in Bondi Beach.", ctaText: "Call Now", imageUrl: "https://images.unsplash.com/photo-1596520371804-b9718423f03a?q=80&w=2670&auto=format&fit=crop" }
            },
            'local_map': {
                id: 'local_map', type: 'local_map',
                props: { areaName: "Bondi", serviceRadius: "5km" }
            },
            'lead_cta_local': {
                id: 'lead_cta_local', type: 'lead_form_simple',
                props: { title: "Get a Quick Quote" }
            }
        }
      }
    };
    return (fullMock as any)[slug] || null;
}
