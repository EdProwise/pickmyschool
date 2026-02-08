'use client';

import { useRouter } from 'next/navigation';
import { Target, Heart, Users, Award, Lightbulb, Shield, ArrowRight, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const router = useRouter();

  const values = [
    {
      icon: Heart,
      title: 'Parent-First Approach',
      description: 'Every decision we make centers on what helps parents find the best educational environment for their children.',
      color: 'from-rose-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We verify all school information and maintain honest, unbiased listings to help you make informed choices.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We leverage AI and smart technology to provide personalized school recommendations tailored to your needs.',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We build connections between parents, students, and schools to create a supportive educational ecosystem.',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const milestones = [
    { number: '10+', label: 'Schools Listed' },
    { number: '5K+', label: 'Parents Helped' },
    { number: '5+', label: 'Cities Covered' },
    { number: '99%', label: 'Satisfaction Rate' }
  ];

  const teamMembers = [
    {
      name: 'Kunal Shah',
      role: 'Founder & CEO',
      description: 'Vision to transform education sector'
    },
    {
      name: 'Dhiraj Zope',
      role: 'CTO',
      description: 'Tech innovator building AI-powered education tools'
    },
    {
      name: 'Jai Gupta',
      role: 'COO',
      description: 'Dealing with operation to provide best experience to user'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <Navbar />

      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-cyan-200/30 to-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/20 to-pink-200/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-100/10 via-transparent to-purple-100/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200/60 rounded-full text-sm font-bold text-cyan-700 mb-6">
                <Sparkles className="w-4 h-4" />
                Our Story
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6 px-2">
                Transforming How
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Parents Find Schools
                </span>
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light px-4">
                We believe every child deserves the perfect educational environment. 
                PickMySchool makes that discovery effortless.
              </p>
            </div>

        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center group">
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {milestone.number}
                </div>
                <div className="text-slate-400 font-medium tracking-wide uppercase text-sm">
                  {milestone.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/60 rounded-full text-sm font-bold text-amber-700 mb-6">
                <Target className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Empowering Parents with 
                <span className="text-cyan-600"> Better Choices</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                At PickMySchool, we understand that choosing the right school is one of the most important decisions a parent makes. Our mission is to simplify this journey by providing comprehensive, verified information about schools across India.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                We combine technology with human insight to deliver personalized recommendations that match your child's unique needs, your budget, and your aspirations.
              </p>
              
                <div className="space-y-6">
                  {[
                    {
                      title: 'Comprehensive Data',
                      desc: 'Verified school profiles with accurate and up-to-date information'
                    },
                    {
                      title: 'AI Recommendations',
                      desc: 'Smart matching technology tailored to your child\'s unique needs'
                    },
                    {
                      title: 'Direct Connection',
                      desc: 'Seamless communication channel with school admission offices'
                    },
                      {
                        title: 'Authentic Reviews',
                        desc: 'Verified parent ratings and reviews for genuine feedback'
                      }
                    ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold mb-1">{item.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            
              <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                      <img 
                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/52387199-7ec6-4b63-a2fa-893e007f2f3d/Images-1-1770547145574.png"
                        alt="Children reading books together"
                        className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  <div className="relative mt-4 bg-white rounded-2xl shadow-lg border border-slate-100 p-4 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Building Futures</h3>
                    <p className="text-slate-600">One school match at a time</p>
                  </div>
                </div>
          </div>
        </div>
        </section>

        <section className="py-24 px-4 relative bg-white">
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                  <div className="h-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500" />
                  <div className="p-8">
                    <img 
                      src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop"
                      alt="School building"
                      className="w-full h-64 object-cover rounded-2xl mb-6"
                    />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Growth & Excellence</h3>
                      <p className="text-slate-600">Empowering schools to reach their full potential</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-teal-100 border border-cyan-200/60 rounded-full text-sm font-bold text-cyan-700 mb-6">
                  <TrendingUp className="w-4 h-4" />
                  For Institutions
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Boost in Admission to 
                  <span className="text-cyan-600"> School</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  We help schools reach their enrollment goals by connecting them with the right parents and streamlining the admission process. Our platform provides the tools and visibility needed to stand out in a competitive educational landscape.
                </p>
                
                <div className="space-y-6">
                  {[
                    {
                      title: 'Targeted Visibility',
                      desc: 'Reach thousands of parents actively searching for schools in your specific area and category.'
                    },
                    {
                      title: 'Verified Lead Generation',
                      desc: 'Receive high-quality enquiries from interested parents, helping you build a strong admission pipeline.'
                    },
                    {
                      title: 'Digital Brand Building',
                      desc: 'Showcase your facilities, results, and unique offerings through a professional digital profile.'
                    },
                    {
                      title: 'Performance Analytics',
                      desc: 'Track views, enquiries, and conversion rates to optimize your admission strategies.'
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold mb-1">{item.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/60 rounded-full text-sm font-bold text-purple-700 mb-6">
              <Heart className="w-4 h-4" />
              What Drives Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${value.color}`} />
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative">
        <div className="absolute top-20 right-20 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200/60 rounded-full text-sm font-bold text-cyan-700 mb-6">
              <Users className="w-4 h-4" />
              Meet the Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              The People Behind PickMySchool
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Passionate educators and technologists united by a common goal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card 
                key={index} 
                className="group overflow-hidden border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-cyan-400 font-medium">{member.role}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-slate-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-bold text-cyan-400 mb-8">
            <Award className="w-4 h-4" />
            Join Our Mission
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Find the
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Perfect School?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Start your journey today and discover schools that match your child's potential
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              onClick={() => router.push('/schools')}
            >
              Explore Schools
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              onClick={() => router.push('/for-schools')}
            >
              List Your School
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
