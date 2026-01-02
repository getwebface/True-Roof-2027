import React from 'react';
import { Hero } from './components/Hero';
import { MagicHero } from './components/MagicHero';
import { ServicesGrid } from './components/ServicesGrid';
import { LeadForm } from './components/LeadForm';
import { TrustMarquee } from './components/TrustMarquee';
import { FaqAccordion } from './components/FaqAccordion';
import { LocalMap } from './components/LocalMap';
import { Gallery } from './components/Gallery';
import { BentoGridWrapper } from '../../components/magicui/BentoGrid';
import { ComponentType } from '../../types';

// Helper components for simple types
const RichText: React.FC<{ content: string }> = ({ content }) => (
    <div className="container px-4 py-12 prose prose-slate max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
);

const StatsBar: React.FC<{ stats: Array<{ label: string, value: string }> }> = ({ stats }) => (
    <div className="w-full bg-primary py-8 text-primary-foreground">
        <div className="container flex justify-around flex-wrap gap-4">
            {stats.map((s, i) => (
                <div key={i} className="text-center">
                    <div className="text-3xl font-bold">{s.value}</div>
                    <div className="text-sm opacity-80 uppercase tracking-widest">{s.label}</div>
                </div>
            ))}
        </div>
    </div>
);

// The Registry Map
// This tells the PageBuilder: "When you see string 'X', render Component 'Y'"
export const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
    // Hero Variants
    'hero_v1': (props) => <Hero variant="hero_v1" {...props} />,
    'hero_v2': (props) => <Hero variant="hero_v2" {...props} />,
    'hero_magic': MagicHero,

    // Functional / Shadcn
    'services_grid': ServicesGrid,
    'lead_form_split': (props) => <LeadForm type="lead_form_split" {...props} />,
    'lead_form_simple': (props) => <LeadForm type="lead_form_simple" {...props} />,
    'faq_section': FaqAccordion,
    'local_map': LocalMap,
    'gallery_grid': Gallery,
    'rich_text': RichText,
    'stats_bar': StatsBar,

    // Magic UI
    'trust_marquee': TrustMarquee,
    'bento_grid': BentoGridWrapper,
};

// Helper to check if a component exists
export const getComponent = (type: string) => {
    return COMPONENT_REGISTRY[type] || null;
};
