'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Plus, Edit, Trash2, Star, Upload, X, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface AlumniData {
  id?: number;
  name: string;
  batchYear: number;
  classLevel: string;
  section: string;
  currentPosition: string;
  company: string;
  achievements: string;
  photoUrl: string;
  linkedinUrl: string;
  quote: string;
  featured: boolean;
}

interface AlumniSectionProps {
  schoolId: number;
}

export function AlumniSection({ schoolId }: AlumniSectionProps) {
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AlumniData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [formData, setFormData] = useState<AlumniData>({
    name: '',
    batchYear: new Date().getFullYear(),
    classLevel: '',
    section: '',
    currentPosition: '',
    company: '',
    achievements: '',
    photoUrl: '',
    linkedinUrl: '',
    quote: '',
    featured: false,
  });

  useEffect(() => {
    loadAlumni();
  }, [schoolId]);

  const loadAlumni = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/schools/alumni?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAlumni(data);
      }
    } catch (error) {
      console.error('Failed to load alumni:', error);
      toast.error('Failed to load alumni');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photoUrl: reader.result as string });
      setUploading(false);
      toast.success('Photo uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!formData.name || !formData.batchYear) {
      toast.error('Name and Batch Year are required');
      return;
    }

    try {
      const url = editing?.id
        ? `/api/schools/alumni?id=${editing.id}`
        : '/api/schools/alumni';
      
      const response = await fetch(url, {
        method: editing?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save alumni');
      }

      toast.success(editing?.id ? 'Alumni updated successfully' : 'Alumni added successfully');
      resetForm();
      loadAlumni();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save alumni');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({
      name: '',
      batchYear: new Date().getFullYear(),
      classLevel: '',
      section: '',
      currentPosition: '',
      company: '',
      achievements: '',
      photoUrl: '',
      linkedinUrl: '',
      quote: '',
      featured: false,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alumni?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/schools/alumni?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete alumni');

      toast.success('Alumni deleted successfully');
      loadAlumni();
    } catch (error) {
      toast.error('Failed to delete alumni');
    }
  };

  const handleEdit = (alum: AlumniData) => {
    setEditing(alum);
    setFormData(alum);
    setShowForm(true);
  };

  const uniqueYears = [...new Set(alumni.map(a => a.batchYear))].sort((a, b) => b - a);

  const filteredAlumni = alumni.filter((alum) => {
    const matchesSearch = alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.achievements?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || alum.batchYear.toString() === filterYear;
    return matchesSearch && matchesYear;
  });

  const classOptions = [
    'Pre-K', 'KG', 'LKG', 'UKG',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
  ];

  const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm ? (
        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <GraduationCap className="text-white" size={20} />
                </div>
                {editing ? 'Edit Alumni' : 'Add New Alumni'}
              </div>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X size={20} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <Label>Batch Year <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={formData.batchYear}
                    onChange={(e) => setFormData({ ...formData, batchYear: parseInt(e.target.value) })}
                    placeholder="e.g., 2020"
                    required
                  />
                </div>

                <div>
                  <Label>Class</Label>
                  <Select
                    value={formData.classLevel}
                    onValueChange={(value) => setFormData({ ...formData, classLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Section</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionOptions.map((sec) => (
                        <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Current Position</Label>
                  <Input
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                    placeholder="e.g., CEO, Engineer"
                  />
                </div>

                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Current company"
                  />
                </div>

                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <Label>Photo</Label>
                  <div className="flex items-center gap-4">
                    {formData.photoUrl && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
                          onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        disabled={uploading}
                        className="w-full"
                      >
                        <Upload className="mr-2" size={16} />
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Achievements</Label>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  rows={2}
                  placeholder="Notable achievements, awards, recognitions..."
                />
              </div>

              <div>
                <Label>Quote / Testimonial</Label>
                <Textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  rows={2}
                  placeholder="Alumni testimonial about the school..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                  Feature on public school page
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  {editing ? 'Update Alumni' : 'Add Alumni'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <GraduationCap className="text-white" size={20} />
                </div>
                Alumni Management
              </CardTitle>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
              >
                <Plus className="mr-2" size={16} />
                Add Alumni
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search by name, achievement, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-40">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Filter Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Alumni Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="mx-auto mb-4 opacity-50" size={48} />
                <p className="text-lg font-medium mb-2">No alumni records found</p>
                <p className="text-sm">Click "Add Alumni" to create your first entry</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Batch Year</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Achievement</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlumni.map((alum) => (
                      <TableRow key={alum.id}>
                        <TableCell>
                          {alum.photoUrl ? (
                            <img
                              src={alum.photoUrl}
                              alt={alum.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                              {alum.name.charAt(0)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alum.name}</p>
                            {alum.currentPosition && (
                              <p className="text-xs text-muted-foreground">
                                {alum.currentPosition}{alum.company ? ` at ${alum.company}` : ''}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{alum.batchYear}</TableCell>
                        <TableCell>{alum.classLevel || '-'}</TableCell>
                        <TableCell>{alum.section || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {alum.achievements || '-'}
                        </TableCell>
                        <TableCell>
                          {alum.featured ? (
                            <Star className="text-yellow-500 fill-yellow-500" size={18} />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(alum)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => alum.id && handleDelete(alum.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
