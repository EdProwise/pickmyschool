'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Plus, Edit, Trash2, Upload, Award, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ResultData {
  id?: number;
  year: number;
  examType: string;
  classLevel: string;
  passPercentage: number;
  totalStudents: number;
  distinction: number;
  firstClass: number;
  toppers: Array<{ name: string; percentage: number; subject: string }> | null;
  achievements: string;
  certificateImages: string[];
}

interface StudentAchievementData {
  id?: number;
  year: number;
  studentName: string;
  marks: string;
  classLevel: string;
  section: string;
  achievement: string;
  images: string[];
}

interface ResultsSectionProps {
  schoolId: number;
}

export function ResultsSection({ schoolId }: ResultsSectionProps) {
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<ResultData>({
    year: new Date().getFullYear(),
    examType: '',
    classLevel: '',
    passPercentage: 0,
    totalStudents: 0,
    distinction: 0,
    firstClass: 0,
    toppers: [],
    achievements: '',
    certificateImages: [],
  });

  // Student Achievements State
  const [achievements, setAchievements] = useState<StudentAchievementData[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [editingAchievement, setEditingAchievement] = useState<StudentAchievementData | null>(null);
  const [achievementFormData, setAchievementFormData] = useState<StudentAchievementData>({
    year: new Date().getFullYear(),
    studentName: '',
    marks: '',
    classLevel: '',
    section: '',
    achievement: '',
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadResults();
    loadAchievements();
  }, [schoolId]);

  const loadResults = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/schools/results?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setAchievementsLoading(true);
    try {
      const response = await fetch(`/api/schools/student-achievements?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setAchievementsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editing?.id
        ? `/api/schools/results?id=${editing.id}`
        : '/api/schools/results';
      
      const response = await fetch(url, {
        method: editing?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save result');

      toast.success(editing?.id ? 'Result updated successfully' : 'Result added successfully');
      setEditing(null);
      setFormData({
        year: new Date().getFullYear(),
        examType: '',
        classLevel: '',
        passPercentage: 0,
        totalStudents: 0,
        distinction: 0,
        firstClass: 0,
        toppers: [],
        achievements: '',
        certificateImages: [],
      });
      loadResults();
    } catch (error) {
      toast.error('Failed to save result');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/schools/results?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete result');

      toast.success('Result deleted successfully');
      loadResults();
    } catch (error) {
      toast.error('Failed to delete result');
    }
  };

  const handleEdit = (result: ResultData) => {
    setEditing(result);
    setFormData(result);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/schools/student-achievements/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload images');
      }

      const { urls } = await response.json();
      
      // Add uploaded URLs to existing images
      setAchievementFormData({
        ...achievementFormData,
        images: [...achievementFormData.images, ...urls],
      });

      toast.success(`${urls.length} image(s) uploaded successfully`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingAchievement?.id
        ? `/api/schools/student-achievements?id=${editingAchievement.id}`
        : '/api/schools/student-achievements';
      
      const response = await fetch(url, {
        method: editingAchievement?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(achievementFormData),
      });

      if (!response.ok) throw new Error('Failed to save achievement');

      toast.success(editingAchievement?.id ? 'Achievement updated successfully' : 'Achievement added successfully');
      setEditingAchievement(null);
      setAchievementFormData({
        year: new Date().getFullYear(),
        studentName: '',
        marks: '',
        classLevel: '',
        section: '',
        achievement: '',
        images: [],
      });
      loadAchievements();
    } catch (error) {
      toast.error('Failed to save achievement');
    }
  };

  const handleDeleteAchievement = async (id: number) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/schools/student-achievements?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete achievement');

      toast.success('Achievement deleted successfully');
      loadAchievements();
    } catch (error) {
      toast.error('Failed to delete achievement');
    }
  };

  const handleEditAchievement = (achievement: StudentAchievementData) => {
    setEditingAchievement(achievement);
    setAchievementFormData(achievement);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Trophy className="text-white" size={20} />
            </div>
            {editing ? 'Edit Result' : 'Add New Result'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Exam Type</Label>
                <Select
                  value={formData.examType}
                  onValueChange={(value) => setFormData({ ...formData, examType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 10 Board">Class 10 Board</SelectItem>
                    <SelectItem value="Class 12 Board">Class 12 Board</SelectItem>
                    <SelectItem value="Internal Exam">Internal Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Class Level</Label>
                <Input
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                  placeholder="e.g., 10, 12"
                  required
                />
              </div>

              <div>
                <Label>Pass Percentage</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.passPercentage}
                  onChange={(e) => setFormData({ ...formData, passPercentage: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Total Students</Label>
                <Input
                  type="number"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Distinction</Label>
                <Input
                  type="number"
                  value={formData.distinction}
                  onChange={(e) => setFormData({ ...formData, distinction: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>First Class</Label>
                <Input
                  type="number"
                  value={formData.firstClass}
                  onChange={(e) => setFormData({ ...formData, firstClass: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Achievements</Label>
              <Textarea
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                rows={3}
                placeholder="Notable achievements and highlights..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                {editing ? 'Update Result' : 'Add Result'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setFormData({
                      year: new Date().getFullYear(),
                      examType: '',
                      classLevel: '',
                      passPercentage: 0,
                      totalStudents: 0,
                      distinction: 0,
                      firstClass: 0,
                      toppers: [],
                      achievements: '',
                      certificateImages: [],
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

      {/* Results List */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Trophy className="text-white" size={20} />
            </div>
            Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="mx-auto mb-4 opacity-50" size={48} />
              <p>No results added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {result.examType} - {result.year}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Pass %</p>
                            <p className="text-lg font-bold text-green-600">{result.passPercentage}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Students</p>
                            <p className="text-lg font-bold">{result.totalStudents}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Distinction</p>
                            <p className="text-lg font-bold text-yellow-600">{result.distinction}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">First Class</p>
                            <p className="text-lg font-bold text-blue-600">{result.firstClass}</p>
                          </div>
                        </div>
                        {result.achievements && (
                          <p className="text-sm text-muted-foreground">{result.achievements}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(result)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => result.id && handleDelete(result.id)}
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

      {/* Student Achievements Section */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            {editingAchievement ? 'Edit Student Achievement' : 'Add Student Achievement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAchievementSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Year *</Label>
                <Input
                  type="number"
                  value={achievementFormData.year}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, year: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Student Name *</Label>
                <Input
                  value={achievementFormData.studentName}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, studentName: e.target.value })}
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div>
                <Label>Percentage/Marks</Label>
                <Input
                  value={achievementFormData.marks}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, marks: e.target.value })}
                  placeholder="e.g., 95.5% or 450/500"
                />
              </div>

              <div>
                <Label>Class *</Label>
                <Input
                  value={achievementFormData.classLevel}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, classLevel: e.target.value })}
                  placeholder="e.g., 10, 12"
                  required
                />
              </div>

              <div>
                <Label>Section</Label>
                <Input
                  value={achievementFormData.section}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, section: e.target.value })}
                  placeholder="e.g., A, B, C"
                />
              </div>
            </div>

            <div>
              <Label>Achievement Description *</Label>
              <Textarea
                value={achievementFormData.achievement}
                onChange={(e) => setAchievementFormData({ ...achievementFormData, achievement: e.target.value })}
                rows={3}
                placeholder="Describe the achievement (e.g., School Topper, State Rank Holder, etc.)"
                required
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ImageIcon size={16} />
                Achievement Images (Optional)
              </h3>
              
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload Images</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? 'Uploading...' : 'Browse'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload certificates or achievement photos (Max 5MB per image, JPEG/PNG/WebP)
                </p>
              </div>

              {/* URL Input (Alternative) */}
              <div className="space-y-2">
                <Label>Or Paste Image URLs</Label>
                <Input
                  value={achievementFormData.images.join(', ')}
                  onChange={(e) => setAchievementFormData({ 
                    ...achievementFormData, 
                    images: e.target.value.split(',').map(url => url.trim()).filter(url => url) 
                  })}
                  placeholder="Paste image URLs separated by commas"
                />
                <p className="text-xs text-muted-foreground">
                  Alternatively, paste direct image URLs separated by commas
                </p>
              </div>

              {/* Image Preview - Passport Size */}
              {achievementFormData.images.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-green-600">
                    {achievementFormData.images.length} photo(s) selected
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    {achievementFormData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="w-[132px] h-[170px] rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = achievementFormData.images.filter((_, i) => i !== index);
                            setAchievementFormData({ ...achievementFormData, images: newImages });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          ×
                        </button>
                        <span className="text-[10px] text-muted-foreground text-center block mt-1">
                          Passport Size
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                {editingAchievement ? 'Update Achievement' : 'Add Achievement'}
              </Button>
              {editingAchievement && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingAchievement(null);
                    setAchievementFormData({
                      year: new Date().getFullYear(),
                      studentName: '',
                      marks: '',
                      classLevel: '',
                      section: '',
                      achievement: '',
                      images: [],
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

      {/* Student Achievements List */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            Student Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievementsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="mx-auto mb-4 opacity-50" size={48} />
              <p>No student achievements added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{achievement.studentName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-muted-foreground">
                                Class {achievement.classLevel}{achievement.section ? ` - ${achievement.section}` : ''}
                              </span>
                              <span className="text-sm font-semibold text-purple-600">Year: {achievement.year}</span>
                              {achievement.marks && (
                                <span className="text-sm font-bold text-green-600">{achievement.marks}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border-l-4 border-purple-500">
                          <p className="text-sm font-semibold text-gray-700 leading-relaxed whitespace-pre-line">
                            {achievement.achievement}
                          </p>
                        </div>
                        
                        {achievement.images && typeof achievement.images === 'string' && JSON.parse(achievement.images).length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {JSON.parse(achievement.images).map((img: string, i: number) => (
                              <div
                                key={i}
                                className="w-[132px] h-[170px] rounded-lg overflow-hidden border-2 border-purple-100 bg-gray-100"
                              >
                                <img
                                  src={img}
                                  alt={`Achievement ${i + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAchievement(achievement)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => achievement.id && handleDeleteAchievement(achievement.id)}
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