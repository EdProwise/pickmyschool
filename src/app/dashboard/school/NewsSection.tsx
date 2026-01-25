'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Newspaper, Plus, Edit, Trash2, Star, Link as LinkIcon, FileText, Video as VideoIcon, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface NewsData {
  id?: number;
  title: string;
  content: string;
  category: string;
  publishDate: string;
  link?: string;
  images: string[];
  pdf?: string;
  video?: string;
  isPublished: boolean;
  featured: boolean;
}

interface NewsSectionProps {
  schoolId: number;
}

export function NewsSection({ schoolId }: NewsSectionProps) {
  const [news, setNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsData | null>(null);
  const [formData, setFormData] = useState<NewsData>({
    title: '',
    content: '',
    category: 'Announcement',
    publishDate: new Date().toISOString().split('T')[0],
    images: [],
    isPublished: true,
    featured: false,
  });
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadNews();
  }, [schoolId]);

  const loadNews = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/schools/news?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editing?.id
        ? `/api/schools/news?id=${editing.id}`
        : '/api/schools/news';
      
      const response = await fetch(url, {
        method: editing?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save news');

      toast.success(editing?.id ? 'News updated successfully' : 'News added successfully');
      setEditing(null);
      setFormData({
        title: '',
        content: '',
        category: 'Announcement',
        publishDate: new Date().toISOString().split('T')[0],
        images: [],
        isPublished: true,
        featured: false,
      });
      loadNews();
    } catch (error) {
      toast.error('Failed to save news');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/schools/news?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete news');

      toast.success('News deleted successfully');
      loadNews();
    } catch (error) {
      toast.error('Failed to delete news');
    }
  };

  const handleEdit = (newsItem: NewsData) => {
    // Ensure images is always an array
    let parsedImages: string[] = [];
    if (newsItem.images) {
      if (typeof newsItem.images === 'string') {
        try {
          parsedImages = JSON.parse(newsItem.images);
        } catch (e) {
          console.warn('Failed to parse images:', e);
          parsedImages = [];
        }
      } else if (Array.isArray(newsItem.images)) {
        parsedImages = newsItem.images;
      }
    }

    setEditing(newsItem);
    setFormData({
      ...newsItem,
      images: parsedImages,
    });
  };

  const handleFileUpload = async (files: FileList | null, type: 'image' | 'document' | 'video') => {
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setUploading({ ...uploading, [type]: true });

    try {
      const formDataObj = new FormData();
      Array.from(files).forEach(file => formDataObj.append('files', file));
      formDataObj.append('type', type);

      const response = await fetch('/api/schools/news/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (type === 'image') {
        setFormData({ ...formData, images: [...formData.images, ...data.urls] });
        toast.success(`${data.count} image(s) uploaded successfully`);
      } else if (type === 'document') {
        setFormData({ ...formData, pdf: data.urls[0] });
        toast.success('PDF uploaded successfully');
      } else if (type === 'video') {
        setFormData({ ...formData, video: data.urls[0] });
        toast.success('Video uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to upload ${type}`);
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Newspaper className="text-white" size={20} />
            </div>
            {editing ? 'Edit News' : 'Add News Article'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Achievement">Achievement</SelectItem>
                    <SelectItem value="Announcement">Announcement</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Publish Date *</Label>
                <Input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Write the news content..."
                required
              />
            </div>

            {/* External Link */}
            <div>
              <Label className="flex items-center gap-2">
                <LinkIcon size={16} />
                External News Link (Optional)
              </Label>
              <Input
                type="url"
                value={formData.link || ''}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com/news-article"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add a link to external news source or article
              </p>
            </div>

            {/* Media Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-6">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Upload size={16} />
                Media Files (Optional)
              </h3>
              
              {/* Image Upload */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon size={14} />
                  Images
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files, 'image')}
                      disabled={uploading.image}
                      className="cursor-pointer"
                    />
                    {uploading.image && (
                      <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload multiple images (JPEG, PNG, WebP, GIF). Max 5MB per image.
                  </p>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <FileText size={14} />
                  PDF Document
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload(e.target.files, 'document')}
                      disabled={uploading.document}
                      className="cursor-pointer"
                    />
                    {uploading.document && (
                      <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload PDF document. Max 10MB.
                  </p>
                  
                  {formData.pdf && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-red-600" />
                        <span className="text-sm font-medium">PDF attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pdf: undefined })}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <VideoIcon size={14} />
                  Video
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={(e) => handleFileUpload(e.target.files, 'video')}
                      disabled={uploading.video}
                      className="cursor-pointer"
                    />
                    {uploading.video && (
                      <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload video file (MP4, WebM, OGG). Max 50MB. Or paste YouTube/Vimeo URL below.
                  </p>
                  
                  <Input
                    type="url"
                    value={formData.video || ''}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="mt-2"
                  />
                  
                  {formData.video && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200 mt-2">
                      <div className="flex items-center gap-2">
                        <VideoIcon size={18} className="text-blue-600" />
                        <span className="text-sm font-medium">Video attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, video: undefined })}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked as boolean })}
                />
                <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                  Publish this news (visible on public page)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                  Feature this news (show prominently)
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                {editing ? 'Update News' : 'Add News'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setFormData({
                      title: '',
                      content: '',
                      category: 'Announcement',
                      publishDate: new Date().toISOString().split('T')[0],
                      images: [],
                      isPublished: true,
                      featured: false,
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* News List */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Newspaper className="text-white" size={20} />
            </div>
            News & Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="mx-auto mb-4 opacity-50" size={48} />
              <p>No news added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <Card key={item.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          {item.featured && (
                            <Star className="text-yellow-500 fill-yellow-500" size={16} />
                          )}
                          {!item.isPublished && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.publishDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => item.id && handleDelete(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}