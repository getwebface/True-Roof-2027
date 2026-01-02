import React from 'react';
import { PageConfig } from '../../types';
import { Hero } from './components/Hero';
import { ServicesGrid } from './components/ServicesGrid';
import { LeadForm } from './components/LeadForm';
import { TrustMarquee } from './components/TrustMarquee';
import { FaqAccordion } from './components/FaqAccordion';
import { LocalMap } from './components/LocalMap';
import { Gallery } from './components/Gallery';
import { MagicHero } from './components/MagicHero';
import { BentoGridWrapper } from '../../components/magicui/BentoGrid';

interface PageBuilderProps {
  config: PageConfig;
}

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

export const PageBuilder: React.FC<PageBuilderProps> = ({ config }) => {
  if (!config || !config.layout) {
    return <div className="p-10 text-center">Page configuration missing...</div>;
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {config.layout.map((componentId) => {
        const data = config.components[componentId];
        if (!data) return null;

        switch (data.type) {
          case 'hero_v1':
          case 'hero_v2':
            return <Hero key={componentId} variant={data.type as any} {...(data.props as any)} />;
          
          case 'hero_magic':
            return <MagicHero key={componentId} {...(data.props as any)} />;

          case 'services_grid':
            return <ServicesGrid key={componentId} {...(data.props as any)} />;
          
          case 'bento_grid':
             return <BentoGridWrapper key={componentId} {...(data.props as any)} />;

          case 'lead_form_split':
          case 'lead_form_simple':
            return <LeadForm key={componentId} type={data.type as any} {...(data.props as any)} />;
          
          case 'trust_marquee':
            return <TrustMarquee key={componentId} {...(data.props as any)} />;

          case 'rich_text':
             return <RichText key={componentId} {...(data.props as any)} />;

          case 'stats_bar':
              return <StatsBar key={componentId} {...(data.props as any)} />;
          
          case 'faq_section':
              return <FaqAccordion key={componentId} {...(data.props as any)} />;
          
          case 'local_map':
              return <LocalMap key={componentId} {...(data.props as any)} />;
          
          case 'gallery_grid':
              return <Gallery key={componentId} {...(data.props as any)} />;

          default:
            return <div key={componentId} className="p-4 bg-red-100 text-red-800">Unknown Component: {data.type}</div>;
        }
      })}
    </div>
  );
};