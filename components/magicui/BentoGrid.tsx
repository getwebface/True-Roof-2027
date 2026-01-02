import React from 'react';
import { cn } from "../../lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        className
      )}
    >
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
          {header}
      </div>
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="text-slate-600 dark:text-slate-200 mb-2 mt-2">
          {icon}
        </div>
        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};

// Wrapper Component for CMS
interface BentoProps {
    title: string;
    items: Array<{
        title: string;
        description: string;
        colSpan?: number;
    }>;
}

export const BentoGridWrapper: React.FC<BentoProps> = ({ title, items }) => {
    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
            <div className="container px-4">
                <h2 className="text-3xl font-bold tracking-tighter mb-10 text-center">{title}</h2>
                <BentoGrid>
                    {items.map((item, i) => (
                        <BentoGridItem
                            key={i}
                            title={item.title}
                            description={item.description}
                            className={item.colSpan === 2 ? "md:col-span-2" : ""}
                            header={<div className="w-full h-full flex items-center justify-center text-4xl text-slate-300 font-bold">{i + 1}</div>}
                            icon={
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="h-4 w-4 text-neutral-500"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            }
                        />
                    ))}
                </BentoGrid>
            </div>
        </section>
    )
}