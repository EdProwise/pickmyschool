import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Schools - Side-by-Side School Comparison",
  description: "Compare schools side-by-side on fees, facilities, ratings, board, and more. Make an informed decision for your child's education with PickMySchool's comparison tool.",
  keywords: [
    "compare schools India",
    "school comparison tool",
    "school fees comparison",
    "CBSE vs ICSE schools",
    "best school comparison",
  ],
  openGraph: {
    title: "Compare Schools Side-by-Side | PickMySchool",
    description: "Compare schools on fees, facilities, ratings, board, and more to make the best decision for your child.",
    url: "https://www.pickmyschool.in/compare",
    type: "website",
  },
  twitter: {
    title: "Compare Schools Side-by-Side | PickMySchool",
    description: "Compare schools on fees, facilities, ratings, and more.",
  },
  alternates: {
    canonical: "https://www.pickmyschool.in/compare",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
