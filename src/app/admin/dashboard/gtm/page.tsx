'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Tag, Eye, EyeOff, Save, RefreshCw, CheckCircle2,
  AlertCircle, Code, FileCode, Info,
} from 'lucide-react';

export default function GtmSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [gtmContainerId, setGtmContainerId] = useState('');
  const [gtmHeadScript, setGtmHeadScript] = useState('');
  const [gtmBodyScript, setGtmBodyScript] = useState('');

  const [showHeadPreview, setShowHeadPreview] = useState(false);
  const [showBodyPreview, setShowBodyPreview] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    loadSettings(token);
  }, []);

  const loadSettings = async (token: string) => {
    try {
      const res = await fetch('/api/admin/settings/gtm', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setGtmEnabled(data.gtmEnabled ?? false);
      setGtmContainerId(data.gtmContainerId ?? '');
      setGtmHeadScript(data.gtmHeadScript ?? '');
      setGtmBodyScript(data.gtmBodyScript ?? '');
    } catch {
      toast.error('Failed to load GTM settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    // Validate GTM ID format if provided
    if (gtmContainerId && !/^GTM-[A-Z0-9]+$/i.test(gtmContainerId.trim())) {
      toast.error('GTM Container ID must be in format GTM-XXXXXXX');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/gtm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gtmEnabled,
          gtmContainerId: gtmContainerId.trim(),
          gtmHeadScript: gtmHeadScript.trim(),
          gtmBodyScript: gtmBodyScript.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('GTM settings saved! Changes take effect on next page load.');
    } catch {
      toast.error('Failed to save GTM settings');
    } finally {
      setSaving(false);
    }
  };

  // Build the auto-generated GTM head script preview
  const autoHeadScript = gtmContainerId
    ? `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmContainerId}');</script>
<!-- End Google Tag Manager -->`
    : '';

  const autoBodyScript = gtmContainerId
    ? `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmContainerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`
    : '';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}>
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Google Tag Manager</h1>
            <p className="text-sm text-slate-500">Manage GTM container and custom tracking scripts</p>
          </div>
        </div>
      </div>

      {/* Enable/Disable Banner */}
      <Card className={`mb-6 border-2 ${gtmEnabled ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {gtmEnabled
                ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                : <AlertCircle className="w-6 h-6 text-slate-400 shrink-0" />
              }
              <div>
                <p className={`font-semibold ${gtmEnabled ? 'text-emerald-800' : 'text-slate-600'}`}>
                  GTM Status: <span className={gtmEnabled ? 'text-emerald-600' : 'text-slate-400'}>
                    {gtmEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
                <p className={`text-sm mt-0.5 ${gtmEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {gtmEnabled
                    ? 'GTM scripts are being injected into all public pages'
                    : 'GTM scripts are not being injected — site tracking is off'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setGtmEnabled(!gtmEnabled)}
              variant={gtmEnabled ? 'destructive' : 'default'}
              className={gtmEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white min-w-[110px]'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white min-w-[110px]'
              }
            >
              {gtmEnabled
                ? <><EyeOff className="w-4 h-4 mr-2" />Disable</>
                : <><Eye className="w-4 h-4 mr-2" />Enable</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GTM Container ID */}
      <Card className="mb-6 border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-500" />
            GTM Container ID
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Enter your GTM Container ID (e.g. <strong>GTM-XXXXXXX</strong>). The standard GTM head &amp; body scripts will be auto-generated and injected.</span>
          </div>
          <div className="space-y-1">
            <Label htmlFor="gtm-id" className="text-sm font-medium text-slate-600">Container ID</Label>
            <Input
              id="gtm-id"
              placeholder="GTM-XXXXXXX"
              value={gtmContainerId}
              onChange={(e) => setGtmContainerId(e.target.value.toUpperCase())}
              className="font-mono text-sm max-w-xs"
            />
          </div>

          {gtmContainerId && (
            <div className="space-y-3 mt-2">
              {/* Head script preview */}
              <div>
                <button
                  onClick={() => setShowHeadPreview(!showHeadPreview)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  {showHeadPreview ? 'Hide' : 'Preview'} auto-generated &lt;head&gt; script
                </button>
                {showHeadPreview && (
                  <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs overflow-x-auto leading-relaxed">
                    {autoHeadScript}
                  </pre>
                )}
              </div>
              {/* Body script preview */}
              <div>
                <button
                  onClick={() => setShowBodyPreview(!showBodyPreview)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  {showBodyPreview ? 'Hide' : 'Preview'} auto-generated &lt;body&gt; noscript
                </button>
                {showBodyPreview && (
                  <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs overflow-x-auto leading-relaxed">
                    {autoBodyScript}
                  </pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Head Script */}
      <Card className="mb-6 border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-purple-500" />
            Custom &lt;head&gt; Script
            <span className="text-xs font-normal text-slate-400 ml-1">Optional</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-slate-500">
            Any additional tracking code, analytics scripts, or custom tags to inject inside <code className="bg-slate-100 px-1 rounded">&lt;head&gt;</code>.
            Include full <code className="bg-slate-100 px-1 rounded">&lt;script&gt;</code> tags.
          </p>
          <Textarea
            placeholder={`<!-- Example: Google Analytics 4 -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXX');\n</script>`}
            value={gtmHeadScript}
            onChange={(e) => setGtmHeadScript(e.target.value)}
            rows={8}
            className="font-mono text-xs resize-y"
          />
        </CardContent>
      </Card>

      {/* Custom Body Script */}
      <Card className="mb-6 border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-orange-500" />
            Custom &lt;body&gt; Script
            <span className="text-xs font-normal text-slate-400 ml-1">Optional</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-slate-500">
            Code to inject at the start of <code className="bg-slate-100 px-1 rounded">&lt;body&gt;</code> — typically used for noscript fallbacks or body-level tracking pixels.
          </p>
          <Textarea
            placeholder={`<!-- Example: Facebook Pixel noscript -->\n<noscript>\n  <img height="1" width="1" style="display:none"\n    src="https://www.facebook.com/tr?id=XXXXXXXXX&ev=PageView&noscript=1"/>\n</noscript>`}
            value={gtmBodyScript}
            onChange={(e) => setGtmBodyScript(e.target.value)}
            rows={6}
            className="font-mono text-xs resize-y"
          />
        </CardContent>
      </Card>

      {/* Injection summary */}
      <Card className="mb-6 border-0 shadow-sm bg-slate-50">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">What will be injected (when enabled)</p>
          <div className="space-y-2 text-xs text-slate-600">
            {gtmContainerId && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>GTM Container <strong>{gtmContainerId}</strong> — auto-generated head + body scripts</span>
              </div>
            )}
            {gtmHeadScript && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Custom &lt;head&gt; script ({gtmHeadScript.length} chars)</span>
              </div>
            )}
            {gtmBodyScript && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Custom &lt;body&gt; script ({gtmBodyScript.length} chars)</span>
              </div>
            )}
            {!gtmContainerId && !gtmHeadScript && !gtmBodyScript && (
              <p className="text-slate-400 italic">No scripts configured yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="text-white px-8 py-2.5 shadow-md"
        style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}
      >
        {saving
          ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          : <><Save className="w-4 h-4 mr-2" />Save GTM Settings</>
        }
      </Button>
    </div>
  );
}
