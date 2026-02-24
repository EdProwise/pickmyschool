import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Create Your PickMySchool Account",
  description: "Create a free PickMySchool account to save school searches, track enquiries, compare schools, and get personalized school recommendations for your child.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
