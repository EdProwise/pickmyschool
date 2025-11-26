'use client';

import { useState, useEffect } from 'react';
import { 
  Save, MapPin, Globe, Facebook, Instagram, Linkedin,
  Youtube, Phone, Mail, Info, Contact2, Building,
  Image, DollarSign, Link, FileText, Download, School,
  BookOpen, Laptop, Wifi, Video, Shield, Bus, Heart,
  Home, Coffee, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo of School (URL)</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
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
  const [newGalleryImage, setNewGalleryImage] = useState('');
  const [newVirtualTour, setNewVirtualTour] = useState('');
  const [newProspectus, setNewProspectus] = useState('');
  const [newNewsletter, setNewNewsletter] = useState('');
  const [newAwardText, setNewAwardText] = useState('');
  const [newAwardImage, setNewAwardImage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddGalleryImage = () => {
    if (newGalleryImage.trim()) {
      const currentImages = formData.galleryImages || [];
      setFormData({ ...formData, galleryImages: [...currentImages, newGalleryImage.trim()] });
      setNewGalleryImage('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentImages = formData.galleryImages || [];
    setFormData({ ...formData, galleryImages: currentImages.filter((_, i) => i !== index) });
  };

  const handleAddAward = () => {
    if (newAwardText.trim() || newAwardImage.trim()) {
      const currentAwards = formData.awards || [];
      const awardEntry = {
        text: newAwardText.trim(),
        image: newAwardImage.trim()
      };
      setFormData({ ...formData, awards: [...currentAwards, JSON.stringify(awardEntry)] });
      setNewAwardText('');
      setNewAwardImage('');
    }
  };

  const handleRemoveAward = (index: number) => {
    const currentAwards = formData.awards || [];
    setFormData({ ...formData, awards: currentAwards.filter((_, i) => i !== index) });
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
            <Label className="text-base font-semibold">Images of School</Label>
            
            {/* Add New Image */}
            <div className="flex gap-2">
              <Input
                value={newGalleryImage}
                onChange={(e) => setNewGalleryImage(e.target.value)}
                placeholder="Enter image URL to upload"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddGalleryImage}
                variant="outline"
                className="shrink-0"
              >
                <FileText className="mr-2" size={16} />
                Upload
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Enter the URL of your school images</p>

            {/* Display Uploaded Images */}
            {formData.galleryImages && formData.galleryImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {formData.galleryImages.map((img, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Image className="text-cyan-600 shrink-0" size={20} />
                    <span className="text-sm flex-1 truncate">{img}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-6" />

          {/* Virtual Tour */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Virtual Tour of School</Label>
            <div className="flex gap-2">
              <Input
                value={newVirtualTour}
                onChange={(e) => setNewVirtualTour(e.target.value)}
                placeholder="Enter virtual tour URL"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  if (newVirtualTour.trim()) {
                    setFormData({ ...formData, virtualTourUrl: newVirtualTour.trim() });
                    setNewVirtualTour('');
                  }
                }}
                variant="outline"
                className="shrink-0"
              >
                <Video className="mr-2" size={16} />
                Upload
              </Button>
            </div>
            {formData.virtualTourUrl && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <Video className="text-cyan-600 shrink-0" size={20} />
                <span className="text-sm flex-1 truncate">{formData.virtualTourUrl}</span>
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

          <div className="border-t pt-6" />

          {/* Prospectus */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Prospectus (PDF)</Label>
            <div className="flex gap-2">
              <Input
                value={newProspectus}
                onChange={(e) => setNewProspectus(e.target.value)}
                placeholder="Enter prospectus PDF URL"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  if (newProspectus.trim()) {
                    setFormData({ ...formData, prospectusUrl: newProspectus.trim() });
                    setNewProspectus('');
                  }
                }}
                variant="outline"
                className="shrink-0"
              >
                <FileText className="mr-2" size={16} />
                Upload
              </Button>
            </div>
            {formData.prospectusUrl && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <FileText className="text-cyan-600 shrink-0" size={20} />
                <span className="text-sm flex-1 truncate">{formData.prospectusUrl}</span>
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

          <div className="border-t pt-6" />

          {/* Awards - Text and Image */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Awards</Label>
            
            {/* Add New Award */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="awardText" className="text-sm">Award Title/Description</Label>
                <Input
                  id="awardText"
                  value={newAwardText}
                  onChange={(e) => setNewAwardText(e.target.value)}
                  placeholder="e.g., National Excellence Award 2023"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awardImage" className="text-sm">Award Certificate/Image (URL)</Label>
                <Input
                  id="awardImage"
                  value={newAwardImage}
                  onChange={(e) => setNewAwardImage(e.target.value)}
                  placeholder="Enter image URL for award certificate"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddAward}
                variant="outline"
                className="w-full"
              >
                <FileText className="mr-2" size={16} />
                Add Award
              </Button>
            </div>

            {/* Display Awards */}
            {formData.awards && formData.awards.length > 0 && (
              <div className="space-y-3 mt-4">
                {formData.awards.map((award, index) => {
                  const parsedAward = parseAward(award);
                  return (
                    <div key={index} className="p-4 bg-white rounded-lg border space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          {parsedAward.text && (
                            <div className="flex items-start gap-2">
                              <Trophy className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                              <span className="text-sm font-medium">{parsedAward.text}</span>
                            </div>
                          )}
                          {parsedAward.image && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Image className="text-cyan-600 shrink-0" size={16} />
                              <span className="truncate">{parsedAward.image}</span>
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

          <div className="border-t pt-6" />

          {/* Newsletter */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Newsletter / Magazine</Label>
            <div className="flex gap-2">
              <Input
                value={newNewsletter}
                onChange={(e) => setNewNewsletter(e.target.value)}
                placeholder="Enter newsletter/magazine URL"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  if (newNewsletter.trim()) {
                    setFormData({ ...formData, newsletterUrl: newNewsletter.trim() });
                    setNewNewsletter('');
                  }
                }}
                variant="outline"
                className="shrink-0"
              >
                <Download className="mr-2" size={16} />
                Upload
              </Button>
            </div>
            {formData.newsletterUrl && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <Download className="text-cyan-600 shrink-0" size={20} />
                <span className="text-sm flex-1 truncate">{formData.newsletterUrl}</span>
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
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