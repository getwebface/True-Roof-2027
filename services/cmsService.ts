import { ApiResponse, PageConfig, GlobalConfig, ComponentData } from '../types';

const API_ID = "e9028d49-1711-4b29-90d2-5de17bbf21b9";
const BASE_URL = `https://api.sheet2db.com/v1/${API_ID}`;

const safeJsonParse = <T>(input: any, fallback: T): T => {
  if (typeof input === 'object' && input !== null) return input;
  if (typeof input !== 'string') return fallback;
  try {
    const sanitized = input
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");
    return JSON.parse(sanitized);
  } catch (e) {
    console.warn("JSON Parse Error for input:", input, e);
    return fallback;
  }
};

/**
 * MOCK DATA GENERATOR
 * Now updated to feature Magic UI components in the Challenger Variant
 */
const getMockData = (): ApiResponse => {
  const isChallenger = true; // For demo purposes, we default to the "Magic" Challenger version
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
        // NOTE: The Layout now uses 'hero_magic' and 'bento_showcase'
        layout: ['hero_section', 'trust_indicators', 'bento_showcase', 'lead_cta'],
        components: {
          'hero_section': {
            id: 'hero_section',
            type: 'hero_magic', // Using Magic UI component
            props: {
              headline: "The Future of Roof Protection",
              subheadline: "Experience the next generation of weatherproofing. AI-driven assessments, superior materials, and lifetime guarantees.",
              ctaText: "Start Transformation",
              imageUrl: "", // Handled by Meteors
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
      
      // Standard Service Page
      '/services/roof-restoration': {
        slug: '/services/roof-restoration',
        metaTitle: "Roof Restoration",
        metaDescription: "Complete roof restoration.",
        layout: ['service_hero', 'gallery_section', 'faq_section'],
        components: {
            'service_hero': {
                id: 'service_hero', type: 'hero_v2',
                props: { headline: "Roof Restoration", subheadline: "Restore vs Replace", ctaText: "Quote", imageUrl: "https://picsum.photos/1200/601" }
            },
            'gallery_section': {
                id: 'gallery_section', type: 'gallery_grid',
                props: { title: "Our Work", images: [{url: "https://picsum.photos/400/400", alt:"1"}, {url: "https://picsum.photos/400/401", alt:"2"}]}
            },
            'faq_section': {
                id: 'faq_section', type: 'faq_section',
                props: { title: "FAQs", items: [{question: "Cost?", answer: "Varies."}]}
            }
        }
      },

      // Standard Local Page
      '/areas/bondi': {
        slug: '/areas/bondi',
        metaTitle: "Bondi Roofers",
        metaDescription: "Local.",
        layout: ['local_hero', 'local_map'],
        components: {
            'local_hero': {
                id: 'local_hero', type: 'hero_v1',
                props: { headline: "Bondi Roofers", subheadline: "Local team.", ctaText: "Call", imageUrl: "https://picsum.photos/1200/500" }
            },
            'local_map': {
                id: 'local_map', type: 'local_map',
                props: { areaName: "Bondi", serviceRadius: "5km" }
            }
        }
      }
    }
  };
};

export const fetchCmsData = async (trigger: string): Promise<ApiResponse> => {
  console.log(`[CMS] Fetching data triggered by: ${trigger}`);

  try {
    const globalReq = await fetch(`${BASE_URL}?sheet=global`);
    const pagesReq = await fetch(`${BASE_URL}?sheet=pages`);

    if (!globalReq.ok || !pagesReq.ok) {
      throw new Error(`API Error: ${globalReq.status}`);
    }

    const globalRaw = await globalReq.json();
    const pagesRaw = await pagesReq.json();

    const globalConfig: GlobalConfig = {
      companyName: "Gen Roof Tiling",
      phone: "",
      email: "",
      navigation: [],
    };

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

    if (Object.keys(pages).length === 0) throw new Error("Empty pages sheet");

    return { global: globalConfig, pages: pages };

  } catch (error) {
    console.warn(`[CMS] Falling back to internal templates.`, error);
    return getMockData();
  }
};