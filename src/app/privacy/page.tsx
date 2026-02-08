"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "information-sharing", title: "Information Sharing" },
  { id: "data-security", title: "Data Security" },
  { id: "your-rights", title: "Your Rights" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "children", title: "Children's Privacy" },
  { id: "changes", title: "Policy Changes" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPage() {
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
            <span className="text-white/90 text-sm font-medium">Your Privacy Matters</span>
          </div>
          
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "Georgia, serif" }}>
              Privacy Policy
            </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
            We are committed to protecting your privacy and ensuring the security of your personal information.
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#1a365d] mb-2">Have Questions?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our privacy team for any concerns.
                  </p>
                  <Link
                    href="/faq"
                    className="text-sm font-medium text-[#E86C3A] hover:underline"
                  >
                    Visit FAQ →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  {/* Introduction */}
                  <section id="introduction" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">1</span>
                      Introduction
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Welcome to PickMySchool (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring a safe online experience. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      By using PickMySchool, you consent to the data practices described in this policy. If you do not agree with the terms of this Privacy Policy, please do not access or use our services.
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section id="information-we-collect" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">2</span>
                      Information We Collect
                    </h2>
                    
                    <h3 className="text-lg font-semibold text-[#1a365d] mt-6 mb-3">Personal Information</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We may collect personal information that you voluntarily provide when you:
                    </p>
                    <ul className="space-y-2 mb-6">
                      {[
                        "Create an account or register on our platform",
                        "Submit an enquiry to a school",
                        "Fill out contact forms or surveys",
                        "Subscribe to our newsletter",
                        "Participate in reviews or feedback",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-600">
                          <svg className="w-5 h-5 text-[#E86C3A] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-[#1a365d] mb-3">Types of personal information collected:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          "Name and email address",
                          "Phone number",
                          "Child's age and grade level",
                          "Location preferences",
                          "School preferences",
                          "Communication history",
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 bg-[#E86C3A] rounded-full" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-[#1a365d] mt-6 mb-3">Automatically Collected Information</h3>
                    <p className="text-gray-600 leading-relaxed">
                      When you visit our website, we automatically collect certain information about your device, including your IP address, browser type, operating system, referring URLs, and information about how you interact with our website.
                    </p>
                  </section>

                  {/* How We Use Your Information */}
                  <section id="how-we-use" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">3</span>
                      How We Use Your Information
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We use the information we collect for various purposes, including:
                    </p>
                    
                    <div className="grid gap-4">
                      {[
                        { title: "Service Delivery", desc: "To provide, maintain, and improve our school discovery and comparison services" },
                        { title: "Communication", desc: "To send you updates, respond to inquiries, and provide customer support" },
                        { title: "Personalization", desc: "To personalize your experience and provide tailored school recommendations" },
                        { title: "Analytics", desc: "To analyze usage patterns and improve our website functionality" },
                        { title: "Legal Compliance", desc: "To comply with legal obligations and protect our rights" },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{i + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1a365d]">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Information Sharing */}
                  <section id="information-sharing" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">4</span>
                      Information Sharing
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We do not sell your personal information. We may share your information in the following circumstances:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="border-l-4 border-[#E86C3A] pl-4 py-2">
                        <h4 className="font-semibold text-[#1a365d]">With Schools</h4>
                        <p className="text-gray-600 text-sm">When you submit an enquiry, we share your contact information with the respective school to facilitate communication.</p>
                      </div>
                      <div className="border-l-4 border-[#3B82F6] pl-4 py-2">
                        <h4 className="font-semibold text-[#1a365d]">Service Providers</h4>
                        <p className="text-gray-600 text-sm">We may share information with third-party service providers who assist us in operating our website and services.</p>
                      </div>
                      <div className="border-l-4 border-[#10B981] pl-4 py-2">
                        <h4 className="font-semibold text-[#1a365d]">Legal Requirements</h4>
                        <p className="text-gray-600 text-sm">We may disclose information if required by law or in response to valid legal requests.</p>
                      </div>
                      <div className="border-l-4 border-[#8B5CF6] pl-4 py-2">
                        <h4 className="font-semibold text-[#1a365d]">Business Transfers</h4>
                        <p className="text-gray-600 text-sm">In the event of a merger, acquisition, or sale, your information may be transferred as part of the transaction.</p>
                      </div>
                    </div>
                  </section>

                  {/* Data Security */}
                  <section id="data-security" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">5</span>
                      Data Security
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                    
                    <div className="bg-gradient-to-br from-[#1a365d] to-[#2d4a6f] rounded-2xl p-6 text-white">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Our Security Measures Include:
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          "SSL/TLS encryption for data transmission",
                          "Secure password hashing",
                          "Regular security audits",
                          "Access controls and authentication",
                          "Data backup and recovery procedures",
                          "Employee security training",
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                            <svg className="w-4 h-4 text-[#E86C3A]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Your Rights */}
                  <section id="your-rights" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">6</span>
                      Your Rights
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      You have certain rights regarding your personal information:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: "👁️", title: "Access", desc: "Request a copy of your personal data" },
                        { icon: "✏️", title: "Correction", desc: "Request correction of inaccurate data" },
                        { icon: "🗑️", title: "Deletion", desc: "Request deletion of your data" },
                        { icon: "⏸️", title: "Restriction", desc: "Request restriction of processing" },
                        { icon: "📤", title: "Portability", desc: "Request transfer of your data" },
                        { icon: "🚫", title: "Objection", desc: "Object to processing of your data" },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="font-semibold text-[#1a365d]">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-4">
                      To exercise any of these rights, please contact us at{" "}
                      <a href="mailto:info@edprowise.com" className="text-[#E86C3A] hover:underline">
                        info@edprowise.com
                      </a>
                    </p>
                  </section>

                  {/* Cookies */}
                  <section id="cookies" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">7</span>
                      Cookies & Tracking
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic.
                    </p>
                    
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a365d]">Cookie Type</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a365d]">Purpose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {[
                            { type: "Essential", purpose: "Required for basic website functionality" },
                            { type: "Analytics", purpose: "Help us understand how visitors use our site" },
                            { type: "Preferences", purpose: "Remember your settings and preferences" },
                            { type: "Marketing", purpose: "Used to deliver relevant advertisements" },
                          ].map((row, i) => (
                            <tr key={i}>
                              <td className="px-4 py-3 text-sm font-medium text-[#1a365d]">{row.type}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{row.purpose}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-4">
                      You can control cookies through your browser settings. Disabling certain cookies may affect website functionality.
                    </p>
                  </section>

                  {/* Children's Privacy */}
                  <section id="children" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">8</span>
                      Children&apos;s Privacy
                    </h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-2">Important Notice</h4>
                          <p className="text-amber-700 text-sm">
                            Our services are intended for parents and guardians seeking school information. We do not knowingly collect personal information directly from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Policy Changes */}
                  <section id="changes" className="scroll-mt-28 mb-12">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">9</span>
                      Policy Changes
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes. Changes are effective when they are posted on this page.
                    </p>
                  </section>

                  {/* Contact Us */}
                  <section id="contact" className="scroll-mt-28">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-4 flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
                      <span className="w-8 h-8 bg-[#1a365d]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[#1a365d]">10</span>
                      Contact Us
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      If you have any questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#E86C3A] rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1a365d]">Email</h4>
                            <a href="mailto:info@edprowise.com" className="text-[#E86C3A] hover:underline">
                              info@edprowise.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1a365d]">Address</h4>
                            <p className="text-gray-600 text-sm">
                              EdProwise Tech Private Limited<br />
                              West Delhi, Delhi, India,110063
                            </p>
                          </div>
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
      <section className="py-16 bg-[#1a365d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Have More Questions?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            We&apos;re here to help. Check out our FAQ or get in touch with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E86C3A] text-white font-semibold rounded-xl hover:bg-[#d55a2a] transition-colors"
            >
              Visit FAQ
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              About Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
