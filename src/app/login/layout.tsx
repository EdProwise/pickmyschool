import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Access Your PickMySchool Account",
  description: "Sign in to your PickMySchool account to manage school listings, track enquiries, and access personalized school recommendations.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
