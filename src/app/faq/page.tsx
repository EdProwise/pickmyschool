'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, Search, School, CreditCard, Users, Shield, MessageCircle, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'general',
    title: 'General',
    icon: HelpCircle,
    color: 'from-cyan-500 to-blue-600',
    faqs: [
      {
        question: 'What is PickMySchool?',
        answer: 'PickMySchool is India\'s leading school discovery platform that helps parents find the perfect school for their children. We provide comprehensive information about schools including fees, facilities, curriculum, reviews, and more—all in one place.'
      },
      {
        question: 'Is PickMySchool free to use?',
        answer: 'Yes! PickMySchool is completely free for parents. You can browse schools, compare options, read reviews, and submit enquiries at no cost. Our platform is funded by school partnerships, not by charging parents.'
      },
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top navigation bar. You can register using your email address. Once registered, you can save favorite schools, track your enquiries, and receive personalized recommendations.'
      },
      {
        question: 'Can I use PickMySchool on my mobile phone?',
        answer: 'Absolutely! Our website is fully responsive and works seamlessly on all devices—smartphones, tablets, and desktops. Simply visit our website on your mobile browser for the best experience.'
      }
    ]
  },
  {
    id: 'schools',
    title: 'Finding Schools',
    icon: School,
    color: 'from-purple-500 to-violet-600',
    faqs: [
      {
        question: 'How do I search for schools?',
        answer: 'Use our search bar on the homepage or the Schools page. You can filter by location, board (CBSE, ICSE, State Board, IB), fee range, facilities, and more. Our AI-powered search also understands natural language queries.'
      },
      {
        question: 'What information is available for each school?',
        answer: 'Each school profile includes: basic details (address, contact, establishment year), fee structure, available facilities, curriculum and boards offered, student-teacher ratio, extracurricular activities, photos and videos, parent reviews, and admission process details.'
      },
      {
        question: 'How can I compare schools?',
        answer: 'Use our Compare feature! Simply click the "Compare" button on any school card to add it to your comparison list. You can compare up to 3 schools side-by-side on factors like fees, facilities, ratings, and more.'
      },
      {
        question: 'Are the school reviews genuine?',
        answer: 'Yes, all reviews on PickMySchool are from verified parents and students. We have a moderation process to ensure authenticity and remove fake or inappropriate reviews. Each reviewer must verify their connection to the school.'
      }
    ]
  },
  {
    id: 'fees',
    title: 'Fees & Admissions',
    icon: CreditCard,
    color: 'from-emerald-500 to-teal-600',
    faqs: [
      {
        question: 'Are the fee details accurate?',
        answer: 'We work directly with schools to maintain accurate and up-to-date fee information. However, fees may change annually, so we recommend confirming the latest fees directly with the school during the admission process.'
      },
      {
        question: 'How do I enquire about admissions?',
        answer: 'On any school\'s profile page, click the "Enquire Now" button. Fill in your details and your query will be sent directly to the school. You\'ll receive a confirmation email and can track your enquiry status from your dashboard.'
      },
      {
        question: 'Does PickMySchool help with the admission process?',
        answer: 'While we don\'t directly handle admissions, we facilitate the connection between parents and schools. Schools receive your enquiry and will contact you directly about their admission process, requirements, and next steps.'
      },
      {
        question: 'Can I get fee discounts through PickMySchool?',
        answer: 'Some schools offer special promotions or early-bird discounts that we highlight on our platform. However, fee negotiations are handled directly between parents and schools. We recommend mentioning PickMySchool when you contact the school.'
      }
    ]
  },
  {
    id: 'parents',
    title: 'For Parents',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    faqs: [
      {
        question: 'How do I save schools to view later?',
        answer: 'Once logged in, click the heart icon on any school card to save it to your favorites. Access your saved schools anytime from the "Saved Schools" section in your dashboard.'
      },
      {
        question: 'Can I write a review for my child\'s school?',
        answer: 'Yes! If your child is enrolled in a school listed on our platform, you can write a review. Go to the school\'s page, click "Write a Review," and share your experience. Your review helps other parents make informed decisions.'
      },
      {
        question: 'How do I track my school enquiries?',
        answer: 'Log in to your account and go to your Dashboard. The "My Enquiries" section shows all your submitted enquiries, their status, and any responses from schools. You\'ll also receive email notifications for updates.'
      },
      {
        question: 'What if I need help choosing a school?',
        answer: 'Use our AI-powered chat assistant! Click the chat icon on any page to get personalized recommendations based on your preferences, budget, and location. Our AI considers multiple factors to suggest the best matches.'
      }
    ]
  },
  {
    id: 'schools-listing',
    title: 'For Schools',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
    faqs: [
      {
        question: 'How can my school get listed on PickMySchool?',
        answer: 'Visit our "For Schools" page and click "List Your School." Fill out the registration form with your school details. Our team will verify the information and activate your listing within 2-3 business days.'
      },
      {
        question: 'Is there a fee for schools to be listed?',
        answer: 'We offer both free and premium listing options. Free listings include basic school information. Premium listings offer enhanced visibility, featured placement, detailed analytics, and priority support. Contact us for pricing details.'
      },
      {
        question: 'How can schools respond to enquiries?',
        answer: 'Schools receive enquiries directly via email and can also access them through the School Dashboard. Log in to your school account to view, respond to, and manage all parent enquiries in one place.'
      },
      {
        question: 'Can schools update their information?',
        answer: 'Yes! Schools have full control over their profiles through the School Dashboard. You can update contact details, fees, facilities, photos, videos, and any other information. Changes are reflected after a quick review.'
      }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    icon: MessageCircle,
    color: 'from-indigo-500 to-blue-600',
    faqs: [
      {
        question: 'How do I contact PickMySchool support?',
        answer: 'You can reach us through multiple channels: Visit our Contact Expert page, use the contact form on our website, or chat with our AI assistant. We typically respond within 24 hours.'
      },
      {
        question: 'I found incorrect information about a school. How do I report it?',
        answer: 'Thank you for helping us maintain accuracy! On the school\'s profile page, click "Report an Issue" at the bottom. Describe the incorrect information, and our team will verify and update it promptly.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'If you wish to delete your account, please email us at support@pickmyschool.com with your registered email address. We\'ll process your request and remove all your data within 7 business days, in compliance with privacy regulations.'
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Absolutely. We take data privacy seriously. Your information is encrypted and stored securely. We never sell your data to third parties. Read our Privacy Policy for complete details on how we protect your information.'
      }
    ]
  }
];

function FAQAccordion({ faq, isOpen, onClick }: { faq: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div 
      className={cn(
        "border rounded-2xl transition-all duration-300 overflow-hidden",
        isOpen 
          ? "border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 shadow-lg shadow-cyan-100/50" 
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      )}
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left group"
      >
        <span className={cn(
          "font-semibold text-lg transition-colors pr-4",
          isOpen ? "text-cyan-700" : "text-slate-800 group-hover:text-cyan-600"
        )}>
          {faq.question}
        </span>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
          isOpen 
            ? "bg-gradient-to-br from-cyan-500 to-blue-600 rotate-180" 
            : "bg-slate-100 group-hover:bg-cyan-100"
        )}>
          <ChevronDown className={cn(
            "w-5 h-5 transition-colors",
            isOpen ? "text-white" : "text-slate-500 group-hover:text-cyan-600"
          )} />
        </div>
      </button>
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-0">
            <p className="text-slate-600 leading-relaxed text-base">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = faqCategories.find(c => c.id === activeCategory);

  const filteredFAQs = searchQuery.trim() 
    ? faqCategories.flatMap(category => 
        category.faqs
          .filter(faq => 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(faq => ({ ...faq, categoryTitle: category.title, categoryColor: category.color }))
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-cyan-200/30 to-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-200/20 to-pink-200/10 rounded-full blur-3xl" />
        
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200/60 rounded-full text-sm font-bold text-cyan-700 mb-6">
                <Sparkles className="w-4 h-4" />
                Help Center
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6 px-2">
                Frequently Asked
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </h1>
              <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto px-4">
                Find answers to common questions about using PickMySchool
              </p>
            </div>


          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
              <div className="flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-4 text-lg text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {filteredFAQs ? (
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <p className="text-slate-600">
                  Found <span className="font-bold text-cyan-600">{filteredFAQs.length}</span> results for "{searchQuery}"
                </p>
              </div>
              {filteredFAQs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <div key={index}>
                      <div className="mb-2">
                        <span className={cn(
                          "text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r text-white",
                          faq.categoryColor
                        )}>
                          {faq.categoryTitle}
                        </span>
                      </div>
                      <FAQAccordion
                        faq={faq}
                        isOpen={openFAQ === `search-${index}`}
                        onClick={() => setOpenFAQ(openFAQ === `search-${index}` ? null : `search-${index}`)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">No results found</h3>
                  <p className="text-slate-600 mb-6">Try searching with different keywords</p>
                  <Button 
                    onClick={() => setSearchQuery('')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-2">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">
                    Categories
                  </h3>
                  {faqCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setOpenFAQ(null);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300",
                          isActive 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-200/50" 
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                          isActive ? "bg-white/20" : "bg-slate-100"
                        )}>
                          <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500")} />
                        </div>
                        <span className="font-semibold">{category.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-3">
                {currentCategory && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        currentCategory.color
                      )}>
                        <currentCategory.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900">{currentCategory.title}</h2>
                        <p className="text-slate-500">{currentCategory.faqs.length} questions</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentCategory.faqs.map((faq, index) => (
                        <FAQAccordion
                          key={index}
                          faq={faq}
                          isOpen={openFAQ === `${currentCategory.id}-${index}`}
                          onClick={() => setOpenFAQ(openFAQ === `${currentCategory.id}-${index}` ? null : `${currentCategory.id}-${index}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-12 text-center">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Still Have Questions?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-xl mx-auto">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = '/contact-expert'}
                >
                  Contact Expert
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold border-2 border-white/30 text-blue hover:bg-white/10 rounded-xl transition-all duration-300"
                  onClick={() => window.location.href = '/schools'}
                >
                  Browse Schools
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
