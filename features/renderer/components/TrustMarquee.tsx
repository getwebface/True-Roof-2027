import React from 'react';
import { cn } from '../../../lib/utils';

interface Review {
  name: string;
  text: string;
  rating: number;
}

interface TrustMarqueeProps {
  reviews: Review[];
}

export const TrustMarquee: React.FC<TrustMarqueeProps> = ({ reviews }) => {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background py-10 md:py-20">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background dark:from-background"></div>
      
      <div className="flex w-full overflow-hidden [--gap:2rem] [--duration:40s]">
        <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-[--gap]">
          {[...reviews, ...reviews, ...reviews].map((review, i) => (
            <div key={i} className="relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 hover:bg-accent/50 transition-colors">
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-col">
                  <figcaption className="text-sm font-medium dark:text-white">
                    {review.name}
                  </figcaption>
                  <p className="text-xs font-medium dark:text-white/40">Verified Customer</p>
                </div>
              </div>
              <blockquote className="mt-2 text-sm italic">"{review.text}"</blockquote>
              <div className="mt-2 flex text-yellow-500 text-xs">
                {"★".repeat(review.rating)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
