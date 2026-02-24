import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Schools - List Your School on PickMySchool",
  description: "Register your school on PickMySchool to reach thousands of parents actively searching for the right school. Manage enquiries, showcase facilities, and grow admissions.",
  keywords: [
    "list school India",
    "school registration platform",
    "increase school admissions",
    "school marketing India",
    "school management portal",
  ],
  openGraph: {
    title: "List Your School on PickMySchool | Reach More Parents",
    description: "Register your school to reach thousands of parents. Manage enquiries, showcase your school, and grow admissions.",
    url: "https://www.pickmyschool.in/for-schools",
    type: "website",
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/for-schools",
  },
};

export default function ForSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
