import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import { getAllSchools } from '@/lib/schoolsHelper';
import { INDIAN_CITIES } from '@/lib/indian-cities';
import { MapPin, GraduationCap, ArrowRight } from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';

interface PageProps {
  params: Promise<{ city: string }>;
}

function cityNameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function slugToCityName(slug: string): string | undefined {
  return INDIAN_CITIES.find(c => cityNameToSlug(c) === slug);
}

export async function generateStaticParams() {
  return INDIAN_CITIES.map((city) => ({ city: cityNameToSlug(city) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const cityName = slugToCityName(citySlug);
  if (!cityName) return { title: 'Schools Not Found' };

  return {
    title: `Top Schools in ${cityName} | Best CBSE, ICSE, State Board Schools`,
    description: `Find the best schools in ${cityName}. Browse top CBSE, ICSE & State Board schools with ratings, fees, facilities & admission details. Explore all schools in ${cityName} on PickMySchool.`,
    keywords: `top schools in ${cityName}, best schools ${cityName}, CBSE schools ${cityName}, ICSE schools ${cityName}, schools in ${cityName}`,
    openGraph: {
      title: `Top Schools in ${cityName} | PickMySchool`,
      description: `Discover the top-rated schools in ${cityName}. Compare fees, boards, facilities and more.`,
      url: `https://www.pickmyschool.in/schools/city/${citySlug}`,
    },
    alternates: {
      canonical: `https://www.pickmyschool.in/schools/city/${citySlug}`,
    },
  };
}

export default async function TopSchoolsInCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cityName = slugToCityName(citySlug);
  if (!cityName) notFound();

  await connectToDatabase();
  const schools = await getAllSchools({
    city: cityName,
    isPublic: true,
    limit: 100,
  });

  // Sort by rating descending
  const sorted = [...schools].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  // Group nearby cities for "Explore More" section (same first letter group)
  const nearbyCities = INDIAN_CITIES.filter(c => c !== cityName).slice(0, 30);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-cyan-900 text-white py-14 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/" className="hover:text-[#04d3d3] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/schools" className="hover:text-[#04d3d3] transition-colors">Schools</Link>
              <span>/</span>
              <span className="text-white">Top Schools in {cityName}</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#04d3d3]/20 border border-[#04d3d3]/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7 text-[#04d3d3]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Top Schools in {cityName}
                </h1>
                <p className="text-gray-300 text-lg">
                  {sorted.length > 0
                    ? `Explore ${sorted.length}+ top-rated schools in ${cityName}. Compare CBSE, ICSE, and State Board schools.`
                    : `Discover the best schools in ${cityName} on PickMySchool.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4 py-10">
          {/* Filter CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <p className="text-gray-600 font-medium">
              {sorted.length > 0 ? (
                <><span className="text-gray-900 font-bold">{sorted.length}</span> schools found in {cityName}</>
              ) : (
                'No schools listed yet in this city'
              )}
            </p>
            <Link
              href={`/schools?city=${encodeURIComponent(cityName)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#04d3d3] hover:bg-[#03b8b8] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <GraduationCap size={16} />
              Filter & Search Schools
              <ArrowRight size={14} />
            </Link>
          </div>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((school) => (
                <SchoolCard key={school.id} school={school as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Schools Listed Yet</h2>
              <p className="text-gray-500 mb-6">Be the first school to list in {cityName}.</p>
              <Link
                href="/for-schools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#04d3d3] text-white font-semibold rounded-xl hover:bg-[#03b8b8] transition-colors"
              >
                List Your School
              </Link>
            </div>
          )}

          {/* Explore Other Cities */}
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Explore Schools by City</h2>
            <div className="flex flex-wrap gap-2">
              {INDIAN_CITIES.filter(c => c !== cityName).map((c) => (
                <Link
                  key={c}
                  href={`/schools/city/${cityNameToSlug(c)}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#04d3d3] hover:text-[#04d3d3] transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
