import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { submitLead } from '../../../services/cmsService';

interface LeadFormProps {
  title: string;
  subtitle?: string;
  type: 'lead_form_split' | 'lead_form_simple';
}

export const LeadForm: React.FC<LeadFormProps> = ({ title, subtitle, type }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        await submitLead({
            ...formData,
            source: type,
            url: window.location.href
        });
        alert("Thanks! We've received your details and will call shortly.");
        setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
        console.error("Submission failed", error);
        alert("Something went wrong. Please call us directly.");
    } finally {
        setLoading(false);
    }
  };

  if (type === 'lead_form_simple') {
      return (
        <section className="w-full py-12 bg-accent/20 border-t border-b">
            <div className="container px-4 md:px-6 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                 <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
                    <Input 
                        name="email" 
                        type="email" 
                        placeholder="Email Address" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Button type="submit" disabled={loading}>{loading ? '...' : 'Connect'}</Button>
                </form>
            </div>
        </section>
      )
  }

  // Split view (High conversion layout)
  return (
    <section className="w-full py-12 md:py-24 bg-slate-900 text-slate-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{title}</h2>
                <p className="text-slate-400 md:text-xl/relaxed">
                    {subtitle || "Join thousands of satisfied homeowners who trust us with their biggest asset."}
                </p>
                <ul className="grid gap-2 py-4">
                    <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" /> Free On-site Inspection
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" /> 10 Year Workmanship Guarantee
                    </li>
                </ul>
            </div>
            <div className="w-full max-w-sm space-y-2 mx-auto lg:mx-0 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-2xl">
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Name</label>
                        <Input 
                            name="name"
                            placeholder="John Doe" 
                            required 
                            className="bg-slate-900 border-slate-700 text-slate-50" 
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Phone</label>
                        <Input 
                            name="phone"
                            placeholder="0400 000 000" 
                            type="tel" 
                            required 
                            className="bg-slate-900 border-slate-700 text-slate-50" 
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Email</label>
                        <Input 
                            name="email"
                            placeholder="john@example.com" 
                            type="email" 
                            required 
                            className="bg-slate-900 border-slate-700 text-slate-50" 
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <Button type="submit" className="w-full" variant="default" disabled={loading}>
                        {loading ? 'Submitting...' : 'Get My Free Quote'}
                    </Button>
                    <p className="text-xs text-slate-500 text-center">
                        We respect your privacy. No spam.
                    </p>
                 </form>
            </div>
        </div>
      </div>
    </section>
  );
};