import React, { useState } from 'react';
import { cn } from '../../../lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  title: string;
  items: FaqItem[];
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ title, items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">{title}</h2>
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="border rounded-lg px-4 py-2 bg-card hover:bg-accent/10 transition-colors cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center py-2">
                <h3 className="text-lg font-medium">{item.question}</h3>
                <span className={cn("transition-transform duration-200 text-muted-foreground", openIndex === index ? "rotate-180" : "")}>
                  ▼
                </span>
              </div>
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};