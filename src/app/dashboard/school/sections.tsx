'use client';

import { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Save, MapPin, Globe, Facebook, Instagram, Linkedin,
  Youtube, Phone, Mail, Info, Contact2, Building,
  Image, DollarSign, Link, FileText, Download, School,
  BookOpen, Laptop, Wifi, Video, Shield, Bus, Heart,
  Home, Coffee, Trophy, Upload, GraduationCap, ChevronDown
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
import { Combobox } from '@/components/ui/combobox';
import { CITY_OPTIONS } from '@/lib/indian-cities';

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
  studentTeacherRatio?: string; // NEW
  logoUrl?: string;
  aboutSchool?: string;
  bannerImageUrl?: string;

  // Contact Info
  address?: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
    googleMapUrl?: string;
    latitude?: number;
    longitude?: number;
  
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
  virtualTourVideos?: string[]; // NEW
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [pendingLogoUrl, setPendingLogoUrl] = useState<string>('');
  const [pendingBannerUrl, setPendingBannerUrl] = useState<string>('');

  const hasExistingProfile = profile?.id != null;

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

  const uploadImage = async (dataUrl: string, field: 'logoUrl' | 'bannerImageUrl') => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to upload images');
      return false;
    }

    try {
      const res = await fetch('/api/schools/profile/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: dataUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === 'PROFILE_NOT_FOUND') {
          return 'pending';
        }
        throw new Error(err.error || 'Failed to upload image');
      }

      return true;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      return false;
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploadingLogo(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setLogoPreview(dataUrl);

        if (hasExistingProfile) {
          const result = await uploadImage(dataUrl, 'logoUrl');
          if (result === true) {
            setFormData({ ...formData, logoUrl: dataUrl });
            toast.success('Logo uploaded successfully');
          } else if (result === 'pending') {
            setPendingLogoUrl(dataUrl);
            toast.info('Logo will be saved when you save Basic Info');
          } else {
            setLogoPreview(profile?.logoUrl || '');
          }
        } else {
          setPendingLogoUrl(dataUrl);
          toast.info('Logo will be saved when you save Basic Info');
        }
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploadingBanner(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setBannerPreview(dataUrl);

        if (hasExistingProfile) {
          const result = await uploadImage(dataUrl, 'bannerImageUrl');
          if (result === true) {
            setFormData({ ...formData, bannerImageUrl: dataUrl });
            toast.success('Banner image uploaded successfully');
          } else if (result === 'pending') {
            setPendingBannerUrl(dataUrl);
            toast.info('Banner will be saved when you save Basic Info');
          } else {
            setBannerPreview(profile?.bannerImageUrl || '');
          }
        } else {
          setPendingBannerUrl(dataUrl);
          toast.info('Banner will be saved when you save Basic Info');
        }
        setUploadingBanner(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    if (pendingLogoUrl) {
      setPendingLogoUrl('');
      setLogoPreview('');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/schools/profile/logo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ field: 'logoUrl' }),
      });

      if (res.ok) {
        setLogoPreview('');
        setFormData({ ...formData, logoUrl: '' });
        toast.success('Logo removed');
      }
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  const handleRemoveBanner = async () => {
    if (pendingBannerUrl) {
      setPendingBannerUrl('');
      setBannerPreview('');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/schools/profile/logo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ field: 'bannerImageUrl' }),
      });

      if (res.ok) {
        setBannerPreview('');
        setFormData({ ...formData, bannerImageUrl: '' });
        toast.success('Banner removed');
      }
    } catch (error) {
      toast.error('Failed to remove banner');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // DEBUG: Log the values being submitted
    console.log('[BasicInfo Submit] gender:', formData.gender);
    console.log('[BasicInfo Submit] totalStudents:', formData.totalStudents);
    // Merged from comment: include all relevant fields for basic info
    const basicInfoData: Partial<SchoolProfile> = {
      name: formData.name,
      board: formData.board,
      city: formData.city,
      establishmentYear: formData.establishmentYear,
      schoolType: formData.schoolType,
      k12Level: formData.k12Level,
      gender: formData.gender,
      isInternational: formData.isInternational,
      streamsAvailable: formData.streamsAvailable,
      languages: formData.languages,
      totalStudents: formData.totalStudents,
      totalTeachers: formData.totalTeachers,
      studentTeacherRatio: formData.studentTeacherRatio,
      aboutSchool: formData.aboutSchool,
    };
    if (pendingLogoUrl) {
      basicInfoData.logoUrl = pendingLogoUrl;
    }
    if (pendingBannerUrl) {
      basicInfoData.bannerImageUrl = pendingBannerUrl;
    }
    onSave(basicInfoData);
    setPendingLogoUrl('');
    setPendingBannerUrl('');
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
              <Combobox
                options={CITY_OPTIONS}
                value={formData.city || ''}
                onChange={(value) => setFormData({ ...formData, city: value })}
                placeholder="Select city"
                searchPlaceholder="Search city..."
                emptyMessage="No city found."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board">Board <span className="text-red-500">*</span></Label>
              <Select
                value={formData.board || ''}
                onValueChange={(value) => setFormData({ ...formData, board: value })}
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
                  onChange={(e) => setFormData({ ...formData, establishmentYear: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="e.g. 1995"
                />
              </div>

              {/* MODIFIED: Changed this block as per the comment */}
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
                  <SelectItem value="Day School">Day School</SelectItem>
                  <SelectItem value="Boarding">Boarding</SelectItem>
                  <SelectItem value="Day School & Boarding">Day School & Boarding</SelectItem>
                  <SelectItem value="Govenrment">Govenrment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="k12Level">K-12 School Type</Label>
              {/* changed here */}
              <Select
                value={formData.k12Level || ''}
                onValueChange={(value) => setFormData({ ...formData, k12Level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Play School">Play School</SelectItem>
                  <SelectItem value="KG School">KG School</SelectItem>
                  <SelectItem value="Middle School (Till Class 8)">Middle School (Till Class 8)</SelectItem>
                  <SelectItem value="Secondary (Till Class 10)">Secondary (Till Class 10)</SelectItem>
                  <SelectItem value="Higher Secondary (Till Class 12)">Higher Secondary (Till Class 12)</SelectItem>
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
              <div className="flex flex-wrap gap-3 pt-2">
                {['Arts', 'Commerce', 'Science'].map((stream) => {
                  const currentStreams = formData.streamsAvailable?.split(',').map(s => s.trim()).filter(Boolean) || [];
                  const isSelected = currentStreams.includes(stream);
                  return (
                    <label
                      key={stream}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'bg-white border-gray-200 hover:border-cyan-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          let newStreams = [...currentStreams];
                          if (e.target.checked) {
                            newStreams.push(stream);
                          } else {
                            newStreams = newStreams.filter(s => s !== stream);
                          }
                          setFormData({ ...formData, streamsAvailable: newStreams.join(', ') });
                        }}
                        className="sr-only"
                      />
                      <span className="font-medium">{stream}</span>
                    </label>
                  );
                })}
              </div>
            </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-auto min-h-10 py-2 px-3 hover:bg-white border-2 border-gray-200 focus:border-cyan-500">
                      <div className="flex flex-wrap gap-1 items-center">
                        {formData.languages ? (
                          formData.languages.split(',').map((lang) => (
                            <Badge key={lang.trim()} variant="secondary" className="bg-cyan-100 text-cyan-700 border-0">
                              {lang.trim()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Select Languages</span>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                    {[
                      'English', 'Hindi', 'Assamese', 'Bengali', 'Bodo', 'Dogri', 'Gujarati', 
                      'Kannada', 'Kashmiri', 'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 
                      'Marathi', 'Nepali', 'Odia', 'Punjabi', 'Sanskrit', 'Santali', 'Sindhi', 
                      'Tamil', 'Telugu', 'Urdu'
                    ].map((lang) => {
                      const currentLangs = formData.languages?.split(',').map(l => l.trim()).filter(Boolean) || [];
                      const isSelected = currentLangs.includes(lang);
                      return (
                        <DropdownMenuCheckboxItem
                          key={lang}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            let newLangs = [...currentLangs];
                            if (checked) {
                              if (!newLangs.includes(lang)) newLangs.push(lang);
                            } else {
                              newLangs = newLangs.filter(l => l !== lang);
                            }
                            setFormData({ ...formData, languages: newLangs.join(', ') });
                          }}
                        >
                          {lang}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-xs text-muted-foreground">Select all languages taught at your school</p>
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

            <div className="space-y-2">
              <Label htmlFor="studentTeacherRatio">Student-Teacher Ratio</Label>
              <Input
                id="studentTeacherRatio"
                value={formData.studentTeacherRatio || ''}
                onChange={(e) => setFormData({ ...formData, studentTeacherRatio: e.target.value })}
                placeholder="e.g., 20:1 or 25:1"
              />
              <p className="text-xs text-muted-foreground">Format: Students per Teacher (e.g., 20:1)</p>
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
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('logoUpload')?.click()}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                      disabled={uploadingLogo}
                    >
                      <Upload className="mr-2" size={16} />
                      {uploadingLogo ? 'Uploading...' : logoPreview ? 'Change Logo' : 'Upload Logo Image'}
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveLogo}
                        className="shrink-0"
                        disabled={uploadingLogo}
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
                      disabled={uploadingBanner}
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('bannerImageUrl')?.click()}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      disabled={uploadingBanner}
                    >
                      <Upload className="mr-2" size={16} />
                      {uploadingBanner ? 'Uploading...' : bannerPreview ? 'Change Banner' : 'Upload Banner Image'}
                    </Button>
                    {bannerPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveBanner}
                        className="shrink-0"
                        disabled={uploadingBanner}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Upload PNG, JPG or WEBP (Max 5MB) - Recommended: Wide format image (e.g., 1920x600)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving || uploadingLogo || uploadingBanner}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

/* Contact Info Section */
export function ContactInfoSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapPreviewUrl, setMapPreviewUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      if (profile.googleMapUrl) {
        setMapPreviewUrl(profile.googleMapUrl);
      }
    }
  }, [profile]);

  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) {
      toast.error('Please enter a location to search');
      return;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      // 1. Fetch Geocoding data
      const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(mapSearchQuery)}&key=${apiKey}`);
      const geocodeData = await geocodeRes.json();

      if (geocodeData.status !== 'OK') {
        throw new Error(geocodeData.error_message || 'Could not find location on Google Maps');
      }

      const location = geocodeData.results[0].geometry.location;
      const lat = location.lat;
      const lng = location.lng;

      // 2. Create embed URL with search query
      const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(mapSearchQuery)}`;
      
      setMapPreviewUrl(embedUrl);
      setFormData({ 
        ...formData, 
        googleMapUrl: embedUrl,
        latitude: lat,
        longitude: lng
      });
      
      toast.success(`Location set at ${lat.toFixed(4)}, ${lng.toFixed(4)}! Click "Save Contact Info" to save changes.`);
    } catch (error: any) {
      console.error('Map search error:', error);
      toast.error(error.message || 'Failed to set location');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include required fields from existing profile to ensure validation passes
    const contactInfoData: Partial<SchoolProfile> = {
      name: profile?.name || formData.name, // Include required name
      board: profile?.board || formData.board, // Include required board
      city: formData.city,
      address: formData.address || null,
      state: formData.state || null,
      country: formData.country || null,
      website: formData.website || null,
      contactNumber: formData.contactNumber || null,
      whatsappNumber: formData.whatsappNumber || null,
      email: formData.email || null,
      facebookUrl: formData.facebookUrl || null,
      instagramUrl: formData.instagramUrl || null,
      linkedinUrl: formData.linkedinUrl || null,
      youtubeUrl: formData.youtubeUrl || null,
      googleMapUrl: formData.googleMapUrl || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
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
              <Combobox
                options={CITY_OPTIONS}
                value={formData.city || ''}
                onChange={(value) => setFormData({ ...formData, city: value })}
                placeholder="Select city"
                searchPlaceholder="Search city..."
                emptyMessage="No city found."
                required
              />
            </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state || ''}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                    <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                    <SelectItem value="Assam">Assam</SelectItem>
                    <SelectItem value="Bihar">Bihar</SelectItem>
                    <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                    <SelectItem value="Goa">Goa</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Haryana">Haryana</SelectItem>
                    <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                    <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Kerala">Kerala</SelectItem>
                    <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Manipur">Manipur</SelectItem>
                    <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                    <SelectItem value="Mizoram">Mizoram</SelectItem>
                    <SelectItem value="Nagaland">Nagaland</SelectItem>
                    <SelectItem value="Odisha">Odisha</SelectItem>
                    <SelectItem value="Punjab">Punjab</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="Sikkim">Sikkim</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Telangana">Telangana</SelectItem>
                    <SelectItem value="Tripura">Tripura</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                    <SelectItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</SelectItem>
                    <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                    <SelectItem value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                    <SelectItem value="Ladakh">Ladakh</SelectItem>
                    <SelectItem value="Lakshadweep">Lakshadweep</SelectItem>
                    <SelectItem value="Puducherry">Puducherry</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* NEW: Google Maps Location Picker */}
            <div className="md:col-span-2 space-y-3">
              <Label htmlFor="mapLocation">
                <MapPin className="inline mr-2" size={18} />
                School Location on Google Maps
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Search for your school's location to display an interactive map on your public page
              </p>
              
              <div className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                  <Input
                    id="mapLocation"
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    placeholder="Enter school name and address (e.g., 'XYZ School, City Name')"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleMapSearch();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleMapSearch}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    <MapPin className="mr-2" size={16} />
                    Set Location
                  </Button>
                </div>

                {/* Map Preview */}
                {mapPreviewUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-600">✓ Location Preview</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMapPreviewUrl('');
                          setMapSearchQuery('');
                          setFormData({ ...formData, googleMapUrl: '' });
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Clear Location
                      </Button>
                    </div>
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-purple-300">
                      <iframe
                        src={mapPreviewUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This map will be displayed on your school's public page under the "Location" tab
                    </p>
                  </div>
                )}
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

/* Comprehensive Facilities Section with Tabs */
export function FacilitiesSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [uploadingFacility, setUploadingFacility] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        facilityImages: profile.facilityImages || {}
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!profile?.name || !profile?.city || !profile?.board) {
      toast.error('Please complete Basic Info (Name, Board) and Contact Info (City) sections first before adding facilities');
      return;
    }
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
    };
    onSave(facilitiesData);
  };

  const handleFacilityImageUpload = async (facilityName: string, e: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploadingFacility(facilityName);

      try {
        const readers = validFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        });

        const dataUrls = await Promise.all(readers);

        const token = localStorage.getItem('token');
        const res = await fetch('/api/schools/profile/facility-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ facilityName, imageUrls: dataUrls }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to upload images');
        }

        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          facilityImages: data.facilityImages || {}
        }));
        toast.success(`${dataUrls.length} image(s) uploaded for ${facilityName}`);
      } catch (error: any) {
        console.error('Facility image upload error:', error);
        toast.error(error.message || 'Failed to upload images');
      } finally {
        setUploadingFacility(null);
      }
    }
  };

  const handleRemoveFacilityImage = async (facilityName: string, imageUrl: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/schools/profile/facility-images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ facilityName, imageUrl }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete image');
      }

      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        facilityImages: data.facilityImages || {}
      }));
      toast.success('Image removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image');
    }
  };

  const renderFacilityWithUpload = (
    facilityKey: keyof SchoolProfile,
    facilityLabel: string,
    facilityName: string
  ) => {
    const isEnabled = formData[facilityKey] as boolean || false;
    const isUploading = uploadingFacility === facilityName;

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
                disabled={isUploading}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => document.getElementById(`${facilityName}-upload`)?.click()}
                className="flex-1"
                disabled={isUploading}
              >
                <Upload className="mr-2" size={14} />
                {isUploading ? 'Uploading...' : `Upload Images for ${facilityLabel}`}
              </Button>
            </div>
            {formData.facilityImages?.[facilityName] && formData.facilityImages[facilityName]!.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.facilityImages[facilityName]!.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border">
                    <img src={img} alt={`${facilityLabel} ${idx + 1}`} className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveFacilityImage(facilityName, img)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2" >
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
                  <Label htmlFor="computerCount">No. of Computers</Label>
                  <Input
                    id="computerCount"
                    type="number"
                    value={formData.computerCount || ''}
                    onChange={(e) => setFormData({ ...formData, computerCount: parseInt(e.target.value) })}
                    placeholder="Enter number"
                  />
                </div>

                <div className="space-y-2" />

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
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emergreen-700 text-white px-8"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

/* Gallery & Documents Section - Keeping it simple without validation for now */
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
    // Validate required fields
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

  // NEW: Upload handler for prospectus/newsletter (PDF or image)
  const handleDocumentUpload = (
    key: 'prospectusUrl' | 'newsletterUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isSupported = file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!isSupported) {
      toast.error('Only PDF or image files are allowed');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({ ...prev, [key]: dataUrl }));
      toast.success(`${key === 'prospectusUrl' ? 'Prospectus' : 'Newsletter'} attached`);
    };
    reader.readAsDataURL(file);
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
            <div className="space-y-6">
              {/* Prospectus Upload */}
              <div className="space-y-3">
                <Label>School Prospectus (PDF/Image)</Label>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
                  <div className="flex items-center gap-3">
                    <Input
                      id="prospectusFile"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleDocumentUpload('prospectusUrl', e)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('prospectusFile')?.click()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Upload className="mr-2" size={16} />
                      {formData.prospectusUrl ? 'Replace File' : 'Upload File'}
                    </Button>
                    {formData.prospectusUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={formData.prospectusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:underline font-medium flex items-center gap-1"
                        >
                          <Download size={16} /> View
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData(prev => ({ ...prev, prospectusUrl: '' }))}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  {!formData.prospectusUrl && (
                    <p className="text-xs text-muted-foreground mt-2">Accepts PDF or image files (Max 10MB)</p>
                  )}
                </div>
              </div>
              {/* Newsletter Upload */}
              <div className="space-y-3">
                <Label>Newsletter / Magazine (PDF/Image)</Label>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border-2 border-dashed border-indigo-200">
                  <div className="flex items-center gap-3">
                    <Input
                      id="newsletterFile"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleDocumentUpload('newsletterUrl', e)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('newsletterFile')?.click()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Upload className="mr-2" size={16} />
                      {formData.newsletterUrl ? 'Replace File' : 'Upload File'}
                    </Button>
                    {formData.newsletterUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={formData.newsletterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-700 hover:underline font-medium flex items-center gap-1"
                        >
                          <Download size={16} /> View
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData(prev => ({ ...prev, newsletterUrl: '' }))}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  {!formData.newsletterUrl && (
                    <p className="text-xs text-muted-foreground mt-2">Accepts PDF or image files (Max 10MB)</p>
                  )}
                </div>
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

/* Virtual Tour Section */
export function VirtualTourSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [uploading, setUploading] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');

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
      virtualTourVideos: formData.virtualTourVideos || [],
    };
    onSave(virtualTourData);
  };

  // Add video URL via API
  const handleAddVideoUrl = async () => {
    const url = newVideoUrl.trim();
    if (!url) {
      toast.error('Please enter a video URL');
      return;
    }
    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      toast.error('Please enter a valid URL');
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/schools/profile/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ videoUrl: url }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add video');
      }
      const updated = await res.json();
      setFormData((prev) => ({ ...prev, virtualTourVideos: (updated.virtualTourVideos as string[]) || [] }));
      setNewVideoUrl('');
      toast.success('Video added successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add video');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveVideo = async (url: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/schools/profile/videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ videoUrl: url }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new new Error(err.error || 'Failed to delete video');
      }
      const updated = await res.json();
      setFormData((prev) => ({ ...prev, virtualTourVideos: (updated.virtualTourVideos as string[]) || [] }));
      toast.success('Video removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove video');
    }
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
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Video className="text-white" size={28} />
                </div>
                <div className="w-full max-w-2xl space-y-3">
                  <Label htmlFor="videoUrl">Add Video URL</Label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        id="videoUrl"
                        type="url"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/... or https://youtu.be/... or direct video URL"
                        className="pl-10"
                        disabled={uploading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddVideoUrl();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddVideoUrl}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      disabled={uploading || !newVideoUrl.trim()}
                    >
                      {uploading ? 'Adding...' : 'Add Video'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste YouTube, Vimeo, or direct video URL (e.g., https://www.youtube.com/embed/...)
                  </p>
                </div>
              </div>
              {/* Preview uploaded videos */}
              {formData.virtualTourVideos && formData.virtualTourVideos.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{formData.virtualTourVideos.length} video(s) added</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.virtualTourVideos.map((v, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden border bg-black">
                          {/* Try to render iframe for YouTube/Vimeo links; otherwise use video tag */}
                          {/(youtube\.com|youtu\.be|vimeo\.com)/i.test(v) ? (
                            <iframe
                              src={v}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video src={v} className="w-full h-full" controls />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveVideo(v)}
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How to add videos:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>YouTube:</strong> Get the embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)</li>
                <li><strong>Vimeo:</strong> Use the player URL (e.g., https://player.vimeo.com/video/VIDEO_ID)</li>
                <li><strong>Direct video:</strong> Host your video online and paste the direct URL</li>
                <li>Showcase classrooms, labs, sports facilities, and campus highlights</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving || uploading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

/* Fees Structure Section */
export function FeesSection({ profile, profileLoading, saving, onSave }: SectionProps) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});
  const [fees, setFees] = useState<any>({
    kg: '',
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
          kg: profile.feesStructure.kg || '',
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
    // DEBUG: Log the values being submitted
    console.log('[Fees Submit] fees:', fees);
    // Validate required fields
    if (!profile?.name || !profile?.city || !profile?.board) {
      toast.error('Please complete Basic Info (Name, Board) and Contact Info (City) sections first before adding fees');
      return;
    }
    const feesStructure: any = {};
    const allFeeValues: number[] = [];

    if (fees.kg && fees.kg.toString().trim() !== '') {
      const feeValue = parseFloat(fees.kg);
      feesStructure.kg = feeValue;
      allFeeValues.push(feeValue);
    }

    for (let i = 1; i <= 10; i++) {
      const classKey = `class${i}`;
      const value = fees[classKey];
      if (value && value.toString().trim() !== '') {
        const feeValue = parseFloat(value);
        feesStructure[classKey] = feeValue;
        allFeeValues.push(feeValue);
      }
    }

    if (fees.class11.commerce || fees.class11.arts || fees.class11.science) {
      feesStructure.class11 = {};
      if (fees.class11.commerce) {
        const feeValue = parseFloat(fees.class11.commerce);
        feesStructure.class11.commerce = feeValue;
        allFeeValues.push(feeValue);
      }
      if (fees.class11.arts) {
        const feeValue = parseFloat(fees.class11.arts);
        feesStructure.class11.arts = feeValue;
        allFeeValues.push(feeValue);
      }
      if (fees.class11.science) {
        const feeValue = parseFloat(fees.class11.science);
        feesStructure.class11.science = feeValue;
        allFeeValues.push(feeValue);
      }
    }

    if (fees.class12.commerce || fees.class12.arts || fees.class12.science) {
      feesStructure.class12 = {};
      if (fees.class12.commerce) {
        const feeValue = parseFloat(fees.class12.commerce);
        feesStructure.class12.commerce = feeValue;
        allFeeValues.push(feeValue);
      }
      if (fees.class12.arts) {
        const feeValue = parseFloat(fees.class12.arts);
        feesStructure.class12.arts = feeValue;
        allFeeValues.push(feeValue);
      }
      if (fees.class12.science) {
        const feeValue = parseFloat(fees.class12.science);
        feesStructure.class12.science = feeValue;
        allFeeValues.push(feeValue);
      }
    }

    // Calculate feesMin and feesMax from all entered fees
    let feesMin = null;
    let feesMax = null;
    
    if (allFeeValues.length > 0) {
      feesMin = Math.min(...allFeeValues);
      feesMax = Math.max(...allFeeValues);
    }

    // Include required fields from existing profile to ensure validation passes
    const feesData: Partial<SchoolProfile> = {
      name: profile.name,
      board: profile.board,
      city: profile.city,
      feesStructure,
      feesMin,
      feesMax
    };
    onSave(feesData);
  };

  const handleFeeChange = (key: string, value: string, stream?: string) => {
    if (stream) {
      setFees(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [stream]: value
        }
      }));
    } else {
      setFees(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

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
              KG / Kindergarten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="kg">KG</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="kg"
                    type="number"
                    value={fees.kg}
                    onChange={(e) => handleFeeChange('kg', e.target.value)}
                    placeholder="Annual fees"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t-2 pt-8" />
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
