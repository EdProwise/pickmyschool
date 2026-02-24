import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - PickMySchool",
  description: "Read PickMySchool's privacy policy to understand how we collect, use, and protect your personal data when you use our school discovery platform.",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
