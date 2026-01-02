import React from 'react';
import { cn } from '../../../lib/utils';

interface ServiceItem {
  title: string;
  desc: string;
}

interface ServicesGridProps {
  title: string;
  items: ServiceItem[];
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ title, items }) => {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We provide top-tier solutions tailored to your specific needs.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col space-y-2">
                <h3 className="font-bold text-xl">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
