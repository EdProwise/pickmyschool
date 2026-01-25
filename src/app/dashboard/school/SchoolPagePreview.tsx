'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, ExternalLink, Globe, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SchoolPagePreviewProps {
  schoolId: number | null;
}

export function SchoolPagePreview({ schoolId }: SchoolPagePreviewProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (schoolId) {
      loadVisibilityStatus();
    }
  }, [schoolId]);

  const loadVisibilityStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schools/visibility', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsPublic(data.isPublic);
      }
    } catch (error) {
      console.error('Failed to load visibility status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async () => {
    setToggling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schools/visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsPublic(data.isPublic);
        toast.success(data.message);
        
        setPreviewKey(prev => prev + 1);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('Failed to update visibility');
    } finally {
      setToggling(false);
    }
  };

  const openInNewTab = () => {
    if (schoolId) {
      window.open(`/schools/${schoolId}`, '_blank');
    }
  };

  if (!schoolId) {
    return (
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            School Profile Not Found
          </h3>
          <p className="text-muted-foreground text-lg">
            Complete your profile to preview your school page
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              School Public Page
            </CardTitle>
            <Badge
              variant={isPublic ? 'default' : 'secondary'}
              className={`px-4 py-2 text-sm font-bold ${
                isPublic
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isPublic ? (
                    <><Globe className="w-4 h-4 mr-2" />Public</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" />Private</>
                  )}
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-cyan-200/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              {isPublic ? (
                <Eye className="w-6 h-6 text-white" />
              ) : (
                <EyeOff className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground mb-2">
                {isPublic ? 'Your school page is visible to the public' : 'Your school page is private'}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {isPublic
                  ? 'Parents and students can discover your school through search and direct links. Your page appears in search results.'
                  : 'Your school page is hidden from public view. Only you can see it through this dashboard.'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={toggleVisibility}
                  disabled={toggling || loading}
                  className={`h-11 px-6 font-bold rounded-xl shadow-lg transition-all duration-300 ${
                    isPublic
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  } text-white`}
                >
                  {toggling ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                  ) : (
                    <>
                      {isPublic ? (
                        <><EyeOff className="w-4 h-4 mr-2" />Make Private</>
                      ) : (
                        <><Eye className="w-4 h-4 mr-2" />Make Public</>
                      )}
                    </>
                  )}
                </Button>
                <Button
                  onClick={openInNewTab}
                  variant="outline"
                  className="h-11 px-6 font-bold rounded-xl border-2 border-cyan-300 hover:bg-cyan-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview iframe */}
      <Card className="border-0 shadow-2xl bg-white overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 px-4 py-2 bg-white rounded-lg text-sm text-muted-foreground font-mono">
              {typeof window !== 'undefined' && `${window.location.origin}/schools/${schoolId}`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative" style={{ paddingBottom: '75vh' }}>
            <iframe
              key={previewKey}
              src={`/schools/${schoolId}`}
              className="absolute inset-0 w-full h-full border-0"
              title="School Page Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
