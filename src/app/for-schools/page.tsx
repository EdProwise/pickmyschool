'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Users, TrendingUp, Award, Target, CheckCircle2, 
  BarChart3, Mail, Phone, Building2, Megaphone
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ForSchoolsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      schoolName: formData.get('schoolName') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      city: formData.get('city') as string,
      message: formData.get('message') as string,
      subject: 'School Partnership Enquiry',
    };

    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit enquiry');
      }

      toast.success('Thank you! We will contact you soon.');
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: 'Reach More Parents',
      description: 'Connect with thousands of parents actively searching for schools in your area.',
    },
    {
      icon: TrendingUp,
      title: 'Increase Admissions',
      description: 'Get quality leads from interested parents and boost your admission rates.',
    },
    {
      icon: BarChart3,
      title: 'Track Performance',
      description: 'Monitor profile views, enquiries, and conversion rates with detailed analytics.',
    },
    {
      icon: Target,
      title: 'Targeted Marketing',
      description: 'Showcase your school to parents looking for exactly what you offer.',
    },
    {
      icon: Award,
      title: 'Build Reputation',
      description: 'Collect reviews and ratings to build trust and credibility.',
    },
    {
      icon: Megaphone,
      title: 'Featured Listings',
      description: 'Get highlighted placement to stand out from competitors.',
    },
  ];

  const features = [
    'Complete school profile with photos and videos',
    'Lead management and enquiry tracking CRM',
    'Direct communication with interested parents',
    'Analytics dashboard with insights',
    'Featured placement in search results',
    'Review and rating management',
    'Mobile-responsive school page',
    'SEO-optimized profile for better visibility',
  ];

  const stats = [
    { value: '50K+', label: 'Active Parents' },
    { value: '1000+', label: 'Schools Listed' },
    { value: '10K+', label: 'Monthly Enquiries' },
    { value: '95%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Grow Your School with{' '}
              <span style={{ color: '#04d3d3' }}>PickMySchool</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Connect with thousands of parents searching for the perfect school. 
              Increase visibility, manage leads, and grow admissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                style={{ backgroundColor: '#04d3d3', color: 'white' }}
                onClick={() => router.push('/signup')}
              >
                Register Your School
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold mb-1" style={{ color: '#04d3d3' }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose PickMySchool?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of schools already benefiting from our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const gradients = [
                'from-violet-500 via-purple-500 to-fuchsia-500',
                'from-cyan-500 via-teal-500 to-emerald-500',
                'from-orange-500 via-rose-500 to-pink-500',
                'from-blue-500 via-indigo-500 to-purple-500',
                'from-amber-500 via-yellow-500 to-lime-500',
                'from-red-500 via-pink-500 to-rose-500',
              ];
              const iconBgs = [
                'bg-gradient-to-br from-violet-100 to-fuchsia-100',
                'bg-gradient-to-br from-cyan-100 to-emerald-100',
                'bg-gradient-to-br from-orange-100 to-pink-100',
                'bg-gradient-to-br from-blue-100 to-purple-100',
                'bg-gradient-to-br from-amber-100 to-lime-100',
                'bg-gradient-to-br from-red-100 to-rose-100',
              ];
              const iconColors = [
                '#8b5cf6',
                '#14b8a6',
                '#f97316',
                '#6366f1',
                '#eab308',
                '#f43f5e',
              ];
              return (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradients[index]}`} />
                  <CardContent className="p-8 relative">
                    <div
                      className={`w-16 h-16 rounded-2xl mb-5 flex items-center justify-center ${iconBgs[index]} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                    >
                      <Icon style={{ color: iconColors[index] }} size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent from-gray-900 to-gray-600 group-hover:from-gray-700 group-hover:to-gray-900 transition-all duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive tools to manage and grow your school's online presence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                  <CheckCircle2 style={{ color: '#04d3d3' }} size={20} className="flex-shrink-0 mt-1" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Getting Started is Easy
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your school account in minutes' },
              { step: '2', title: 'Add Details', desc: 'Complete your profile with photos and info' },
              { step: '3', title: 'Go Live', desc: 'Your school goes live for parents to discover' },
              { step: '4', title: 'Get Leads', desc: 'Start receiving enquiries from interested parents' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: '#04d3d3' }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-16 px-4 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that works best for your school
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Basic',
                price: 'Free',
                features: [
                  'School profile listing',
                  'Basic contact information',
                  'Up to 5 photos',
                  'Lead notifications',
                ],
              },
              {
                name: 'Premium',
                price: '₹9,999/year',
                features: [
                  'Everything in Basic',
                  'Featured listing',
                  'Unlimited photos & videos',
                  'CRM dashboard',
                  'Analytics & insights',
                  'Priority support',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: [
                  'Everything in Premium',
                  'Multiple locations',
                  'Dedicated account manager',
                  'Custom integrations',
                  'White-label options',
                ],
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={plan.popular ? 'border-2' : ''}
                style={plan.popular ? { borderColor: '#04d3d3' } : {}}
              >
                {plan.popular && (
                  <div className="mb-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: '#04d3d3' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold mb-6" style={{ color: '#04d3d3' }}>
                    {plan.price}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          size={18}
                          style={{ color: '#04d3d3' }}
                          className="flex-shrink-0 mt-1"
                        />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    style={
                      plan.popular
                        ? { backgroundColor: '#04d3d3', color: 'white' }
                        : {}
                    }
                    onClick={() => router.push('/signup')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-muted-foreground">
                Have questions? Our team is here to help you get started.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input id="schoolName" name="schoolName" required />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input id="contactPerson" name="contactPerson" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" name="phone" type="tel" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" required />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Tell us about your school and how we can help..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    style={{ backgroundColor: '#04d3d3', color: 'white' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#04d3d320' }}
                      >
                        <Mail style={{ color: '#04d3d3' }} size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          info@edprowise.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#04d3d320' }}
                      >
                        <Phone style={{ color: '#04d3d3' }} size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          +91 99585 28306
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4" style={{ backgroundColor: '#04d3d3' }}>
        <div className="container mx-auto text-center">
          <Building2 className="mx-auto mb-6 text-white" size={64} />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Grow Your School?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join PickMySchool today and start connecting with parents looking for schools like yours
          </p>
          <Button
            size="lg"
            className="bg-white hover:bg-gray-100"
            style={{ color: '#04d3d3' }}
            onClick={() => router.push('/signup')}
          >
            Register Your School Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}