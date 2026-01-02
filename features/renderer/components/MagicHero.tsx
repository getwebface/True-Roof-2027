import React from 'react';
import { Meteors } from '../../../components/magicui/Meteors';
import { Button } from '../../../components/ui/Button';

interface MagicHeroProps {
    headline: string;
    subheadline: string;
    ctaText: string;
}

export const MagicHero: React.FC<MagicHeroProps> = ({ headline, subheadline, ctaText }) => {
  return (
    <div className="relative w-full h-[600px] flex flex-col items-center justify-center overflow-hidden rounded-md bg-slate-950 px-4 md:px-8">
      <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl opacity-20" />
      
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center justify-center px-4 py-1 transition-all border rounded-full ease-in-out hover:cursor-pointer hover:bg-neutral-800 border-white/5 bg-neutral-900 text-neutral-300 mb-4">
            <span className="text-xs">✨ AI Optimized Layout</span>
        </div>

        <h1 className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-5xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10 md:text-7xl">
          {headline}
        </h1>
        
        <p className="max-w-[600px] text-slate-400 md:text-xl">
            {subheadline}
        </p>

        <div className="mt-8">
            <Button variant="shimmer" size="lg" className="rounded-full px-8 py-6 text-lg">
                {ctaText}
            </Button>
        </div>
      </div>

      <Meteors number={30} />
    </div>
  );
};