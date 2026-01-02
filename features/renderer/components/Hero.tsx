import React from 'react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  imageUrl: string;
  variant?: 'hero_v1' | 'hero_v2';
}

export const Hero: React.FC<HeroProps> = ({ headline, subheadline, ctaText, imageUrl, variant = 'hero_v1' }) => {
  if (variant === 'hero_v2') {
    // Centered, modern SaaS vibe but for roofing
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img src={imageUrl} alt="Hero" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
              {headline}
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
              {subheadline}
            </p>
          </div>
          <div className="space-x-4 mt-8">
            <Button variant="shimmer" size="lg" className="rounded-full">
              {ctaText}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // V1: Classic Split
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                {headline}
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                {subheadline}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg">{ctaText}</Button>
              <Button variant="outline" size="lg">Learn More</Button>
            </div>
          </div>
          <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
             <img src={imageUrl} alt="Hero" className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
          </div>
        </div>
      </div>
    </section>
  );
};
