import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - PickMySchool",
  description: "Read the terms and conditions for using PickMySchool's school discovery platform, including usage policies, disclaimers, and user responsibilities.",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
