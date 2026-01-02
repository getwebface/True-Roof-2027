import { ApiResponse, PageConfig, GlobalConfig, ComponentData } from '../types';

// CONFIGURATION
const API_ID = "58f61208-c44d-4448-9124-748455644846"; // Public Demo ID or Environment Variable
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

export const findMatchingPage = (pages: Record<string, PageConfig>, currentPath: string): PageConfig | null => {
    if (!pages) return null;
    // 1. Exact Match
    if (pages[currentPath]) return pages[currentPath];
    // 2. Trailing Slash Normalized
    const normalized = currentPath.endsWith('/') && currentPath.length > 1 
        ? currentPath.slice(0, -1) 
        : currentPath;
    if (pages[normalized]) return pages[normalized];
    return null;
};

const safeJsonParse = <T>(input: any, fallback: T): T => {
  if (typeof input === 'object' && input !== null) return input;
  if (typeof input !== 'string') return fallback;
  try {
    // Handle Google Sheets "Smart Quotes" and potential JSON string issues
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
 * 1. READ (GET): Fetches Global and Pages
 * Uses Sheet2DB 'GET /' to read specific sheets
 */
export const fetchCmsData = async (trigger: string): Promise<ApiResponse> => {
  console.log(`[CMS] 📡 Syncing Data (Trigger: ${trigger})`);

  try {
    // Parallel fetch for performance
    const [globalRes, pagesRes] = await Promise.all([
      throttledFetch(`${BASE_URL}?sheet=global`),
      throttledFetch(`${BASE_URL}?sheet=pages`)
    ]);

    if (!globalRes.ok || !pagesRes.ok) throw new Error(`API Error: ${globalRes.status}`);

    const globalRaw = await globalRes.json();
    const pagesRaw = await pagesRes.json();

    return parseRawResponse(globalRaw, pagesRaw);

  } catch (error) {
    if (ENABLE_MOCK_FALLBACK) {
      console.warn(`[CMS] ⚠️ API Unreachable. Using internal Mock Data.`);
      return getMockData();
    }
    throw error;
  }
};

/**
 * 2. CREATE (POST): Lead Capture
 * Uses Sheet2DB 'POST /' with 'sheet=leads'
 */
export const submitLead = async (formData: Record<string, any>) => {
  console.log(`[CMS] 📨 Submitting Lead...`, formData);
  
  if (ENABLE_MOCK_FALLBACK) {
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }

  const response = await throttledFetch(`${BASE_URL}?sheet=leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      created_at: new Date().toISOString(),
      ...formData
    })
  });

  return response.json();
};

/**
 * 3. UPDATE (PATCH): Genkit Mutation Service
 * Uses Sheet2DB 'PATCH /{column}/{value}' to update specific rows
 */
export const updatePageLayout = async (slug: string, mutationType: string, newLayout: string[], newComponents: Record<string, ComponentData>) => {
    console.log(`[CMS Mutation] 🧬 Applying Genkit Mutation: ${mutationType} on ${slug}`);
    
    // Payload adhering to First Row Reference (Layout and Components columns)
    const payload = {
        layout: JSON.stringify(newLayout),
        components: JSON.stringify(newComponents),
        last_updated: new Date().toISOString(),
        last_mutation: mutationType
    };

    if (ENABLE_MOCK_FALLBACK) {
        console.log(`[CMS Mutation] (Simulated Payload)`, payload);
        return { success: true, message: "Simulation: Sheet updated." };
    }

    // Sheet2DB Pattern: PATCH /slug/homepage?sheet=pages
    // This finds the row where column 'slug' === slug and updates it
    const response = await throttledFetch(`${BASE_URL}/slug/${encodeURIComponent(slug)}?sheet=pages`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    });

    return response.json();
};


// --- INTERNAL PARSERS & MOCK DATA ---

const parseRawResponse = (globalRaw: any[], pagesRaw: any[]): ApiResponse => {
    const globalConfig: GlobalConfig = {
      companyName: "Gen Roof Tiling",
      phone: "",
      email: "",
      navigation: [],
    };

    // Map Global Sheet
    if (Array.isArray(globalRaw)) {
      globalRaw.forEach((row: any) => {
        if (row.key === 'navigation') {
          globalConfig.navigation = safeJsonParse(row.value, []);
        } else if (row.key && row.value) {
          // @ts-ignore
          globalConfig[row.key as keyof GlobalConfig] = row.value;
        }
      });
    }

    const pages: Record<string, PageConfig> = {};

    // Map Pages Sheet
    if (Array.isArray(pagesRaw)) {
      pagesRaw.forEach((row: any) => {
        if (!row.slug) return;
        pages[row.slug] = {
          slug: row.slug,
          metaTitle: row.meta_title || "Gen Roof Tiling",
          metaDescription: row.meta_description || "",
          layout: safeJsonParse<string[]>(row.layout, []),
          components: safeJsonParse<Record<string, ComponentData>>(row.components, {}),
          themeOverrides: safeJsonParse(row.theme_overrides, {})
        };
      });
    }
    return { global: globalConfig, pages };
};

const getMockData = (): ApiResponse => {
  // Simulating the "Challenger" (Magic UI) version
  const isChallenger = true; 
  const primaryColor = isChallenger ? '262.1 83.3% 57.8%' : '221.2 83.2% 53.3%';

  return {
    global: {
      companyName: "Gen Roof Tiling",
      phone: "1300 ROOF GEN",
      email: "quotes@genroofing.com.au",
      navigation: [
        { label: "Home", href: "/" },
        { label: "Restorations", href: "/services/roof-restoration" },
        { label: "Bondi Area", href: "/areas/bondi" },
      ],
    },
    pages: {
      '/': {
        slug: '/',
        metaTitle: "Expert Roof Tilers",
        metaDescription: "Professional roof tiling services.",
        themeOverrides: { primaryColor },
        layout: ['hero_section', 'trust_indicators', 'bento_showcase', 'lead_cta'],
        components: {
          'hero_section': {
            id: 'hero_section',
            type: 'hero_magic',
            props: {
              headline: "The Future of Roof Protection",
              subheadline: "Experience the next generation of weatherproofing. AI-driven assessments, superior materials, and lifetime guarantees.",
              ctaText: "Start Transformation",
              imageUrl: "", 
            }
          },
          'trust_indicators': {
            id: 'trust_indicators',
            type: 'trust_marquee',
            props: {
              reviews: [
                { name: "John D.", text: "Best in the business.", rating: 5 },
                { name: "Sarah M.", text: "Fixed my leak instantly.", rating: 5 },
                { name: "Mike T.", text: "Professional and clean.", rating: 5 },
                { name: "Building Co.", text: "Our go-to tilers.", rating: 5 },
              ]
            }
          },
          'bento_showcase': {
            id: 'bento_showcase',
            type: 'bento_grid',
            props: {
              title: "Why We Are Different",
              items: [
                { title: "Smart Leak Detection", description: "We use thermal imaging to find leaks others miss.", colSpan: 2 },
                { title: "Rapid Response", description: "On-site within 60 minutes for emergencies.", colSpan: 1 },
                { title: "10 Year Warranty", description: "Every job is backed by a decade of security.", colSpan: 1 },
                { title: "Licensed & Insured", description: "Fully qualified Master Roof Tilers.", colSpan: 2 },
              ]
            }
          },
          'lead_cta': {
            id: 'lead_cta',
            type: 'lead_form_split',
            props: { title: "Ready to upgrade?", subtitle: "Enter your details for an instant callback." }
          }
        }
      },
      '/services/roof-restoration': {
        slug: '/services/roof-restoration',
        metaTitle: "Roof Restoration",
        metaDescription: "Complete roof restoration.",
        layout: ['service_hero', 'gallery_section', 'faq_section'],
        components: {
            'service_hero': {
                id: 'service_hero', type: 'hero_v2',
                props: { headline: "Roof Restoration", subheadline: "Restore vs Replace", ctaText: "Quote", imageUrl: "https://images.unsplash.com/photo-1632759995252-8d769e46927d?q=80&w=2670&auto=format&fit=crop" }
            },
            'gallery_section': {
                id: 'gallery_section', type: 'gallery_grid',
                props: { title: "Our Work", images: [{url: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?q=80&w=800&auto=format&fit=crop", alt:"1"}, {url: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?q=80&w=800&auto=format&fit=crop", alt:"2"}]}
            },
            'faq_section': {
                id: 'faq_section', type: 'faq_section',
                props: { title: "FAQs", items: [{question: "What is the cost?", answer: "Prices start from $2500 depending on roof size."}]}
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
    }
  };
};