import React, { useState, useEffect } from 'react';
import { PageConfig } from '../../types';
import { genkit, OptimizationSuggestion } from '../../services/genkitService';
import { updatePageLayout } from '../../services/cmsService';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

interface GenkitOverlayProps {
    pageConfig: PageConfig | null;
}

export const GenkitOverlay: React.FC<GenkitOverlayProps> = ({ pageConfig }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [activeMutation, setActiveMutation] = useState<string | null>(null);

    useEffect(() => {
        if (pageConfig) {
            setIsScanning(true);
            setSuggestions([]); // Clear previous
            // Simulate AI processing time
            setTimeout(() => {
                const results = genkit.analyzePage(pageConfig);
                setSuggestions(results);
                setIsScanning(false);
            }, 1500);
        }
    }, [pageConfig]);

    const handleApplyMutation = async (suggestion: OptimizationSuggestion) => {
        if (!pageConfig) return;
        setActiveMutation(suggestion.id);
        
        try {
            // Note: In a real agent scenario, the agent would construct the full payload.
            // Here we are just triggering the signal to the CMS service.
            await updatePageLayout(
                pageConfig.slug, 
                suggestion.id,
                pageConfig.layout, // In reality, this would be the NEW layout
                pageConfig.components // In reality, this would contain the NEW component data
            );
            alert(`Mutation [${suggestion.id}] sent to Sheet2DB queue.`);
        } catch (e) {
            console.error(e);
            alert("Mutation failed.");
        } finally {
            setActiveMutation(null);
        }
    };

    if (!pageConfig) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] font-mono text-xs">
            {/* Minimized Pill */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-black/90 text-green-400 border border-green-900/50 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    <div className={cn("h-2 w-2 rounded-full bg-green-500", isScanning ? "animate-pulse" : "")}></div>
                    <span>Genkit Active</span>
                </button>
            )}

            {/* Expanded Interface */}
            {isOpen && (
                <div className="w-80 bg-black/95 text-slate-200 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-slate-900/50 p-3 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold text-green-400">GENKIT_CORE_V1</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                        
                        {/* Current Context */}
                        <div className="space-y-1">
                            <div className="uppercase text-[10px] text-slate-500 tracking-wider">Monitored Asset</div>
                            <div className="text-white font-bold truncate">{pageConfig.slug}</div>
                            <div className="text-[10px] text-slate-400">
                                Components: {pageConfig.layout.length} | Layout: {pageConfig.layout.join(', ')}
                            </div>
                        </div>

                        {/* Analysis Output */}
                        <div className="space-y-2">
                             <div className="uppercase text-[10px] text-slate-500 tracking-wider flex justify-between">
                                <span>Optimization Matrix</span>
                                {isScanning && <span>SCANNING...</span>}
                             </div>
                             
                             {!isScanning && suggestions.length === 0 && (
                                 <div className="p-3 bg-green-900/20 border border-green-900 rounded text-green-400 text-center">
                                     ✅ No structural anomalies detected.
                                 </div>
                             )}

                             {suggestions.map(s => (
                                 <div key={s.id} className="p-3 bg-slate-900 border border-slate-700 rounded space-y-2 group hover:border-blue-500 transition-colors">
                                     <div className="flex justify-between items-center">
                                         <span className="text-blue-400 font-bold">PROPOSAL</span>
                                         <span className="bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded text-[10px]">
                                             {(s.confidence * 100).toFixed(0)}% Conf
                                         </span>
                                     </div>
                                     <p className="text-slate-300 leading-tight">{s.reason}</p>
                                     <div className="pt-2 border-t border-slate-800 mt-2 space-y-2">
                                         <div className="text-[10px] text-slate-500 mb-1">ACTION:</div>
                                         <code className="text-orange-300 block bg-black/50 p-1 rounded mb-2">
                                             {s.suggestedAction}
                                         </code>
                                         <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="w-full h-7 text-xs border-green-800 text-green-400 hover:bg-green-900 hover:text-green-300"
                                            onClick={() => handleApplyMutation(s)}
                                            disabled={activeMutation === s.id}
                                         >
                                            {activeMutation === s.id ? 'Applying...' : 'Authorize Change'}
                                         </Button>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};