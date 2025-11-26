'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Star, IndianRupee, Phone, Mail, Calendar, Users, 
  CheckCircle2, Heart, Share2, Bookmark, MessageCircle, ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getSchoolById, submitEnquiry, type School } from '@/lib/api';
import { toast } from 'sonner';

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = parseInt(params.id as string);
  
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentClass: '',
    message: '',
  });

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  const loadSchool = async () => {
    try {
      const data = await getSchoolById(schoolId);
      setSchool(data);
    } catch (error) {
      console.error('Failed to load school:', error);
      toast.error('Failed to load school details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to submit an enquiry');
      router.push('/login');
      return;
    }

    setSubmittingEnquiry(true);
    try {
      await submitEnquiry(token, {
        schoolId,
        ...enquiryForm,
      });
      
      toast.success('Enquiry submitted successfully! The school will contact you soon.');
      setEnquiryForm({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        studentClass: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-6" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">School not found</h1>
          <Button onClick={() => router.push('/schools')}>
            Back to Schools
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20">
        {/* Hero Banner */}
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-blue-500 to-indigo-600">
          {school.bannerImage ? (
            <img
              src={school.bannerImage}
              alt={school.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
              {school.logo && (
                <img
                  src={school.logo}
                  alt={school.name}
                  className="max-h-48 max-w-md object-contain"
                />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Main Info */}
            <div className="flex-1">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="mr-2" size={18} />
                    Back
                  </Button>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {school.name}
                      </h1>
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin size={18} className="mr-1" />
                        <span>
                          {school.address && `${school.address}, `}
                          {school.city}
                          {school.state && `, ${school.state}`}
                          {school.pincode && ` - ${school.pincode}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-base">
                      {school.board}
                    </Badge>
                    {school.schoolType && (
                      <Badge variant="outline" className="text-base">
                        {school.schoolType}
                      </Badge>
                    )}
                    {school.medium && (
                      <Badge variant="outline" className="text-base">
                        {school.medium}
                      </Badge>
                    )}
                    {school.featured && (
                      <Badge style={{ backgroundColor: '#04d3d3', color: 'white' }}>
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Star className="mx-auto mb-1 text-yellow-400" size={24} />
                      <div className="font-bold text-lg">{school.rating}</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                    
                    {school.establishmentYear && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="mx-auto mb-1" size={24} style={{ color: '#04d3d3' }} />
                        <div className="font-bold text-lg">{school.establishmentYear}</div>
                        <div className="text-sm text-muted-foreground">Est. Year</div>
                      </div>
                    )}
                    
                    {school.studentTeacherRatio && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="mx-auto mb-1 text-blue-500" size={24} />
                        <div className="font-bold text-lg">{school.studentTeacherRatio}</div>
                        <div className="text-sm text-muted-foreground">Student:Teacher</div>
                      </div>
                    )}
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <IndianRupee className="mx-auto mb-1 text-green-500" size={24} />
                      <div className="font-bold text-lg">
                        {school.feesMin && school.feesMax
                          ? `${(school.feesMin / 1000).toFixed(0)}-${(school.feesMax / 1000).toFixed(0)}K`
                          : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual Fees</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      style={{ backgroundColor: '#04d3d3', color: 'white' }}
                      onClick={() => setActiveTab('enquire')}
                    >
                      <MessageCircle className="mr-2" size={18} />
                      Enquire Now
                    </Button>
                    <Button size="lg" variant="outline">
                      <Bookmark className="mr-2" size={18} />
                      Save School
                    </Button>
                    <Button size="lg" variant="outline">
                      <Share2 className="mr-2" size={18} />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full flex-wrap h-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="facilities">Facilities</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="fees">Fees</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="enquire">Enquire</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">About the School</h2>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {school.description || 'No description available.'}
                      </p>

                      <Separator className="my-6" />

                      <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold">Board:</span>{' '}
                          <span className="text-muted-foreground">{school.board}</span>
                        </div>
                        {school.medium && (
                          <div>
                            <span className="font-semibold">Medium:</span>{' '}
                            <span className="text-muted-foreground">{school.medium}</span>
                          </div>
                        )}
                        {school.classesOffered && (
                          <div>
                            <span className="font-semibold">Classes Offered:</span>{' '}
                            <span className="text-muted-foreground">{school.classesOffered}</span>
                          </div>
                        )}
                        {school.schoolType && (
                          <div>
                            <span className="font-semibold">School Type:</span>{' '}
                            <span className="text-muted-foreground">{school.schoolType}</span>
                          </div>
                        )}
                        {school.establishmentYear && (
                          <div>
                            <span className="font-semibold">Establishment Year:</span>{' '}
                            <span className="text-muted-foreground">{school.establishmentYear}</span>
                          </div>
                        )}
                        {school.studentTeacherRatio && (
                          <div>
                            <span className="font-semibold">Student-Teacher Ratio:</span>{' '}
                            <span className="text-muted-foreground">{school.studentTeacherRatio}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Facilities Tab */}
                <TabsContent value="facilities">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Facilities & Infrastructure</h2>
                      {school.facilities && school.facilities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {school.facilities.map((facility, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                            >
                              <CheckCircle2 size={20} style={{ color: '#04d3d3' }} />
                              <span>{facility}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No facilities information available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">School Gallery</h2>
                      {school.gallery && school.gallery.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {school.gallery.map((image, index) => (
                            <div
                              key={index}
                              className="aspect-video rounded-lg overflow-hidden"
                            >
                              <img
                                src={image}
                                alt={`${school.name} - Image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No gallery images available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fees Tab */}
                <TabsContent value="fees">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Fee Structure</h2>
                      {school.feesMin && school.feesMax ? (
                        <div>
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg mb-4">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-2">
                                Annual Fees Range
                              </div>
                              <div className="text-3xl font-bold" style={{ color: '#04d3d3' }}>
                                ₹{school.feesMin.toLocaleString()} - ₹{school.feesMax.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground mt-2">
                                per year
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            * Fees may vary based on class and additional services. Please contact the
                            school for detailed fee structure and payment plans.
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Fee information not available. Please contact the school directly.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>
                      <div className="text-center py-12">
                        <div className="mb-4">
                          <div className="text-5xl font-bold mb-2">{school.rating}</div>
                          <div className="flex justify-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-6 h-6 ${
                                  i < Math.floor(school.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-muted-foreground">
                            Based on {school.reviewCount} reviews
                          </div>
                        </div>
                        <Separator className="my-6" />
                        <p className="text-muted-foreground">
                          Detailed reviews coming soon. Be the first to review this school!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Location</h2>
                      <div className="mb-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="mt-1" size={20} style={{ color: '#04d3d3' }} />
                          <div>
                            {school.address && <p>{school.address}</p>}
                            <p>
                              {school.city}
                              {school.state && `, ${school.state}`}
                              {school.pincode && ` - ${school.pincode}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Map view coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Enquire Tab */}
                <TabsContent value="enquire">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Enquire Now</h2>
                      <p className="text-muted-foreground mb-6">
                        Fill out the form below and the school will get back to you shortly.
                      </p>

                      <form onSubmit={handleEnquirySubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="studentName">Student Name *</Label>
                          <Input
                            id="studentName"
                            required
                            value={enquiryForm.studentName}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentName: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="studentEmail">Email *</Label>
                          <Input
                            id="studentEmail"
                            type="email"
                            required
                            value={enquiryForm.studentEmail}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentEmail: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="studentPhone">Phone Number *</Label>
                          <Input
                            id="studentPhone"
                            type="tel"
                            required
                            value={enquiryForm.studentPhone}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentPhone: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="studentClass">Class/Grade *</Label>
                          <Input
                            id="studentClass"
                            required
                            placeholder="e.g., 6th Grade"
                            value={enquiryForm.studentClass}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentClass: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            rows={4}
                            placeholder="Any specific questions or requirements..."
                            value={enquiryForm.message}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, message: e.target.value })
                            }
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          style={{ backgroundColor: '#04d3d3', color: 'white' }}
                          disabled={submittingEnquiry}
                        >
                          {submittingEnquiry ? 'Submitting...' : 'Submit Enquiry'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Contact & Quick Actions */}
            <div className="lg:w-96">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  
                  {school.contactPhone && (
                    <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Phone size={20} style={{ color: '#04d3d3' }} className="mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <a
                          href={`tel:${school.contactPhone}`}
                          className="font-medium hover:underline"
                        >
                          {school.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}

                  {school.contactEmail && (
                    <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Mail size={20} style={{ color: '#04d3d3' }} className="mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <a
                          href={`mailto:${school.contactEmail}`}
                          className="font-medium hover:underline break-all"
                        >
                          {school.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      style={{ backgroundColor: '#04d3d3', color: 'white' }}
                      onClick={() => setActiveTab('enquire')}
                    >
                      <MessageCircle className="mr-2" size={18} />
                      Send Enquiry
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Heart className="mr-2" size={18} />
                      Add to Favorites
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="text-center text-sm text-muted-foreground">
                    <p className="mb-2">Profile Views</p>
                    <p className="text-2xl font-bold text-foreground">{school.profileViews}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
