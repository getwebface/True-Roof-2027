import React from 'react';
import { Button } from '../../../components/ui/Button';

interface LocalMapProps {
  areaName: string;
  mapUrl?: string; // Optional real embed URL
  serviceRadius: string;
}

export const LocalMap: React.FC<LocalMapProps> = ({ areaName, serviceRadius }) => {
  return (
    <section className="w-full py-12 bg-slate-50 border-y">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
              Now Serving {areaName}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Local Roofers in {areaName}
            </h2>
            <p className="text-slate-500 md:text-xl">
              We have a dedicated team stationed within {serviceRadius} of {areaName} ensuring rapid response times for emergency repairs and quotes.
            </p>
            <div className="flex gap-4 pt-4">
                <div className="flex flex-col">
                    <span className="font-bold text-2xl">15min</span>
                    <span className="text-xs text-muted-foreground">Avg Response</span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="flex flex-col">
                    <span className="font-bold text-2xl">24/7</span>
                    <span className="text-xs text-muted-foreground">Emergency Support</span>
                </div>
            </div>
          </div>
          
          <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-slate-200 shadow-inner flex items-center justify-center">
             {/* Simulating a Map View */}
             <div className="absolute inset-0 opacity-20" style={{
                 backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)",
                 backgroundSize: "30px 30px"
             }}></div>
             <div className="z-10 text-center">
                 <div className="text-4xl mb-2">📍</div>
                 <div className="font-bold text-slate-600">{areaName} Service Area</div>
                 <Button variant="link" className="mt-2 text-primary">View Coverage Map</Button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};