import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "sonner";
import { AIChat } from "@/components/AIChat";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pickmyschool.in"),
  title: {
    default: "PickMySchool - Find the Perfect School for Your Child",
    template: "%s | PickMySchool",
  },
  description: "Discover and compare the best schools in India. Search by location, board, fees, and ratings. A comprehensive school discovery platform helping parents find the perfect school for their child.",
  keywords: [
    "school search",
    "find schools",
    "best schools in India",
    "school comparison",
    "CBSE schools",
    "ICSE schools",
    "IB schools",
    "school admission",
    "school fees",
    "school ratings",
    "school reviews",
    "education",
    "PickMySchool",
  ],
  authors: [{ name: "PickMySchool" }],
  creator: "PickMySchool",
  publisher: "PickMySchool",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.pickmyschool.in",
    siteName: "PickMySchool",
    title: "PickMySchool - Find the Perfect School for Your Child",
    description: "Discover and compare the best schools in India. Search by location, board, fees, and ratings. Help your child get the best education.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PickMySchool - Find the Perfect School",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PickMySchool - Find the Perfect School for Your Child",
    description: "Discover and compare the best schools in India. Search by location, board, fees, and ratings.",
    images: ["/og-image.png"],
    creator: "@pickmyschool",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: "https://www.pickmyschool.in",
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.pickmyschool.in/#website",
      url: "https://www.pickmyschool.in",
      name: "PickMySchool",
      description: "Find the perfect school for your child in India",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.pickmyschool.in/schools?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.pickmyschool.in/#organization",
      name: "PickMySchool",
      url: "https://www.pickmyschool.in",
      logo: {
        "@type": "ImageObject",
        url: "https://www.pickmyschool.in/favicon.svg",
      },
      sameAs: [
        "https://twitter.com/pickmyschool",
        "https://www.facebook.com/pickmyschool",
        "https://www.linkedin.com/company/pickmyschool",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@pickmyschool.in",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.pickmyschool.in/#service",
      name: "PickMySchool - School Discovery Platform",
      description: "A comprehensive platform to discover, compare, and choose the best schools in India based on location, curriculum, fees, and ratings.",
      url: "https://www.pickmyschool.in",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      serviceType: "School Discovery and Comparison",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="52387199-7ec6-4b63-a2fa-893e007f2f3d"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <Toaster position="top-right" richColors />
        {children}
        <AIChat />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}