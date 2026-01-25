'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Send, CheckCircle2, AlertCircle, Loader2,
  User, Mail, Phone, graduationCap, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function PublicEnquiryPage() {
  const params = useParams();
  const schoolId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<EnquirySettings | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (schoolId) {
      loadSettings();
    }
  }, [schoolId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/enquiry-settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        
        // Initialize form data
        const initialData: Record<string, string> = {};
        data.fields.forEach((field: FormField) => {
          if (field.enabled) {
            initialData[field.id] = '';
          }
        });
        setFormData(initialData);
      } else {
        toast.error('Failed to load form settings');
      }
    } catch (error) {
      console.error('Failed to load enquiry settings:', error);
      toast.error('Failed to load form settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submissionData = {
        schoolId: parseInt(schoolId),
        studentName: formData.name || '',
        studentEmail: formData.email || '',
        studentPhone: formData.phone || '',
        studentClass: formData.class || '',
        message: formData.message || '',
      };

      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Enquiry submitted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!settings || !settings.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Form Not Available</h2>
          <p className="text-muted-foreground">
            This enquiry form is currently not accepting submissions or does not exist.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center p-8 shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Submitted!</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {settings.successMessage}
          </p>
          <Button 
            onClick={() => setSubmitted(false)}
            className="w-full h-12 text-white font-bold rounded-xl shadow-lg"
            style={{ backgroundColor: settings.themeColor }}
          >
            Submit Another Enquiry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-4">
      <Card className="max-w-2xl mx-auto shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl">
        <div 
          className="h-1.5 sm:h-2 w-full" 
          style={{ backgroundColor: settings.themeColor }}
        />
        <CardHeader className="text-center pb-4 sm:pb-8 pt-6 sm:pt-10">
          <CardTitle className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3" style={{ color: settings.themeColor }}>
            {settings.title}
          </CardTitle>
          <CardDescription className="text-sm sm:text-lg font-medium px-2">
            {settings.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {settings.fields.filter(f => f.enabled).map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <Label htmlFor={field.id} className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2 block px-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.id}
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base focus:ring-2 bg-gray-50/50 border-gray-200 rounded-xl"
                      style={{ '--tw-ring-color': settings.themeColor } as any}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="h-11 sm:h-12 text-sm sm:text-base focus:ring-2 bg-gray-50/50 border-gray-200 rounded-xl"
                      style={{ '--tw-ring-color': settings.themeColor } as any}
                    />
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold text-white rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2 sm:mt-4"
              style={{ backgroundColor: settings.themeColor }}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {settings.buttonText}
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              Powered by <span className="font-bold text-cyan-600">PickMySchool</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
