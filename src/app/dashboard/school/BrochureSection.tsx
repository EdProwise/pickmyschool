'use client';

import { useState } from 'react';
import { FileDown, Sparkles, RefreshCw, ExternalLink, BookOpen, CheckCircle2, Clock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface BrochureSectionProps {
  schoolName?: string;
  brochureUrl?: string | null;
  brochureVisible?: boolean;
  onBrochureGenerated?: (url: string) => void;
  onVisibilityChanged?: (visible: boolean) => void;
}

const SECTIONS_INCLUDED = [
  { icon: '📋', label: 'Basic Information', desc: 'School overview, stats, and highlights' },
  { icon: '📞', label: 'Contact Information', desc: 'Address, phone, email, social media' },
  { icon: '🏫', label: 'Facilities & Infrastructure', desc: 'Academic labs, sports, technology, transport' },
  { icon: '🏆', label: 'Academic Results', desc: 'Year-wise results, pass %, toppers' },
  { icon: '🎓', label: 'Notable Alumni', desc: 'Distinguished alumni with positions' },
  { icon: '📰', label: 'News & Updates', desc: 'Latest school news and announcements' },
];

export function BrochureSection({
  schoolName,
  brochureUrl,
  brochureVisible = true,
  onBrochureGenerated,
  onVisibilityChanged,
}: BrochureSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(brochureUrl || null);
  const [visible, setVisible] = useState<boolean>(brochureVisible);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const handleGenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Not authenticated'); return; }

    setGenerating(true);
    try {
      const res = await fetch('/api/schools/brochure/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate brochure');
      }

      const data = await res.json();
      setLocalUrl(data.url);
      onBrochureGenerated?.(data.url);
      toast.success(`Brochure generated! (${data.pages} pages)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate brochure');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleVisibility = async () => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Not authenticated'); return; }

    const newVisible = !visible;
    setTogglingVisibility(true);
    try {
      const res = await fetch('/api/schools/brochure/visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visible: newVisible }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update visibility');
      }

      setVisible(newVisible);
      onVisibilityChanged?.(newVisible);
      toast.success(newVisible ? 'Brochure is now visible to freelancers' : 'Brochure is now hidden from freelancers');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update visibility');
    } finally {
      setTogglingVisibility(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
          School Brochure
        </h2>
        <p className="text-muted-foreground mt-1">
          Generate a premium, admission-focused PDF brochure showcasing your school
        </p>
      </div>

      {/* Visibility Toggle Banner */}
      <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
        visible
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          {visible ? (
            <Eye className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <EyeOff className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <div>
            <p className={`font-semibold text-sm ${visible ? 'text-emerald-800' : 'text-slate-600'}`}>
              Brochure Visibility: <span className={visible ? 'text-emerald-600' : 'text-slate-400'}>
                {visible ? 'Enabled' : 'Disabled'}
              </span>
            </p>
            <p className={`text-xs mt-0.5 ${visible ? 'text-emerald-600' : 'text-slate-400'}`}>
              {visible
                ? 'Freelancers can see and download this brochure in their portal'
                : 'Brochure is hidden from freelancers — they cannot view or download it'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleToggleVisibility}
          disabled={togglingVisibility || !localUrl}
          size="sm"
          variant={visible ? 'destructive' : 'default'}
          className={visible
            ? 'bg-red-500 hover:bg-red-600 text-white min-w-[100px]'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]'
          }
        >
          {togglingVisibility ? (
            <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</>
          ) : visible ? (
            <><EyeOff className="w-3.5 h-3.5 mr-2" />Disable</>
          ) : (
            <><Eye className="w-3.5 h-3.5 mr-2" />Enable</>
          )}
        </Button>
      </div>

      {!localUrl && (
        <p className="text-xs text-slate-400 -mt-4 ml-1">Generate a brochure first to enable/disable visibility.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Generate card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-700 via-teal-500 to-purple-600" />
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 mx-auto shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-800 text-lg">Premium PDF Brochure</p>
                <p className="text-sm text-slate-500 mt-1">Multi-page, corporate design</p>
              </div>

              {localUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Brochure ready to download</span>
                  </div>
                  <a
                    href={localUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-700 to-teal-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Brochure
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    variant="outline"
                    className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                    size="sm"
                  >
                    {generating ? (
                      <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Regenerating...</>
                    ) : (
                      <><RefreshCw className="w-3.5 h-3.5 mr-2" />Regenerate Brochure</>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-blue-700 to-teal-600 text-white hover:opacity-90 shadow-md"
                >
                  {generating ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating Brochure...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Generate Brochure</>
                  )}
                </Button>
              )}

              {generating && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>This may take a few seconds while we compile all sections...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design theme preview */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Color Theme</p>
              <div className="flex gap-2">
                {['#1e3a8a', '#0d9488', '#d97706', '#7c3aed', '#e11d48', '#16a34a'].map((color) => (
                  <div key={color} className="w-7 h-7 rounded-full shadow-sm border border-white" style={{ backgroundColor: color }} />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Navy · Teal · Gold · Purple · Rose · Green</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Sections list */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-700">What's Included in Your Brochure</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SECTIONS_INCLUDED.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{s.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{s.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1">✨ Premium Design Features</p>
                <ul className="text-xs text-blue-700 space-y-0.5">
                  <li>• Multi-color section themes with decorative accents</li>
                  <li>• Cover page + back cover with school branding</li>
                  <li>• Stats infographics, facility grids, alumni cards</li>
                  <li>• Professional footer with school name & page numbers</li>
                  <li>• Corporate typography & visual hierarchy</li>
                </ul>
              </div>

              <p className="text-xs text-slate-400 mt-3 text-center">
                Data is pulled in real-time from all your filled sections. Ensure your profile is complete for the best results.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
