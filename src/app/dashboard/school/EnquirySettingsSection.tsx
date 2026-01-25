'use client';

import { useState, useEffect } from 'react';
import { 
  Save, LayoutDashboard, Settings, Eye, Copy, 
  CheckCircle2, XCircle, Info, Code, Palette, 
  ListTodo, MessageSquare, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
}

interface EnquirySettings {
  title: string;
  description: string;
  fields: FormField[];
  successMessage: string;
  buttonText: string;
  themeColor: string;
  isActive: boolean;
}

interface EnquirySettingsSectionProps {
  schoolId?: number | null;
}

export function EnquirySettingsSection({ schoolId: propSchoolId }: EnquirySettingsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<EnquirySettings>({
    title: 'Admission Enquiry',
    description: 'Please fill out the form below to enquire about admissions.',
    fields: [],
    successMessage: 'Thank you for your enquiry! We will get back to you soon.',
    buttonText: 'Submit Enquiry',
    themeColor: '#04d3d3',
    isActive: true,
  });
  
  const [schoolId, setSchoolId] = useState<number | string | null>(propSchoolId || null);

  useEffect(() => {
    loadSettings();
    
    if (propSchoolId) {
      setSchoolId(propSchoolId);
    } else {
      // Fallback: Get schoolId from user in localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setSchoolId(user.schoolId);
      }
    }
  }, [propSchoolId]);

  const loadSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/schools/enquiry-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // If data is empty or defaults, ensure fields are set
        if (!data.fields || data.fields.length === 0) {
          data.fields = [
            { id: 'name', label: 'Student Name', type: 'text', required: true, enabled: true },
            { id: 'email', label: 'Email Address', type: 'email', required: true, enabled: true },
            { id: 'phone', label: 'Phone Number', type: 'tel', required: true, enabled: true },
            { id: 'class', label: 'Applying for Class', type: 'text', required: true, enabled: true },
            { id: 'message', label: 'Message/Questions', type: 'textarea', required: false, enabled: true },
          ];
        }
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load enquiry settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch('/api/schools/enquiry-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Enquiry form settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleFieldEnabled = (index: number) => {
    const newFields = [...settings.fields];
    newFields[index].enabled = !newFields[index].enabled;
    setSettings({ ...settings, fields: newFields });
  };

  const toggleFieldRequired = (index: number) => {
    const newFields = [...settings.fields];
    newFields[index].required = !newFields[index].required;
    setSettings({ ...settings, fields: newFields });
  };

  const updateFieldLabel = (index: number, label: string) => {
    const newFields = [...settings.fields];
    newFields[index].label = label;
    setSettings({ ...settings, fields: newFields });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const publicFormUrl = schoolId ? `${window.location.origin}/schools/${schoolId}/enquiry` : '';
  const embedCode = `<iframe src="${publicFormUrl}" width="100%" height="600px" frameborder="0"></iframe>`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Enquiry Form Settings
          </h2>
          <p className="text-muted-foreground">
            Customize and integrate your school's admission enquiry form
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(publicFormUrl, '_blank')}
            className="border-2"
          >
            <Eye className="mr-2" size={18} />
            Preview Form
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="mr-2" size={18} />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1 bg-gray-100/50">
          <TabsTrigger value="content" className="py-2.5 flex items-center gap-2">
            <LayoutDashboard size={16} />
            Form Content
          </TabsTrigger>
          <TabsTrigger value="fields" className="py-2.5 flex items-center gap-2">
            <ListTodo size={16} />
            Form Fields
          </TabsTrigger>
          <TabsTrigger value="integration" className="py-2.5 flex items-center gap-2">
            <Code size={16} />
            Integration
          </TabsTrigger>
        </TabsList>

        {/* Content Settings */}
        <TabsContent value="content" className="mt-6 space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="text-cyan-600" size={20} />
                Appearance & Content
              </CardTitle>
              <CardDescription>
                Set the main text and style for your enquiry form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Form Title</Label>
                  <Input
                    id="title"
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    placeholder="e.g. Admission Enquiry 2026-27"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="themeColor"
                      type="color"
                      value={settings.themeColor}
                      onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                      className="w-12 h-10 p-1 rounded-md"
                    />
                    <Input
                      value={settings.themeColor}
                      onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                      placeholder="#04d3d3"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Form Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Explain what this form is for..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Submit Button Text</Label>
                  <Input
                    id="buttonText"
                    value={settings.buttonText}
                    onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                    placeholder="e.g. Submit Enquiry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive" className="flex items-center gap-2">Form Status</Label>
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      id="isActive"
                      checked={settings.isActive}
                      onCheckedChange={(checked) => setSettings({ ...settings, isActive: checked })}
                    />
                    <span className={`text-sm font-semibold ${settings.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {settings.isActive ? 'Form is Live' : 'Form is Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="successMessage">Success Message</Label>
                <Textarea
                  id="successMessage"
                  value={settings.successMessage}
                  onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })}
                  placeholder="What should parents see after submitting?"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fields Settings */}
        <TabsContent value="fields" className="mt-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="text-cyan-600" size={20} />
                Form Fields Configuration
              </CardTitle>
              <CardDescription>
                Choose which fields to show and which ones are mandatory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.fields.map((field, index) => (
                  <div 
                    key={field.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      field.enabled ? 'border-cyan-100 bg-cyan-50/20' : 'border-gray-100 bg-gray-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-bold text-base">{field.label}</Label>
                          {field.required && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Type: {field.type}</p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`req-${field.id}`} className="text-xs">Required</Label>
                          <Switch
                            id={`req-${field.id}`}
                            checked={field.required}
                            disabled={!field.enabled || field.id === 'name' || field.id === 'email'}
                            onCheckedChange={() => toggleFieldRequired(index)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`enable-${field.id}`} className="text-xs">Enabled</Label>
                          <Switch
                            id={`enable-${field.id}`}
                            checked={field.enabled}
                            disabled={field.id === 'name' || field.id === 'email'}
                            onCheckedChange={() => toggleFieldEnabled(index)}
                          />
                        </div>
                      </div>
                    </div>
                    {field.enabled && (
                      <div className="mt-3 pt-3 border-t border-cyan-100/50">
                        <Label className="text-xs mb-1.5 block">Custom Label</Label>
                        <Input 
                          value={field.label}
                          onChange={(e) => updateFieldLabel(index, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100 flex gap-3">
                <Info className="text-blue-600 shrink-0" size={20} />
                <p className="text-sm text-blue-700 leading-relaxed">
                  <strong>Note:</strong> "Student Name" and "Email Address" are mandatory fields and cannot be disabled to ensure you can always contact the leads.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integration" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="text-cyan-600" size={20} />
                  Direct Link
                </CardTitle>
                <CardDescription>
                  Share this link directly with parents or on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm break-all">
                  {publicFormUrl}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyToClipboard(publicFormUrl)}
                    className="flex-1 bg-cyan-600"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy Link
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(publicFormUrl, '_blank')}
                  >
                    Open Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="text-cyan-600" size={20} />
                  Embed on Website
                </CardTitle>
                <CardDescription>
                  Add this code to your school website to show the form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm">
                  {embedCode}
                </div>
                <Button 
                  onClick={() => copyToClipboard(embedCode)}
                  className="w-full bg-blue-600"
                >
                  <Copy size={16} className="mr-2" />
                  Copy Embed Code
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-cyan-600" size={20} />
                  Integration Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold">Customize</h4>
                  <p className="text-sm text-muted-foreground">Select fields and set your school's brand color in the settings above.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold">Copy Code</h4>
                  <p className="text-sm text-muted-foreground">Copy the iframe embed code and paste it into your website's contact or admission page.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">3</div>
                  <h4 className="font-bold">Receive Leads</h4>
                  <p className="text-sm text-muted-foreground">Whenever a parent fills the form, you'll see the details instantly in the "Enquiry List" section.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
