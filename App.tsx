import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './features/layout/Layout';
import { PageBuilder } from './features/renderer/PageBuilder';
import { fetchGlobalConfig, fetchPageBySlug } from './services/cmsService';
import { AnalyticsTracker } from './features/analytics/Analytics';
import { GenkitOverlay } from './features/admin/GenkitOverlay';
import { GlobalConfig, PageConfig } from './types';

// Dynamic Page Loader
const DynamicPage = () => {
  const location = useLocation();
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract Variant from URL (e.g. ?variant=B)
  const searchParams = new URLSearchParams(location.search);
  const variantId = searchParams.get('variant');

  useEffect(() => {
    const loadPage = async () => {
        setLoading(true);
        setPageConfig(null);

        // Determine target slug
        let targetSlug = location.pathname;
        if (targetSlug !== '/' && targetSlug.endsWith('/')) {
             targetSlug = targetSlug.slice(0, -1);
        }

        // Logic to support A/B testing URL modification
        if (variantId) {
             // If variant exists, we might look for a specific variant page in the DB (e.g. /_B)
             // or the AI logic handles it. For now, we append if it's root
             if (targetSlug === '/') targetSlug = `/_${variantId}`;
             else targetSlug = `${targetSlug}_${variantId}`;
        }

        const data = await fetchPageBySlug(targetSlug);
        
        // Handle Root Fallback if variant not found
        if (!data && variantId) {
             // Fallback to original slug if variant specific page doesn't exist
             const originalSlug = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '');
             const fallbackData = await fetchPageBySlug(originalSlug);
             setPageConfig(fallbackData);
        } else {
             setPageConfig(data);
        }
        
        setLoading(false);
    };

    loadPage();
  }, [location.pathname, variantId]);

  useEffect(() => {
    if (!pageConfig) return;

    // Apply dynamic theme overrides
    if (pageConfig.themeOverrides?.primaryColor) {
      const root = document.documentElement;
      root.style.setProperty('--primary', pageConfig.themeOverrides.primaryColor);
      root.style.setProperty('--ring', pageConfig.themeOverrides.primaryColor);
    }

    // Set Metadata
    document.title = pageConfig.metaTitle || "Gen Roof Tiling";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', pageConfig.metaDescription);
  }, [pageConfig]);

  if (loading) {
    return (
        <div className="h-[50vh] w-full flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground animate-pulse text-sm">Fetching content from Sheets...</p>
        </div>
    );
  }

  if (!pageConfig) {
      return (
          <div className="min-h-[50vh] flex items-center justify-center flex-col">
              <h1 className="text-4xl font-bold mb-2">404</h1>
              <p className="text-muted-foreground">The AI hasn't built this page yet.</p>
          </div>
      )
  }

  return (
    <>
      <PageBuilder config={pageConfig} />
      <GenkitOverlay pageConfig={pageConfig} />
    </>
  );
};

const App: React.FC = () => {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);

  // Load Global Config ONCE
  useEffect(() => {
    const init = async () => {
      try {
        const config = await fetchGlobalConfig();
        setGlobalConfig(config);
      } catch (e) {
        console.error("Failed to fetch Global Config", e);
      }
    };
    init();
  }, []);

  return (
    <HashRouter>
      <Layout config={globalConfig || undefined}>
        <AnalyticsTracker />
        <Routes>
          <Route path="*" element={<DynamicPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;