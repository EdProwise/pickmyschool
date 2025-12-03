'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Star, MapPin, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Testimonial {
  id: number;
  parentName: string;
  location: string;
  rating: number;
  testimonialText: string;
  avatarUrl: string | null;
  featured: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    parentName: '',
    location: '',
    rating: 5,
    testimonialText: '',
    avatarUrl: '',
    featured: true,
    displayOrder: null as number | null,
  });

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/testimonials?limit=100', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      } else {
        toast.error('Failed to load testimonials');
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      parentName: '',
      location: '',
      rating: 5,
      testimonialText: '',
      avatarUrl: '',
      featured: true,
      displayOrder: null,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const adminToken = localStorage.getItem('admin_token');
      const url = editingId 
        ? `/api/admin/testimonials/${editingId}` 
        : '/api/admin/testimonials';
      const method = editingId ? 'PUT' : 'POST';

      const payload: any = {
        parentName: formData.parentName,
        location: formData.location,
        rating: formData.rating,
        testimonialText: formData.testimonialText,
        featured: formData.featured,
      };

      if (formData.avatarUrl) {
        payload.avatarUrl = formData.avatarUrl;
      }

      if (formData.displayOrder !== null) {
        payload.displayOrder = formData.displayOrder;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Testimonial updated successfully' : 'Testimonial created successfully');
        resetForm();
        loadTestimonials();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save testimonial');
      }
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      toast.error('Failed to save testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      parentName: testimonial.parentName,
      location: testimonial.location,
      rating: testimonial.rating,
      testimonialText: testimonial.testimonialText,
      avatarUrl: testimonial.avatarUrl || '',
      featured: testimonial.featured,
      displayOrder: testimonial.displayOrder,
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        toast.success('Testimonial deleted successfully');
        loadTestimonials();
      } else {
        toast.error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Manage Testimonials
              </h1>
              <p className="text-muted-foreground">
                Create and manage parent testimonials for the homepage
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {showForm ? (
                <>
                  <X className="mr-2" size={20} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="mr-2" size={20} />
                  Add New
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <CardTitle>
                {editingId ? 'Edit Testimonial' : 'Create New Testimonial'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parent Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Parent Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="e.g., Priya Sharma"
                      required
                      className="h-12"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Delhi"
                      required
                      className="h-12"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full h-12 px-4 rounded-md border border-input bg-background"
                      required
                    >
                      {[5, 4, 3, 2, 1].map((num) => (
                        <option key={num} value={num}>
                          {num} Star{num !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Display Order (Optional)
                    </label>
                    <Input
                      type="number"
                      value={formData.displayOrder ?? ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        displayOrder: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      placeholder="1, 2, 3..."
                      className="h-12"
                    />
                  </div>

                  {/* Avatar URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Avatar URL (Optional)
                    </label>
                    <Input
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to use parent's initials as avatar
                    </p>
                  </div>
                </div>

                {/* Testimonial Text */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Testimonial Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.testimonialText}
                    onChange={(e) => setFormData({ ...formData, testimonialText: e.target.value })}
                    placeholder="Write the parent's testimonial here..."
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-md border border-input bg-background resize-none"
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold text-foreground cursor-pointer">
                    Show on Homepage (Featured)
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2" size={20} />
                        {editingId ? 'Update Testimonial' : 'Create Testimonial'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="h-12 px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Testimonials List */}
        <div className="grid grid-cols-1 gap-6">
          {testimonials.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Star className="text-gray-400" size={40} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No Testimonials Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first testimonial to display on the homepage
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  <Plus className="mr-2" size={20} />
                  Add Testimonial
                </Button>
              </CardContent>
            </Card>
          ) : (
            testimonials.map((testimonial) => (
              <Card 
                key={testimonial.id} 
                className="border-0 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Testimonial Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {testimonial.avatarUrl ? (
                            <img
                              src={testimonial.avatarUrl}
                              alt={testimonial.parentName}
                              className="w-16 h-16 rounded-full ring-2 ring-cyan-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-cyan-200">
                              {testimonial.parentName.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Name & Location */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">
                            {testimonial.parentName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin size={14} />
                            <span>{testimonial.location}</span>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex gap-1 mb-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {testimonial.featured && (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                Featured
                              </span>
                            )}
                            {testimonial.displayOrder !== null && (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                Order: {testimonial.displayOrder}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Testimonial Text */}
                      <p className="text-muted-foreground italic leading-relaxed line-clamp-4">
                        &quot;{testimonial.testimonialText}&quot;
                      </p>

                      {/* Metadata */}
                      <div className="mt-4 text-xs text-muted-foreground">
                        Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleEdit(testimonial)}
                        size="sm"
                        variant="outline"
                        className="border-cyan-400 text-cyan-600 hover:bg-cyan-50"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(testimonial.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-400 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Box */}
        <Card className="mt-8 border-0 bg-gradient-to-r from-cyan-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
                <Star className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  About Testimonials
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Only <strong>featured</strong> testimonials will appear on the homepage</li>
                  <li>• Maximum of <strong>6 testimonials</strong> will be displayed</li>
                  <li>• Testimonials are ordered by <strong>Display Order</strong> (if set), then by creation date</li>
                  <li>• Testimonials animate from left to right when the page loads</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
