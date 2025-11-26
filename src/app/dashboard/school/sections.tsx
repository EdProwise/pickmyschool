'use client';

import { useState, useEffect } from 'react';
import { 
  Save, MapPin, Globe, Facebook, Instagram, Linkedin,
  Youtube, Phone, Mail, Info, Contact2, Building,
  Image, DollarSign, Link, FileText, Download, School,
  BookOpen, Laptop, Wifi, Video, Shield, Bus, Heart,
  Home, Coffee, Trophy, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SchoolProfile {
  // Basic Info
  name: string;
  establishmentYear?: number;
  schoolType?: string;
  k12Level?: string;
  board: string;
  gender?: string;
  isInternational?: boolean;
  streamsAvailable?: string;
  languages?: string;
  totalStudents?: string;
  totalTeachers?: number;
  logoUrl?: string;
  
  // Contact Info
  address?: string;
  city: string;
  state?: string;
  country?: string;
  website?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  googleMapUrl?: string;
  
  // Academic Facilities
  classroomType?: string;
  hasLibrary?: boolean;
  hasComputerLab?: boolean;
  computerCount?: number;
  hasPhysicsLab?: boolean;
  hasChemistryLab?: boolean;
  hasBiologyLab?: boolean;
  hasMathsLab?: boolean;
  hasLanguageLab?: boolean;
  hasRoboticsLab?: boolean;
  hasStemLab?: boolean;
  hasAuditorium?: boolean;
  
  // Sports & Fitness
  hasPlayground?: boolean;
  sportsFacilities?: string;
  hasSwimmingPool?: boolean;
  hasFitnessCentre?: boolean;
  hasYoga?: boolean;
  hasMartialArts?: boolean;
  hasMusicDance?: boolean;
  hasHorseRiding?: boolean;
  
  // Technology & Digital
  hasSmartBoard?: boolean;
  hasWifi?: boolean;
  hasCctv?: boolean;
  hasElearning?: boolean;
  hasAcClassrooms?: boolean;
  hasAiTools?: boolean;
  
  // Transport
  hasTransport?: boolean;
  hasGpsBuses?: boolean;
  hasCctvBuses?: boolean;
  hasBusCaretaker?: boolean;
  
  // Health & Safety
  hasMedicalRoom?: boolean;
  hasDoctorNurse?: boolean;
  hasFireSafety?: boolean;
  hasCleanWater?: boolean;
  hasSecurityGuards?: boolean;
  hasAirPurifier?: boolean;
  
  // Boarding
  hasHostel?: boolean;
  hasMess?: boolean;
  hasHostelStudyRoom?: boolean;
  hasAcHostel?: boolean;
  
  // Others
  hasCafeteria?: boolean;
  galleryImages?: string[];
  virtualTourUrl?: string;
  prospectusUrl?: string;
  awards?: string[];
  newsletterUrl?: string;
  feesStructure?: any;
}

interface SectionProps {
  profile: SchoolProfile | null;
  profileLoading: boolean;
  saving: boolean;
  onSave: (data: Partial<SchoolProfile>) => void;
}

// Basic Info Section
export function BasicInfoSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      if (profile.logoUrl) {
        setLogoPreview(profile.logoUrl);
      }
    }
  }, [profile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setLogoPreview(dataUrl);
        setFormData({ ...formData, logoUrl: dataUrl });
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Info className="text-white" size={20} />
          </div>
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name of School <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter school name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="establishmentYear">Establishment Year</Label>
              <Input
                id="establishmentYear"
                type="number"
                value={formData.establishmentYear || ''}
                onChange={(e) => setFormData({ ...formData, establishmentYear: parseInt(e.target.value) })}
                placeholder="e.g., 1990"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolType">School Type</Label>
              <Select
                value={formData.schoolType || ''}
                onValueChange={(value) => setFormData({ ...formData, schoolType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Govt">Govt.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="k12Level">K-12 School</Label>
              <Select
                value={formData.k12Level || ''}
                onValueChange={(value) => setFormData({ ...formData, k12Level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Foundational">Foundational (Till Class 2)</SelectItem>
                  <SelectItem value="Preparatory">Preparatory (Class 3 to 5)</SelectItem>
                  <SelectItem value="Middle">Middle (Class 6 to 8)</SelectItem>
                  <SelectItem value="Secondary">Secondary (Class 9 to 12)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="board">Board <span className="text-red-500">*</span></Label>
              <Select
                value={formData.board || ''}
                onValueChange={(value) => setFormData({ ...formData, board: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBSE">CBSE</SelectItem>
                  <SelectItem value="ICSE">ICSE</SelectItem>
                  <SelectItem value="State Board">State Board</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                  <SelectItem value="Unregistered">Unregistered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Co-Ed">Co-Ed</SelectItem>
                  <SelectItem value="Boys">Boys</SelectItem>
                  <SelectItem value="Girls">Girls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isInternational" className="flex items-center gap-2">
                Affiliated to International
              </Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.isInternational || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isInternational: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.isInternational ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streamsAvailable">Stream Available</Label>
              <Input
                id="streamsAvailable"
                value={formData.streamsAvailable || ''}
                onChange={(e) => setFormData({ ...formData, streamsAvailable: e.target.value })}
                placeholder="e.g., Science, Arts, Commerce"
              />
              <p className="text-xs text-muted-foreground">Separate multiple streams with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Language</Label>
              <Input
                id="languages"
                value={formData.languages || ''}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="e.g., English, Hindi, Regional Language"
              />
              <p className="text-xs text-muted-foreground">Separate multiple languages with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalStudents">No. of Students</Label>
              <Select
                value={formData.totalStudents || ''}
                onValueChange={(value) => setFormData({ ...formData, totalStudents: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upto 100">Upto 100</SelectItem>
                  <SelectItem value="200-400">200-400</SelectItem>
                  <SelectItem value="400-600">400-600</SelectItem>
                  <SelectItem value="600-800">600-800</SelectItem>
                  <SelectItem value="800-1000">800-1000</SelectItem>
                  <SelectItem value="1000-1500">1000-1500</SelectItem>
                  <SelectItem value="1500-2000">1500-2000</SelectItem>
                  <SelectItem value="More than 2000">More than 2000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalTeachers">No. of Teachers</Label>
              <Input
                id="totalTeachers"
                type="number"
                value={formData.totalTeachers || ''}
                onChange={(e) => setFormData({ ...formData, totalTeachers: parseInt(e.target.value) })}
                placeholder="Enter number of teachers"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="logoUpload">Logo of School</Label>
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border-2 border-dashed border-cyan-200">
                <div className="flex flex-col items-center gap-4">
                  {logoPreview && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-cyan-300 shadow-lg">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain bg-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 w-full">
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('logoUpload')?.click()}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    >
                      <Upload className="mr-2" size={16} />
                      {logoPreview ? 'Change Logo' : 'Upload Logo Image'}
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setLogoPreview('');
                          setFormData({ ...formData, logoUrl: '' });
                        }}
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Upload PNG, JPG or WEBP (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Basic Info
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Contact Info Section  
export function ContactInfoSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Contact2 className="text-white" size={20} />
          </div>
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address of School</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Enter state"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="contactNumber"
                  value={formData.contactNumber || ''}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="+91 1234567890"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Whatsapp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+91 1234567890"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@school.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="instagramUrl"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">Youtube</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="youtubeUrl"
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="googleMapUrl">Google Map</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="googleMapUrl"
                  value={formData.googleMapUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Contact Info
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Comprehensive Facilities Section with Tabs
export function FacilitiesSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Building className="text-white" size={20} />
          </div>
          Facilities & Infrastructure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="academic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="technology">Technology</TabsTrigger>
              <TabsTrigger value="transport">Transport</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="boarding">Boarding</TabsTrigger>
              <TabsTrigger value="others">Others</TabsTrigger>
            </TabsList>

            {/* Academic Facilities Tab */}
            <TabsContent value="academic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="classroomType">Classroom Type</Label>
                  <Select
                    value={formData.classroomType || ''}
                    onValueChange={(value) => setFormData({ ...formData, classroomType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Smart Class">Smart Class</SelectItem>
                      <SelectItem value="Digital Class">Digital Class</SelectItem>
                      <SelectItem value="Traditional">Traditional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Library</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasLibrary || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasLibrary: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasLibrary ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Computer Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasComputerLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasComputerLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasComputerLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="computerCount">No. of Computers</Label>
                  <Input
                    id="computerCount"
                    type="number"
                    value={formData.computerCount || ''}
                    onChange={(e) => setFormData({ ...formData, computerCount: parseInt(e.target.value) })}
                    placeholder="Enter number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Physics Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasPhysicsLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasPhysicsLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasPhysicsLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Chemistry Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasChemistryLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasChemistryLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasChemistryLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Biology Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasBiologyLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasBiologyLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasBiologyLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Maths Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasMathsLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasMathsLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasMathsLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Language Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasLanguageLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasLanguageLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasLanguageLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Robotics Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasRoboticsLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasRoboticsLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasRoboticsLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>STEM/Innovation Lab</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasStemLab || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasStemLab: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasStemLab ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Auditorium Hall</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasAuditorium || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAuditorium: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasAuditorium ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sports & Fitness Tab */}
            <TabsContent value="sports" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Playground</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasPlayground || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasPlayground: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasPlayground ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sportsFacilities">Sports Facilities</Label>
                  <Input
                    id="sportsFacilities"
                    value={formData.sportsFacilities || ''}
                    onChange={(e) => setFormData({ ...formData, sportsFacilities: e.target.value })}
                    placeholder="e.g., Football, Cricket, Badminton"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>

                <div className="space-y-2">
                  <Label>Swimming Pool</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasSwimmingPool || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasSwimmingPool: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasSwimmingPool ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fitness Centre</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasFitnessCentre || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasFitnessCentre: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasFitnessCentre ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Yoga</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasYoga || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasYoga: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasYoga ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Martial Arts Training</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasMartialArts || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasMartialArts: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasMartialArts ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Music & Dance Class</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasMusicDance || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasMusicDance: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasMusicDance ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Horse Riding / Archery / Shooting Range</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasHorseRiding || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasHorseRiding: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasHorseRiding ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Technology & Digital Tab */}
            <TabsContent value="technology" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Smart Board</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasSmartBoard || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasSmartBoard: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasSmartBoard ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>WiFi Campus</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasWifi || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasWifi: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasWifi ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CCTV System</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasCctv || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCctv: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasCctv ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>E-Learning Platform</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasElearning || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasElearning: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasElearning ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Air Conditioned Classrooms</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasAcClassrooms || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAcClassrooms: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasAcClassrooms ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>AI Enable Learning Tools</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasAiTools || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAiTools: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasAiTools ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Transport Tab */}
            <TabsContent value="transport" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>School Bus/Vans</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasTransport || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasTransport: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasTransport ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>GPS Enabled Buses</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasGpsBuses || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasGpsBuses: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasGpsBuses ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CCTV in Buses</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasCctvBuses || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCctvBuses: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasCctvBuses ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Caretaker in Bus</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasBusCaretaker || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasBusCaretaker: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasBusCaretaker ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Health & Safety Tab */}
            <TabsContent value="health" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Medical Room</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasMedicalRoom || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasMedicalRoom: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasMedicalRoom ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>On Campus Doctor/Nurse</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasDoctorNurse || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasDoctorNurse: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasDoctorNurse ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fire Safety</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasFireSafety || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasFireSafety: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasFireSafety ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Clean Drinking Water</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasCleanWater || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCleanWater: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasCleanWater ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Security Guards</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasSecurityGuards || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasSecurityGuards: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasSecurityGuards ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Air Purifier in Classroom</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasAirPurifier || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAirPurifier: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasAirPurifier ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Boarding Tab */}
            <TabsContent value="boarding" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Hostel</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasHostel || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasHostel: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasHostel ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mess</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasMess || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasMess: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasMess ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Study Room in Hostel</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasHostelStudyRoom || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasHostelStudyRoom: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasHostelStudyRoom ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Air Conditioner Hostel</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasAcHostel || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAcHostel: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasAcHostel ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Others Tab */}
            <TabsContent value="others" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cafeteria</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.hasCafeteria || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCafeteria: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.hasCafeteria ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save All Facilities
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Gallery & Documents Section
export function GallerySection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [newAwardText, setNewAwardText] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Handle multiple gallery images upload
  const handleGalleryImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const readers = validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(dataUrls => {
        const currentImages = formData.galleryImages || [];
        setFormData({ ...formData, galleryImages: [...currentImages, ...dataUrls] });
        toast.success(`${dataUrls.length} image(s) uploaded successfully`);
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentImages = formData.galleryImages || [];
    setFormData({ ...formData, galleryImages: currentImages.filter((_, i) => i !== index) });
    toast.success('Image removed');
  };

  // Handle virtual tour upload
  const handleVirtualTourUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please upload a video file');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video size should be less than 100MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData({ ...formData, virtualTourUrl: dataUrl });
        toast.success('Virtual tour uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle prospectus upload
  const handleProspectusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF size should be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData({ ...formData, prospectusUrl: dataUrl });
        toast.success('Prospectus uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle award image upload
  const handleAwardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!newAwardText.trim()) {
        toast.error('Please enter award title first');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const currentAwards = formData.awards || [];
        const awardEntry = {
          text: newAwardText.trim(),
          image: dataUrl
        };
        setFormData({ ...formData, awards: [...currentAwards, JSON.stringify(awardEntry)] });
        setNewAwardText('');
        toast.success('Award added successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAward = (index: number) => {
    const currentAwards = formData.awards || [];
    setFormData({ ...formData, awards: currentAwards.filter((_, i) => i !== index) });
    toast.success('Award removed');
  };

  // Handle newsletter upload
  const handleNewsletterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF size should be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData({ ...formData, newsletterUrl: dataUrl });
        toast.success('Newsletter uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const parseAward = (award: string) => {
    try {
      const parsed = JSON.parse(award);
      if (typeof parsed === 'object' && (parsed.text || parsed.image)) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, treat as plain text
    }
    return { text: award, image: '' };
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Image className="text-white" size={20} />
          </div>
          Gallery & Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images of School */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="text-blue-600" size={20} />
              <Label className="text-base font-semibold">Images of School</Label>
            </div>
            <p className="text-sm text-muted-foreground">Upload multiple images of your school campus, classrooms, and facilities</p>
            
            {/* Upload Field */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-dashed border-blue-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Upload className="text-white" size={28} />
                </div>
                <Input
                  id="galleryImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('galleryImages')?.click()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8"
                >
                  <Upload className="mr-2" size={16} />
                  Select Images to Upload
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  PNG, JPG or WEBP (Max 5MB per image)
                </p>
              </div>
            </div>

            {/* Display Uploaded Images */}
            {formData.galleryImages && formData.galleryImages.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{formData.galleryImages.length} image(s) uploaded</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.galleryImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                        <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t-2 pt-8" />

          {/* Virtual Tour */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Video className="text-purple-600" size={20} />
              <Label className="text-base font-semibold">Virtual Tour of School</Label>
            </div>
            <p className="text-sm text-muted-foreground">Upload a video walkthrough of your school</p>
            
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Video className="text-white" size={28} />
                </div>
                <Input
                  id="virtualTour"
                  type="file"
                  accept="video/*"
                  onChange={handleVirtualTourUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('virtualTour')?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8"
                >
                  <Upload className="mr-2" size={16} />
                  Upload Video
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  MP4, MOV or WEBM (Max 100MB)
                </p>
              </div>
            </div>

            {formData.virtualTourUrl && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
                  <Video className="text-purple-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Virtual Tour Uploaded</p>
                  <span className="text-xs text-muted-foreground">Video file ready</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, virtualTourUrl: '' })}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  ×
                </Button>
              </div>
            )}
          </div>

          <div className="border-t-2 pt-8" />

          {/* Prospectus */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-600" size={20} />
              <Label className="text-base font-semibold">Prospectus (PDF)</Label>
            </div>
            <p className="text-sm text-muted-foreground">Upload your school prospectus document</p>
            
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <FileText className="text-white" size={28} />
                </div>
                <Input
                  id="prospectus"
                  type="file"
                  accept="application/pdf"
                  onChange={handleProspectusUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('prospectus')?.click()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8"
                >
                  <Upload className="mr-2" size={16} />
                  Upload PDF
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  PDF only (Max 10MB)
                </p>
              </div>
            </div>

            {formData.prospectusUrl && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shrink-0">
                  <FileText className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Prospectus Uploaded</p>
                  <span className="text-xs text-muted-foreground">PDF file ready</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, prospectusUrl: '' })}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  ×
                </Button>
              </div>
            )}
          </div>

          <div className="border-t-2 pt-8" />

          {/* Awards - Text and Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-600" size={20} />
              <Label className="text-base font-semibold">Awards & Achievements</Label>
            </div>
            <p className="text-sm text-muted-foreground">Add your school's awards with descriptions and certificate images</p>
            
            {/* Add New Award */}
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-dashed border-yellow-300 space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="awardText" className="text-sm font-semibold flex items-center gap-2">
                    <FileText size={16} className="text-yellow-600" />
                    Award Title / Description
                  </Label>
                  <Input
                    id="awardText"
                    value={newAwardText}
                    onChange={(e) => setNewAwardText(e.target.value)}
                    placeholder="e.g., National Excellence Award 2023, Best STEM School Award"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Image size={16} className="text-yellow-600" />
                    Award Certificate / Image
                  </Label>
                  <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border-2 border-dashed border-yellow-200">
                    <Input
                      id="awardImage"
                      type="file"
                      accept="image/*"
                      onChange={handleAwardImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('awardImage')?.click()}
                      disabled={!newAwardText.trim()}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6"
                    >
                      <Upload className="mr-2" size={16} />
                      Upload Award Image
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      PNG, JPG or WEBP (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Awards */}
            {formData.awards && formData.awards.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{formData.awards.length} award(s) added</p>
                {formData.awards.map((award, index) => {
                  const parsedAward = parseAward(award);
                  return (
                    <div key={index} className="p-4 bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          {parsedAward.text && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center shrink-0">
                                <Trophy className="text-yellow-600" size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">Award Title</p>
                                <p className="text-sm font-semibold">{parsedAward.text}</p>
                              </div>
                            </div>
                          )}
                          {parsedAward.image && (
                            <div className="pl-11">
                              <p className="text-xs text-muted-foreground mb-2">Certificate Image</p>
                              <div className="w-full max-w-xs rounded-lg overflow-hidden border-2 border-gray-200">
                                <img src={parsedAward.image} alt="Award certificate" className="w-full h-auto" />
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAward(index)}
                          className="shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t-2 pt-8" />

          {/* Newsletter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="text-indigo-600" size={20} />
              <Label className="text-base font-semibold">Newsletter / Magazine</Label>
            </div>
            <p className="text-sm text-muted-foreground">Upload your school newsletter or magazine</p>
            
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border-2 border-dashed border-indigo-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Download className="text-white" size={28} />
                </div>
                <Input
                  id="newsletter"
                  type="file"
                  accept="application/pdf"
                  onChange={handleNewsletterUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('newsletter')?.click()}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-8"
                >
                  <Upload className="mr-2" size={16} />
                  Upload File
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  PDF only (Max 10MB)
                </p>
              </div>
            </div>

            {formData.newsletterUrl && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-indigo-200">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center shrink-0">
                  <Download className="text-indigo-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Newsletter Uploaded</p>
                  <span className="text-xs text-muted-foreground">PDF file ready</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, newsletterUrl: '' })}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  ×
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Gallery & Documents
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Fees Structure Section
export function FeesSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [feesData, setFeesData] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      if (profile.feesStructure) {
        setFeesData(JSON.stringify(profile.feesStructure, null, 2));
      }
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedFees = null;
    if (feesData.trim()) {
      try {
        parsedFees = JSON.parse(feesData);
      } catch (error) {
        alert('Invalid JSON format for fees structure');
        return;
      }
    }
    
    onSave({ ...formData, feesStructure: parsedFees });
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
            <DollarSign className="text-white" size={20} />
          </div>
          Fees Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feesStructure">Fees Structure (JSON Format)</Label>
            <Textarea
              id="feesStructure"
              value={feesData}
              onChange={(e) => setFeesData(e.target.value)}
              placeholder={`{
  "nursery": { "admission": 5000, "tuition": 25000, "annual": 30000 },
  "primary": { "admission": 7000, "tuition": 35000, "annual": 42000 },
  "secondary": { "admission": 10000, "tuition": 45000, "annual": 55000 }
}`}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter your fees structure in JSON format. You can structure it by class, year, or any other breakdown.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Info size={16} className="text-blue-600" />
              Example Format
            </h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`{
  "nursery": {
    "admission": 5000,
    "tuition": 25000,
    "transport": 8000,
    "books": 3000,
    "uniform": 2000,
    "annual": 43000
  },
  "primary": {
    "admission": 7000,
    "tuition": 35000,
    "transport": 10000,
    "books": 5000,
    "uniform": 3000,
    "annual": 60000
  }
}`}</pre>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Fees Structure
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}