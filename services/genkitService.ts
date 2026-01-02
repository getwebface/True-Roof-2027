import { PageConfig } from '../types';
import { logAnalyticsSignal } from './cmsService';

/**
 * GENKIT SERVICE
 * 
 * The "Brain" of the operation. 
 * UPDATED: Implements Batching to reduce API calls to Sheet2DB.
 */

export interface GenkitSignal {
    type: 'view' | 'scroll' | 'click' | 'conversion';
    path: string;
    componentId?: string;
    timestamp: number;
    metadata?: any;
}

export interface OptimizationSuggestion {
    id: string;
    reason: string;
    suggestedAction: string;
    confidence: number;
}

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000; // 30 Seconds

class GenkitAgent {
    private queue: GenkitSignal[] = [];
    // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to be environment agnostic
    private flushTimer: ReturnType<typeof setTimeout> | null = null;
    private debugMode: boolean = true;
    
    // In-memory simulation of conversion stats
    private stats = {
        views: 0,
        conversions: 0
    };

    constructor() {
        // Ensure data is flushed before the user leaves
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.syncToHive(true);
            });
        }
    }

    log(signal: GenkitSignal) {
        this.queue.push(signal);
        
        // Update local stats for "Brain" simulation
        if (signal.type === 'view') this.stats.views++;
        if (signal.type === 'conversion') this.stats.conversions++;

        if (this.debugMode) {
            console.log(`[Genkit] 🧠 Queued Signal: ${signal.type} (Queue: ${this.queue.length}/${BATCH_SIZE})`);
        }

        // Strategy: Flush if bucket full OR start timer if not running
        if (this.queue.length >= BATCH_SIZE) {
            this.syncToHive();
        } else if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => this.syncToHive(), FLUSH_INTERVAL_MS);
        }
    }

    /**
     * Determines if the current page is underperforming
     */
    evaluatePerformance(): { status: 'healthy' | 'critical', conversionRate: string } {
        const rate = this.stats.views > 0 ? (this.stats.conversions / this.stats.views) * 100 : 0;
        return {
            status: rate < 2 && this.stats.views > 5 ? 'critical' : 'healthy',
            conversionRate: rate.toFixed(2) + '%'
        };
    }

    /**
     * Heuristics Analysis
     */
    analyzePage(config: PageConfig): OptimizationSuggestion[] {
        const suggestions: OptimizationSuggestion[] = [];
        const performance = this.evaluatePerformance();

        // 1. Critical Performance Intervention
        if (performance.status === 'critical') {
            suggestions.push({
                id: 'opt_emergency_cro',
                reason: `Conversion Rate (${performance.conversionRate}) is below threshold.`,
                suggestedAction: 'Switch Layout to "Lead Capture Focused" (lead_form_split above fold).',
                confidence: 0.99
            });
        }

        // 2. Heuristic: Boring Hero
        const heroComponent = Object.values(config.components).find(c => c.type.startsWith('hero'));
        if (heroComponent && heroComponent.type === 'hero_v1') {
            suggestions.push({
                id: 'opt_hero_upgrade',
                reason: 'Standard Hero detected. Upgrade to "hero_magic" for higher engagement.',
                suggestedAction: 'Apply "hero_magic" with Meteor effect.',
                confidence: 0.89
            });
        }

        // 3. Heuristic: Social Proof
        const hasTrust = config.layout.includes('trust_indicators') || config.layout.includes('reviews_local');
        if (!hasTrust) {
            suggestions.push({
                id: 'opt_add_trust',
                reason: 'Page lacks social proof above the fold.',
                suggestedAction: 'Inject "trust_marquee" component.',
                confidence: 0.95
            });
        }

        return suggestions;
    }

    /**
     * Flushes queue to the Google Sheet via CMS Service
     */
    async syncToHive(force: boolean = false) {
        if (this.queue.length === 0) return;
        
        // Clear timer if it exists
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        const signalsToSend = [...this.queue];
        this.queue = []; // Clear local queue immediately

        if (this.debugMode) {
            console.log(`[Genkit] 📡 Flushing ${signalsToSend.length} signals to Hive...`);
        }

        try {
            // Send batch
            // @ts-ignore
            await logAnalyticsSignal(signalsToSend);
        } catch (e) {
            console.error("[Genkit] Failed to sync signals", e);
            // Optional: Re-queue failed signals if critical
        }
    }
}

export const genkit = new GenkitAgent();