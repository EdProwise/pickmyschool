import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Education Insights & School Guides | PickMySchool',
  description:
    'Explore expert articles on school admissions, education tips, career guidance, and school life. Stay informed with PickMySchool's blog for parents and students in India.',
  keywords: [
    'school blog India',
    'school admission tips',
    'education insights',
    'best schools India',
    'parenting education guide',
    'school comparison tips',
    'PickMySchool blog',
  ],
  openGraph: {
    title: 'PickMySchool Blog - Education Insights & School Guides',
    description:
      'Expert articles to help parents choose the right school for their children in India.',
    url: 'https://www.pickmyschool.in/blogs',
    type: 'website',
    siteName: 'PickMySchool',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PickMySchool Blog - Education Insights',
    description:
      'Expert articles to help parents choose the right school for their children in India.',
  },
  alternates: {
    canonical: 'https://www.pickmyschool.in/blogs',
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
