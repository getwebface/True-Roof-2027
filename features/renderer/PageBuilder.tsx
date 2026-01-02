import React from 'react';
import { PageConfig } from '../../types';
import { getComponent } from './componentRegistry';

interface PageBuilderProps {
  config: PageConfig;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({ config }) => {
  if (!config || !config.layout) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-2">
                <p className="text-lg font-medium text-slate-900">Content Loading...</p>
                <p className="text-sm text-slate-500">Waiting for Genkit payload.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {config.layout.map((componentId) => {
        const data = config.components[componentId];
        
        // Error Boundary for missing component definitions
        if (!data) {
            console.warn(`[PageBuilder] Layout requests '${componentId}' but no data found in components map.`);
            return null;
        }

        const Component = getComponent(data.type);

        if (!Component) {
            return (
                <div key={componentId} className="container mx-auto my-4 p-4 border border-red-200 bg-red-50 text-red-800 rounded-lg">
                    <p className="font-mono text-sm">
                        <strong>System Alert:</strong> Component type <span className="bg-red-200 px-1 rounded">'{data.type}'</span> is not registered in the ComponentRegistry.
                    </p>
                </div>
            );
        }

        return <Component key={componentId} {...(data.props as any)} />;
      })}
    </div>
  );
};