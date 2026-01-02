import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { genkit } from '../../services/genkitService';

/**
 * Analytics & Evolution Tracker
 * 
 * This component listens to route changes and reports engagement signals.
 * In the future, this is where Genkit would receive data about which "Variant" (A or B)
 * resulted in better time-on-page or conversion.
 */
export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Log Page View
    genkit.log({
        type: 'view',
        path: location.pathname,
        timestamp: Date.now()
    });
    
    // 2. Identify active variant (simulated reading from DOM or Global State)
    // This allows us to track if "Hero V2" is performing better than "Hero V1"
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    // console.log(`[GenAnalytics] Active Theme Variant: ${primaryColor.trim()}`);

    // Simulate a user scrolling after 3 seconds
    const scrollTimer = setTimeout(() => {
        genkit.log({
            type: 'scroll',
            path: location.pathname,
            timestamp: Date.now(),
            metadata: { depth: '50%' }
        });
    }, 3000);

    return () => clearTimeout(scrollTimer);

  }, [location]);

  return null; // Headless component
};