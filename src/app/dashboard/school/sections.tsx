'use client';

import { useState, useEffect } from 'react';
import { 
  Save, MapPin, Globe, Facebook, Instagram, Linkedin,
  Youtube, Phone, Mail, Info, Contact2, Building,
  Image, DollarSign, Link, FileText, Download, School,
  BookOpen, Laptop, Wifi, Video, Shield, Bus, Heart,
  Home, Coffee, Trophy, Upload, GraduationCap
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
  aboutSchool?: string;
  bannerImageUrl?: string;
  
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
  facilityImages?: Record<string, string[]>;
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
  const [bannerPreview, setBannerPreview] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      if (profile.logoUrl) {
        setLogoPreview(profile.logoUrl);
      }
      if (profile.bannerImageUrl) {
        setBannerPreview(profile.bannerImageUrl);
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

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setBannerPreview(dataUrl);
        setFormData({ ...formData, bannerImageUrl: dataUrl });
        toast.success('Banner image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Include required fields from existing profile to ensure validation passes
    const basicInfoData: Partial<SchoolProfile> = {
      name: formData.name,
      board: formData.board,
      city: profile?.city || formData.city,
      establishmentYear: formData.establishmentYear,
      schoolType: formData.schoolType,
      k12Level: formData.k12Level,
      gender: formData.gender,
      isInternational: formData.isInternational,
      streamsAvailable: formData.streamsAvailable,
      languages: formData.languages,
      totalStudents: formData.totalStudents,
      totalTeachers: formData.totalTeachers,
      logoUrl: formData.logoUrl,
      aboutSchool: formData.aboutSchool,
      bannerImageUrl: formData.bannerImageUrl,
    };
    
    onSave(basicInfoData);
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

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="aboutSchool">About the School</Label>
              <Textarea
                id="aboutSchool"
                value={formData.aboutSchool || ''}
                onChange={(e) => setFormData({ ...formData, aboutSchool: e.target.value })}
                placeholder="Enter a brief description of your school, its history, mission, and values..."
                rows={5}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="bannerImageUrl">Banner Image</Label>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
                <div className="flex flex-col items-center gap-4">
                  {bannerPreview && (
                    <div className="relative w-full max-w-2xl h-48 rounded-xl overflow-hidden border-2 border-purple-300 shadow-lg">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover bg-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 w-full">
                    <Input
                      id="bannerImageUrl"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('bannerImageUrl')?.click()}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      <Upload className="mr-2" size={16} />
                      {bannerPreview ? 'Change Banner' : 'Upload Banner Image'}
                    </Button>
                    {bannerPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setBannerPreview('');
                          setFormData({ ...formData, bannerImageUrl: '' });
                        }}
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Upload PNG, JPG or WEBP (Max 5MB) • Recommended: Wide format image (e.g., 1920x600)
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
    
    // Include required fields from existing profile to ensure validation passes
    const contactInfoData: Partial<SchoolProfile> = {
      name: profile?.name || formData.name, // Include required name
      board: profile?.board || formData.board, // Include required board
      city: formData.city,
      address: formData.address,
      state: formData.state,
      country: formData.country,
      website: formData.website,
      contactNumber: formData.contactNumber,
      whatsappNumber: formData.whatsappNumber,
      email: formData.email,
      facebookUrl: formData.facebookUrl,
      instagramUrl: formData.instagramUrl,
      linkedinUrl: formData.linkedinUrl,
      youtubeUrl: formData.youtubeUrl,
      googleMapUrl: formData.googleMapUrl,
    };
    
    onSave(contactInfoData);
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
    
    // Validate required basic fields first
    if (!profile?.name || !profile?.city || !profile?.board) {
      toast.error('Please complete Basic Info (Name, Board) and Contact Info (City) sections first before adding facilities');
      return;
    }
    
    // Include required fields from existing profile to ensure validation passes
    const facilitiesData: Partial<SchoolProfile> = {
      name: profile.name,
      board: profile.board,
      city: profile.city,
      classroomType: formData.classroomType,
      hasLibrary: formData.hasLibrary,
      hasComputerLab: formData.hasComputerLab,
      computerCount: formData.computerCount,
      hasPhysicsLab: formData.hasPhysicsLab,
      hasChemistryLab: formData.hasChemistryLab,
      hasBiologyLab: formData.hasBiologyLab,
      hasMathsLab: formData.hasMathsLab,
      hasLanguageLab: formData.hasLanguageLab,
      hasRoboticsLab: formData.hasRoboticsLab,
      hasStemLab: formData.hasStemLab,
      hasAuditorium: formData.hasAuditorium,
      hasPlayground: formData.hasPlayground,
      sportsFacilities: formData.sportsFacilities,
      hasSwimmingPool: formData.hasSwimmingPool,
      hasFitnessCentre: formData.hasFitnessCentre,
      hasYoga: formData.hasYoga,
      hasMartialArts: formData.hasMartialArts,
      hasMusicDance: formData.hasMusicDance,
      hasHorseRiding: formData.hasHorseRiding,
      hasSmartBoard: formData.hasSmartBoard,
      hasWifi: formData.hasWifi,
      hasCctv: formData.hasCctv,
      hasElearning: formData.hasElearning,
      hasAcClassrooms: formData.hasAcClassrooms,
      hasAiTools: formData.hasAiTools,
      hasTransport: formData.hasTransport,
      hasGpsBuses: formData.hasGpsBuses,
      hasCctvBuses: formData.hasCctvBuses,
      hasBusCaretaker: formData.hasBusCaretaker,
      hasMedicalRoom: formData.hasMedicalRoom,
      hasDoctorNurse: formData.hasDoctorNurse,
      hasFireSafety: formData.hasFireSafety,
      hasCleanWater: formData.hasCleanWater,
      hasSecurityGuards: formData.hasSecurityGuards,
      hasAirPurifier: formData.hasAirPurifier,
      hasHostel: formData.hasHostel,
      hasMess: formData.hasMess,
      hasHostelStudyRoom: formData.hasHostelStudyRoom,
      hasAcHostel: formData.hasAcHostel,
      hasCafeteria: formData.hasCafeteria,
      // Intentionally skip facilityImages in PUT to avoid large payload errors
    };
    
    onSave(facilitiesData);
  };

  // Handle facility image upload
  const handleFacilityImageUpload = (facilityName: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
        const currentFacilityImages = formData.facilityImages || {};
        const currentImages = currentFacilityImages[facilityName] || [];
        const updatedFacilityImages = {
          ...currentFacilityImages,
          [facilityName]: [...currentImages, ...dataUrls]
        };
        setFormData({ ...formData, facilityImages: updatedFacilityImages });
        toast.success(`${dataUrls.length} image(s) uploaded for ${facilityName}`);
      });
    }
  };

  // Render facility with image upload
  const renderFacilityWithUpload = (
    facilityKey: keyof SchoolProfile,
    facilityLabel: string,
    facilityName: string
  ) => {
    const isEnabled = formData[facilityKey] as boolean || false;

    return (
      <div className="md:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <Label>{facilityLabel}</Label>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => setFormData({ ...formData, [facilityKey]: checked })}
          />
        </div>

        {isEnabled && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Input
                id={`${facilityName}-upload`}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFacilityImageUpload(facilityName, e)}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => document.getElementById(`${facilityName}-upload`)?.click()}
                className="flex-1"
              >
                <Upload className="mr-2" size={14} />
                Upload Images for {facilityLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
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
                  <Label htmlFor="computerCount">No. of Computers</Label>
                  <Input
                    id="computerCount"
                    type="number"
                    value={formData.computerCount || ''}
                    onChange={(e) => setFormData({ ...formData, computerCount: parseInt(e.target.value) })}
                    placeholder="Enter number"
                  />
                </div>

                {renderFacilityWithUpload('hasLibrary', 'Library', 'Library')}
                {renderFacilityWithUpload('hasComputerLab', 'Computer Lab', 'ComputerLab')}
                {renderFacilityWithUpload('hasPhysicsLab', 'Physics Lab', 'PhysicsLab')}
                {renderFacilityWithUpload('hasChemistryLab', 'Chemistry Lab', 'ChemistryLab')}
                {renderFacilityWithUpload('hasBiologyLab', 'Biology Lab', 'BiologyLab')}
                {renderFacilityWithUpload('hasMathsLab', 'Maths Lab', 'MathsLab')}
                {renderFacilityWithUpload('hasLanguageLab', 'Language Lab', 'LanguageLab')}
                {renderFacilityWithUpload('hasRoboticsLab', 'Robotics Lab', 'RoboticsLab')}
                {renderFacilityWithUpload('hasStemLab', 'STEM/Innovation Lab', 'StemLab')}
                {renderFacilityWithUpload('hasAuditorium', 'Auditorium Hall', 'Auditorium')}
              </div>
            </TabsContent>

            {/* Sports & Fitness Tab */}
            <TabsContent value="sports" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-2" />

                {renderFacilityWithUpload('hasPlayground', 'Playground', 'Playground')}
                {renderFacilityWithUpload('hasSwimmingPool', 'Swimming Pool', 'SwimmingPool')}
                {renderFacilityWithUpload('hasFitnessCentre', 'Fitness Centre', 'FitnessCentre')}
                {renderFacilityWithUpload('hasYoga', 'Yoga', 'Yoga')}
                {renderFacilityWithUpload('hasMartialArts', 'Martial Arts Training', 'MartialArts')}
                {renderFacilityWithUpload('hasMusicDance', 'Music & Dance Class', 'MusicDance')}
                {renderFacilityWithUpload('hasHorseRiding', 'Horse Riding / Archery / Shooting Range', 'HorseRiding')}
              </div>
            </TabsContent>

            {/* Technology & Digital Tab */}
            <TabsContent value="technology" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFacilityWithUpload('hasSmartBoard', 'Smart Board', 'SmartBoard')}
                {renderFacilityWithUpload('hasWifi', 'WiFi Campus', 'Wifi')}
                {renderFacilityWithUpload('hasCctv', 'CCTV System', 'CCTV')}
                {renderFacilityWithUpload('hasElearning', 'E-Learning Platform', 'Elearning')}
                {renderFacilityWithUpload('hasAcClassrooms', 'Air Conditioned Classrooms', 'AcClassrooms')}
                {renderFacilityWithUpload('hasAiTools', 'AI Enable Learning Tools', 'AiTools')}
              </div>
            </TabsContent>

            {/* Transport Tab */}
            <TabsContent value="transport" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFacilityWithUpload('hasTransport', 'School Bus/Vans', 'Transport')}
                {renderFacilityWithUpload('hasGpsBuses', 'GPS Enabled Buses', 'GpsBuses')}
                {renderFacilityWithUpload('hasCctvBuses', 'CCTV in Buses', 'CctvBuses')}
                {renderFacilityWithUpload('hasBusCaretaker', 'Caretaker in Bus', 'BusCaretaker')}
              </div>
            </TabsContent>

            {/* Health & Safety Tab */}
            <TabsContent value="health" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFacilityWithUpload('hasMedicalRoom', 'Medical Room', 'MedicalRoom')}
                {renderFacilityWithUpload('hasDoctorNurse', 'On Campus Doctor/Nurse', 'DoctorNurse')}
                {renderFacilityWithUpload('hasFireSafety', 'Fire Safety', 'FireSafety')}
                {renderFacilityWithUpload('hasCleanWater', 'Clean Drinking Water', 'CleanWater')}
                {renderFacilityWithUpload('hasSecurityGuards', 'Security Guards', 'SecurityGuards')}
                {renderFacilityWithUpload('hasAirPurifier', 'Air Purifier in Classroom', 'AirPurifier')}
              </div>
            </TabsContent>

            {/* Boarding Tab */}
            <TabsContent value="boarding" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFacilityWithUpload('hasHostel', 'Hostel', 'Hostel')}
                {renderFacilityWithUpload('hasMess', 'Mess', 'Mess')}
                {renderFacilityWithUpload('hasHostelStudyRoom', 'Study Room in Hostel', 'HostelStudyRoom')}
                {renderFacilityWithUpload('hasAcHostel', 'Air Conditioner Hostel', 'AcHostel')}
              </div>
            </TabsContent>

            {/* Others Tab */}
            <TabsContent value="others" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFacilityWithUpload('hasCafeteria', 'Cafeteria', 'Cafeteria')}
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

// Gallery & Documents Section - Keeping it simple without validation for now
export function GallerySection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [newAwardText, setNewAwardText] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required basic fields first
    if (!profile?.name || !profile?.city || !profile?.board) {
      toast.error('Please complete Basic Info (Name, Board) and Contact Info (City) sections first before adding gallery');
      return;
    }

    // Don't upload images here, they're already uploaded via handleGalleryImagesUpload
    // Just save metadata
    const galleryData: Partial<SchoolProfile> = {
      name: profile.name,
      board: profile.board,
      city: profile.city,
      prospectusUrl: formData.prospectusUrl,
      awards: formData.awards,
      newsletterUrl: formData.newsletterUrl,
    };
    
    onSave(galleryData);
  };

  const handleGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploading(true);
      try {
        const readers = validFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        });

        const dataUrls = await Promise.all(readers);

        // Upload images via dedicated API in chunks
        const token = localStorage.getItem('token');
        const chunkSize = 2;
        for (let i = 0; i < dataUrls.length; i += chunkSize) {
          const chunk = dataUrls.slice(i, i + chunkSize);
          const res = await fetch('/api/schools/profile/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ imageUrls: chunk }),
          });
          
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to upload images');
          }
          
          // Update local formData with response
          const updatedProfile = await res.json();
          setFormData(prev => ({
            ...prev,
            galleryImages: updatedProfile.galleryImages || []
          }));
        }
        
        toast.success(`${dataUrls.length} image(s) uploaded successfully`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload images');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveGalleryImage = async (index: number) => {
    const currentImages = formData.galleryImages || [];
    const imageToRemove = currentImages[index];
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/schools/profile/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageUrl: imageToRemove }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete image');
      }
      
      setFormData(prev => ({
        ...prev,
        galleryImages: currentImages.filter((_, i) => i !== index)
      }));
      toast.success('Image removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove image');
    }
  };

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
            <p className="text-sm text-muted-foreground">Upload multiple images of your school campus</p>
            
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
                  disabled={uploading}
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('galleryImages')?.click()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8"
                  disabled={uploading}
                >
                  <Upload className="mr-2" size={16} />
                  {uploading ? 'Uploading...' : 'Select Images to Upload'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  PNG, JPG or WEBP (Max 5MB per image)
                </p>
              </div>
            </div>

            {formData.galleryImages && formData.galleryImages.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{formData.galleryImages.length} image(s) uploaded</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.galleryImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
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

          {/* Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-600" size={20} />
              <Label className="text-base font-semibold">Documents</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prospectusUrl">School Prospectus URL</Label>
                <Input
                  id="prospectusUrl"
                  value={formData.prospectusUrl || ''}
                  onChange={(e) => setFormData({ ...formData, prospectusUrl: e.target.value })}
                  placeholder="https://example.com/prospectus.pdf"
                />
                <p className="text-xs text-muted-foreground">Link to downloadable prospectus</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletterUrl">Newsletter / Magazine URL</Label>
                <Input
                  id="newsletterUrl"
                  value={formData.newsletterUrl || ''}
                  onChange={(e) => setFormData({ ...formData, newsletterUrl: e.target.value })}
                  placeholder="https://example.com/newsletter.pdf"
                />
                <p className="text-xs text-muted-foreground">Link to downloadable newsletter or magazine</p>
              </div>
            </div>
          </div>

          <div className="border-t-2 pt-8" />

          {/* Awards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-600" size={20} />
              <Label className="text-base font-semibold">Awards & Achievements</Label>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-dashed border-yellow-300 space-y-4">
              <div className="space-y-3">
                <Input
                  id="awardText"
                  value={newAwardText}
                  onChange={(e) => setNewAwardText(e.target.value)}
                  placeholder="Award Title / Description"
                  className="bg-white"
                />
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
                </div>
              </div>
            </div>

            {formData.awards && formData.awards.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{formData.awards.length} award(s) added</p>
                {formData.awards.map((award, index) => {
                  const parsedAward = parseAward(award);
                  return (
                    <div key={index} className="p-4 bg-white rounded-lg border-2 border-yellow-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          {parsedAward.text && <p className="text-sm font-semibold">{parsedAward.text}</p>}
                          {parsedAward.image && (
                            <div className="w-full max-w-xs rounded-lg overflow-hidden border-2 border-gray-200">
                              <img src={parsedAward.image} alt="Award" className="w-full h-auto" />
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAward(index)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
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

          <div className="flex justify-end gap-3 pt-6 border-t-2">
            <Button
              type="submit"
              disabled={saving || uploading}
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

// Virtual Tour Section
export function VirtualTourSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required basic fields first
    if (!profile?.name || !profile?.city || !profile?.board) {
      toast.error('Please complete Basic Info (Name, Board) and Contact Info (City) sections first');
      return;
    }
    
    const virtualTourData: Partial<SchoolProfile> = {
      name: profile.name,
      board: profile.board,
      city: profile.city,
      virtualTourUrl: formData.virtualTourUrl,
    };
    
    onSave(virtualTourData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
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
            <Video className="text-white" size={20} />
          </div>
          Virtual Tour
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Video className="text-white" size={28} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="virtualTourUrl">Virtual Tour Video URL</Label>
                  <Input
                    id="virtualTourUrl"
                    value={formData.virtualTourUrl || ''}
                    onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                    placeholder="https://youtube.com/... or https://vimeo.com/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a link to your school's virtual tour video (YouTube, Vimeo, or direct video link)
                  </p>
                </div>

                {formData.virtualTourUrl && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <p className="text-sm font-semibold mb-2">Preview:</p>
                    <a 
                      href={formData.virtualTourUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline break-all"
                    >
                      {formData.virtualTourUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Tips for a Great Virtual Tour:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Upload your virtual tour video to YouTube or Vimeo first</li>
                <li>Ensure the video showcases classrooms, labs, sports facilities, and campus</li>
                <li>Include narration or captions explaining key features</li>
                <li>Keep the video engaging (5-10 minutes is ideal)</li>
                <li>Make sure the video is set to public or unlisted (not private)</li>
              </ul>
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
                  Save Virtual Tour
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
  const [fees, setFees] = useState<any>({
    class1: '',
    class2: '',
    class3: '',
    class4: '',
    class5: '',
    class6: '',
    class7: '',
    class8: '',
    class9: '',
    class10: '',
    class11: { commerce: '', arts: '', science: '' },
    class12: { commerce: '', arts: '', science: '' }
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      if (profile.feesStructure) {
        setFees({
          class1: profile.feesStructure.class1 || '',
          class2: profile.feesStructure.class2 || '',
          class3: profile.feesStructure.class3 || '',
          class4: profile.feesStructure.class4 || '',
          class5: profile.feesStructure.class5 || '',
          class6: profile.feesStructure.class6 || '',
          class7: profile.feesStructure.class7 || '',
          class8: profile.feesStructure.class8 || '',
          class9: profile.feesStructure.class9 || '',
          class10: profile.feesStructure.class10 || '',
          class11: {
            commerce: profile.feesStructure.class11?.commerce || '',
            arts: profile.feesStructure.class11?.arts || '',
            science: profile.feesStructure.class11?.science || ''
          },
          class12: {
            commerce: profile.feesStructure.class12?.commerce || '',
            arts: profile.feesStructure.class12?.arts || '',
            science: profile.feesStructure.class12?.science || ''
          }
        });
      }
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required basic fields first
    if (!profile?.name || !profile?.city || !profile?.board) {
      toast.error('Please complete Basic Info (Name, Board) and Contact Info (City) sections first before adding fees');
      return;
    }
    
    const feesStructure: any = {};
    
    for (let i = 1; i <= 10; i++) {
      const classKey = `class${i}`;
      const value = fees[classKey];
      if (value && value.toString().trim() !== '') {
        feesStructure[classKey] = parseFloat(value);
      }
    }
    
    if (fees.class11.commerce || fees.class11.arts || fees.class11.science) {
      feesStructure.class11 = {};
      if (fees.class11.commerce) feesStructure.class11.commerce = parseFloat(fees.class11.commerce);
      if (fees.class11.arts) feesStructure.class11.arts = parseFloat(fees.class11.arts);
      if (fees.class11.science) feesStructure.class11.science = parseFloat(fees.class11.science);
    }
    
    if (fees.class12.commerce || fees.class12.arts || fees.class12.science) {
      feesStructure.class12 = {};
      if (fees.class12.commerce) feesStructure.class12.commerce = parseFloat(fees.class12.commerce);
      if (fees.class12.arts) feesStructure.class12.arts = parseFloat(fees.class12.arts);
      if (fees.class12.science) feesStructure.class12.science = parseFloat(fees.class12.science);
    }
    
    // Include required fields from existing profile to ensure validation passes
    const feesData: Partial<SchoolProfile> = {
      name: profile.name,
      board: profile.board,
      city: profile.city,
      feesStructure
    };
    
    onSave(feesData);
  };

  const handleFeeChange = (classKey: string, value: string, stream?: string) => {
    if (stream) {
      setFees({ ...fees, [classKey]: { ...fees[classKey], [stream]: value } });
    } else {
      setFees({ ...fees, [classKey]: value });
    }
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
          Annual Fees Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <School className="text-cyan-600" size={20} />
              Class 1 to 10
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                <div key={classNum} className="space-y-2">
                  <Label htmlFor={`class${classNum}`}>Class {classNum}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id={`class${classNum}`}
                      type="number"
                      value={fees[`class${classNum}`]}
                      onChange={(e) => handleFeeChange(`class${classNum}`, e.target.value)}
                      placeholder="Annual fees"
                      className="pl-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 pt-8" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Class 11 (Stream-wise)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['commerce', 'arts', 'science'].map((stream) => (
                <div key={stream} className="space-y-2">
                  <Label className="capitalize">{stream}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      value={fees.class11[stream]}
                      onChange={(e) => handleFeeChange('class11', e.target.value, stream)}
                      placeholder="Annual fees"
                      className="pl-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 pt-8" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Class 12 (Stream-wise)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['commerce', 'arts', 'science'].map((stream) => (
                <div key={stream} className="space-y-2">
                  <Label className="capitalize">{stream}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      value={fees.class12[stream]}
                      onChange={(e) => handleFeeChange('class12', e.target.value, stream)}
                      placeholder="Annual fees"
                      className="pl-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8"
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