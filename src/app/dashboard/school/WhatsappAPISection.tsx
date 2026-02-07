'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, CheckCircle2, Copy, ExternalLink, ShieldCheck, Edit, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsappAPISectionProps {
  profile?: any;
  onRefresh?: () => Promise<void>;
}

export const WhatsappAPISection: React.FC<WhatsappAPISectionProps> = ({ profile, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [webhookUrl, setWebhookUrl] = useState(profile?.whatsappWebhookUrl || '');
  const [apiKey, setApiKey] = useState(profile?.whatsappApiKey || '');
  
  const [editWebhookUrl, setEditWebhookUrl] = useState(webhookUrl);
  const [editApiKey, setEditApiKey] = useState(apiKey);

  useEffect(() => {
    if (profile) {
      const newWebhookUrl = profile.whatsappWebhookUrl || '';
      const newApiKey = profile.whatsappApiKey || '';
      setWebhookUrl(newWebhookUrl);
      setApiKey(newApiKey);
      setEditWebhookUrl(newWebhookUrl);
      setEditApiKey(newApiKey);
    }
  }, [profile]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleEdit = () => {
    setEditWebhookUrl(webhookUrl);
    setEditApiKey(apiKey);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditWebhookUrl(webhookUrl);
    setEditApiKey(apiKey);
    setIsEditing(false);
  };

    const handleSave = async () => {
        if (!editWebhookUrl.trim()) {
          toast.error('Webhook URL is required');
          return;
        }
        if (!editApiKey.trim()) {
          toast.error('API Key is required');
          return;
        }

        setSaving(true);
        try {
          const token = localStorage.getItem('token');
          
          const response = await fetch('/api/schools/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              whatsappWebhookUrl: editWebhookUrl.trim(),
              whatsappApiKey: editApiKey.trim(),
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.error || 'Failed to save settings');
          }

            setWebhookUrl(editWebhookUrl.trim());
            setApiKey(editApiKey.trim());
            setIsEditing(false);
            toast.success('WhatsApp API settings saved successfully');
            
            if (onRefresh) {
              await onRefresh();
            }
        } catch (error: any) {
          console.error('Save error:', error);
          toast.error(error.message || 'Failed to save settings');
        } finally {
          setSaving(false);
        }
      };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Whatsapp API Integration
        </h2>
        <p className="text-muted-foreground text-lg">
          Connect your school enquiries directly to EdproWise Booster for automated Whatsapp messaging.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 size={48} />
            </div>
            <div className="text-center">
              <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 text-sm mb-2">
                Active & Connected
              </Badge>
              <p className="text-sm text-muted-foreground">
                Your enquiries are being automatically forwarded to EdproWise Booster.
              </p>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <a href="https://edprowisebooster.edprowise.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                View in EdproWise Booster <ExternalLink size={14} />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                API Configuration
              </CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Webhook Endpoint URL
                <Badge variant="outline" className="text-[10px] font-mono">POST</Badge>
              </label>
              <div className="flex gap-2">
                <Input 
                  value={isEditing ? editWebhookUrl : webhookUrl} 
                  onChange={(e) => setEditWebhookUrl(e.target.value)}
                  readOnly={!isEditing}
                  className={`bg-gray-50/50 border-gray-200 font-mono text-xs ${isEditing ? 'bg-white border-cyan-300 focus:border-cyan-500' : ''}`}
                  placeholder="Enter webhook URL"
                />
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                This URL receives data from PickMySchool and triggers Whatsapp notifications in EdproWise Booster.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                API Key
                <ShieldCheck size={14} className="text-cyan-600" />
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    value={isEditing ? editApiKey : apiKey} 
                    onChange={(e) => setEditApiKey(e.target.value)}
                    type={isEditing || showApiKey ? 'text' : 'password'}
                    readOnly={!isEditing}
                    className={`bg-gray-50/50 border-gray-200 font-mono text-xs pr-10 ${isEditing ? 'bg-white border-cyan-300 focus:border-cyan-500' : ''}`}
                    placeholder="Enter API key"
                  />
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  )}
                </div>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(apiKey, 'API Key')}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Meta-approved Cloud API Key for secure communication between platforms.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white flex-shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-cyan-900 mb-1">How it works</h4>
                <p className="text-xs text-cyan-700 leading-relaxed">
                  Whenever a student submits an enquiry on PickMySchool.com, their details (Name, Phone, Email, Message) 
                  are instantly sent to your EdproWise Booster dashboard. This allows you to immediately start the 
                  admission conversation via automated Whatsapp templates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature List */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Integration Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Auto-Forward', desc: 'Real-time enquiry sync' },
              { title: 'WhatsApp Templates', desc: 'Pre-approved message sets' },
              { title: 'Lead Tracking', desc: 'Monitor conversion progress' },
              { title: 'Contact Management', desc: 'CRM style contact sorting' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h5 className="text-sm font-bold">{feature.title}</h5>
                  <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
