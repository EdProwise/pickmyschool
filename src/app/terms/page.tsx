"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "eligibility", title: "Eligibility" },
  { id: "description", title: "Description of Service" },
  { id: "accounts", title: "User Accounts" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "user-conduct", title: "User Conduct" },
  { id: "schools-reviews", title: "Schools & Reviews" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Information" },
];

export default function TermsPage() {
  const lastUpdated = "December 18, 2025";

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d] via-[#2d4a6f] to-[#1a365d]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#E86C3A] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-[#3B82F6] rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <svg className="w-4 h-4 text-[#E86C3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-white/90 text-sm font-medium">Agreement & Guidelines</span>
          </div>
          
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "Georgia, serif" }}>
              Terms & Conditions
            </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
            Please read these terms carefully before using our platform. Your use of PickMySchool constitutes your agreement to these terms.
          </p>
          <p className="text-white/60 text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Navigation */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-28">
                <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    On This Page
                  </h3>
                  <ul className="space-y-1">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="block py-2 px-3 text-gray-600 hover:text-[#1a365d] hover:bg-gray-50 rounded-lg transition-all text-sm"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-6 bg-gradient-to-br from-[#E86C3A]/10 to-[#E86C3A]/5 rounded-2xl p-6 border border-[#E86C3A]/20">
                  <div className="w-10 h-10 bg-[#E86C3A] rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#1a365d] mb-2">Legal Help?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Review our Privacy Policy to understand how we handle your data.
                  </p>
                  <Link
                    href="/privacy"
                    className="text-sm font-medium text-[#E86C3A] hover:underline"
                  >
                    Privacy Policy →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  {/* Acceptance */}
                  <section id="acceptance" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">1</span>
                      Acceptance of Terms
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      By accessing or using PickMySchool (&quot;the Platform&quot;), you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using or accessing this Platform.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      PickMySchool is owned and operated by EdProwise Tech Private Limited. Throughout the Platform, the terms &quot;we,&quot; &quot;us,&quot; and &quot;our&quot; refer to PickMySchool.
                    </p>
                  </section>

                  {/* Eligibility */}
                  <section id="eligibility" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">2</span>
                      Eligibility
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      You must be at least 18 years of age to use this Platform. By using the Platform, you represent and warrant that:
                    </p>
                    <ul className="space-y-2 mb-6">
                      {[
                        "You have the legal capacity to enter into these terms",
                        "You are at least 18 years old",
                        "The information you provide is accurate and truthful",
                        "Your use of the Platform does not violate any applicable law",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-600">
                          <svg className="w-5 h-5 text-[#E86C3A] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Description of Service */}
                  <section id="description" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">3</span>
                      Description of Service
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      PickMySchool provides an online platform that allows users to:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {[
                        { title: "Discovery", desc: "Search and discover schools based on location, curriculum, and fees" },
                        { title: "Comparison", desc: "Compare multiple schools side-by-side on various parameters" },
                        { title: "Enquiry", desc: "Directly communicate with school administrations through our platform" },
                        { title: "Reviews", desc: "Read and share feedback about educational institutions" },
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <h4 className="font-semibold text-[#1a365d] mb-1">{item.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* User Accounts */}
                  <section id="accounts" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">4</span>
                      User Accounts
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      When you create an account, you are responsible for maintaining the confidentiality of your account and password. You agree to:
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
                      <ul className="space-y-3">
                        <li className="text-blue-900 text-sm leading-relaxed flex gap-2">
                          <span className="font-bold">•</span> Provide current, complete, and accurate registration information.
                        </li>
                        <li className="text-blue-900 text-sm leading-relaxed flex gap-2">
                          <span className="font-bold">•</span> Immediately notify us of any unauthorized use of your account.
                        </li>
                        <li className="text-blue-900 text-sm leading-relaxed flex gap-2">
                          <span className="font-bold">•</span> Accept responsibility for all activities that occur under your account.
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* Intellectual Property */}
                  <section id="intellectual-property" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">5</span>
                      Intellectual Property
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      The Platform and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of PickMySchool and its licensors.
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h4 className="font-semibold text-[#1a365d] mb-3">Usage Restrictions:</h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Platform, except for your own personal, non-commercial use.
                      </p>
                    </div>
                  </section>

                  {/* User Conduct */}
                  <section id="user-conduct" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">6</span>
                      User Conduct
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      You agree not to use the Platform to:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                      {[
                        "Post false or misleading information",
                        "Harass or intimidate other users",
                        "Upload viruses or malicious code",
                        "Scrape or data-mine the platform",
                        "Impersonate any person or entity",
                        "Violate any local or international laws",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Schools & Reviews */}
                  <section id="schools-reviews" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">7</span>
                      Schools & Reviews
                    </h2>
                    <div className="space-y-4">
                      <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                        <h4 className="font-semibold text-amber-900 mb-2">Accuracy of School Data</h4>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          While we strive for accuracy, school information (fees, facilities, etc.) is provided for informational purposes only. You must verify all information directly with the school before making decisions.
                        </p>
                      </div>
                      <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100">
                        <h4 className="font-semibold text-indigo-900 mb-2">User Reviews</h4>
                        <p className="text-indigo-800 text-sm leading-relaxed">
                          Reviews represent the opinions of users and not PickMySchool. We reserve the right to remove reviews that violate our community guidelines or appear fraudulent.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Limitation of Liability */}
                  <section id="liability" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">8</span>
                      Limitation of Liability
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4 uppercase text-xs font-bold tracking-wider">
                      Please read this section carefully.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      In no event shall PickMySchool, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses, resulting from:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 text-sm leading-relaxed">
                      <li>Your access to or use of or inability to access or use the Platform.</li>
                      <li>Any conduct or content of any third party on the Platform.</li>
                      <li>Any content obtained from the Platform.</li>
                      <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                    </ul>
                  </section>

                  {/* Termination */}
                  <section id="termination" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">9</span>
                      Termination
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                    </p>
                  </section>

                  {/* Governing Law */}
                  <section id="governing-law" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">10</span>
                      Governing Law
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                    </p>
                  </section>

                  {/* Changes */}
                  <section id="changes" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">11</span>
                      Changes to Terms
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>
                  </section>

                  {/* Contact */}
                  <section id="contact" className="scroll-mt-28">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">12</span>
                      Contact Information
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      If you have any questions about these Terms, please contact us:
                    </p>
                    
                    <div className="bg-[#1a365d] rounded-2xl p-8 text-white">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[#E86C3A] font-bold uppercase tracking-widest text-xs mb-4">Email Support</h4>
                          <p className="text-xl font-semibold mb-2">info@edprowise.com</p>
                          <p className="text-white/60 text-sm">Response within 24-48 business hours.</p>
                        </div>
                        <div>
                          <h4 className="text-[#E86C3A] font-bold uppercase tracking-widest text-xs mb-4">Mailing Address</h4>
                          <p className="text-lg leading-relaxed">
                            EdProwise Tech Private Limited<br />
                            West Delhi, Delhi, 110063<br />
                            India
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-[#1a365d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#1a365d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#1a365d] mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Ready to Find Your School?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Now that you&apos;ve read the fine print, start your discovery journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/schools"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E86C3A] text-white font-semibold rounded-xl hover:bg-[#d55a2a] transition-colors shadow-lg shadow-[#E86C3A]/20"
            >
              Explore Schools
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1a365d] font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
