import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './features/layout/Layout';
import { PageBuilder } from './features/renderer/PageBuilder';
import { fetchCmsData, findMatchingPage } from './services/cmsService';
import { AnalyticsTracker } from './features/analytics/Analytics';
import { GenkitOverlay } from './features/admin/GenkitOverlay';
import { ApiResponse } from './types';

// Wrapper component to handle data fetching based on current path
const DynamicPage = ({ data }: { data: ApiResponse | null }) => {
  const location = useLocation();
  
  // Use fuzzy matching for routes (handles trailing slashes, etc.)
  const pageConfig = data?.pages ? findMatchingPage(data.pages, location.pathname) || data.pages['/'] : null;

  useEffect(() => {
    if (!data || !pageConfig) return;

    // Apply dynamic theme overrides in Effect, not Render
    if (pageConfig.themeOverrides?.primaryColor) {
      const root = document.documentElement;
      root.style.setProperty('--primary', pageConfig.themeOverrides.primaryColor);
      root.style.setProperty('--ring', pageConfig.themeOverrides.primaryColor);
    }

    // Set Metadata dynamically
    document.title = `${pageConfig.metaTitle} | ${data.global.companyName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', pageConfig.metaDescription);

  }, [data, pageConfig, location.pathname]);

  if (!data || !pageConfig) {
    return (
        <div className="h-[50vh] w-full flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground animate-pulse">Consulting the Oracle (Sheets)...</p>
        </div>
    );
  }

  return (
    <>
      <PageBuilder config={pageConfig} />
      {/* The AI Brain Overlay - Visible for Admin/Demo purposes */}
      <GenkitOverlay pageConfig={pageConfig} />
    </>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const cmsData = await fetchCmsData('init');
        setData(cmsData);
      } catch (e) {
        console.error("Failed to fetch CMS data", e);
      }
    };
    init();
  }, []);

  return (
    <HashRouter>
      <Layout config={data?.global}>
        <AnalyticsTracker />
        <Routes>
          <Route path="*" element={<DynamicPage data={data} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;