'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Send, MessageCircle, User, GraduationCap, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';
import { CITY_OPTIONS } from '@/lib/indian-cities';

export default function ContactExpertPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentClass: '',
    interestedCity: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subject: 'Expert Consultation Request'
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast.success('Consultation request sent! Our expert will contact you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        currentClass: '',
        interestedCity: '',
        message: ''
      });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side: Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 border border-cyan-200 rounded-full text-sm font-bold text-cyan-700 mb-6">
                  <Sparkles className="w-4 h-4" />
                  Expert Consultation
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                  Find the <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Perfect School</span> With Expert Guidance
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Confused about choosing the right board? Worried about the admission process? Our educational experts are here to help you make the best decision for your child's future.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: GraduationCap,
                    title: "Board Selection",
                    desc: "Compare CBSE, ICSE, IB & Cambridge"
                  },
                  {
                    icon: MapPin,
                    title: "Location Preference",
                    desc: "Find top schools in your preferred area"
                  },
                  {
                    icon: ShieldCheck,
                    title: "Verified Insights",
                    desc: "Get honest feedback about schools"
                  },
                  {
                    icon: MessageCircle,
                    title: "End-to-end Support",
                    desc: "Guidance from enquiry to admission"
                  }
                ].map((item, i) => (
                  <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-cyan-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Call Us Directly</h4>
                    <p className="text-xl font-bold text-slate-900">+91 995 852 8306</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Email Us</h4>
                    <p className="text-xl font-bold text-slate-900">info@edprowise.com</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Right side: Form */}
            <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
              <CardContent className="p-8 lg:p-12">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Request Consultation</h2>
                  <p className="text-slate-500">Fill in the details below and we'll get back to you.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Parent Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input 
                          id="name"
                          placeholder="John Doe" 
                          className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input 
                          id="email"
                          type="email" 
                          placeholder="john@example.com" 
                          className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input 
                          id="phone"
                          placeholder="+91 00000 00000" 
                          className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Interested Class</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input 
                          id="class"
                          placeholder="e.g. Grade 5" 
                          className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                          required
                          value={formData.currentClass}
                          onChange={(e) => setFormData({...formData, currentClass: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Interested City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                      <Combobox
                        options={CITY_OPTIONS}
                        value={formData.interestedCity}
                        onChange={(value) => setFormData({ ...formData, interestedCity: value })}
                        placeholder="Select city..."
                        searchPlaceholder="Search cities..."
                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">How can we help you?</Label>
                    <Textarea 
                      id="message"
                      placeholder="Tell us about your child's requirements..." 
                      className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-all resize-none"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70 group"
                    disabled={submitting}
                  >
                    {submitting ? (
                      'Sending Request...'
                    ) : (
                      <>
                        Send Request
                        <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-slate-400">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
