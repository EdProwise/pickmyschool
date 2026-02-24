import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description: "Find answers to common questions about finding schools, admission processes, fees, and using PickMySchool's platform to discover the best schools in India.",
  keywords: [
    "school admission FAQ",
    "PickMySchool help",
    "school search questions",
    "how to find schools India",
  ],
  openGraph: {
    title: "Frequently Asked Questions | PickMySchool",
    description: "Find answers to common questions about school discovery, admissions, and using PickMySchool.",
    url: "https://www.pickmyschool.in/faq",
    type: "website",
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/faq",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
