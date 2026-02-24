import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact an Expert - Get Free School Admission Guidance",
  description: "Speak with a school admission expert for personalised guidance on finding the right school for your child. Free consultation available for parents across India.",
  keywords: [
    "school admission expert",
    "free school consultation",
    "school guidance India",
    "admission help",
    "contact PickMySchool",
  ],
  openGraph: {
    title: "Contact a School Admission Expert | PickMySchool",
    description: "Get free personalised guidance from a school admission expert to find the perfect school for your child.",
    url: "https://www.pickmyschool.in/contact-expert",
    type: "website",
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/contact-expert",
  },
};

export default function ContactExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
