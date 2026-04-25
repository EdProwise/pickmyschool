import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/lib/models';
import { Clock, Calendar, Tag, ArrowLeft, BookOpen, Eye, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogDoc {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  readTime: number;
  views: number;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

async function getBlog(slug: string): Promise<{ blog: BlogDoc; related: BlogDoc[]; recent: BlogDoc[] } | null> {
  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug, status: 'published' }).lean() as BlogDoc | null;
    if (!blog) return null;

    const related = await Blog.find({
      status: 'published',
      category: blog.category,
      slug: { $ne: slug },
    })
      .select('title slug excerpt coverImage category readTime publishedAt createdAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .lean() as BlogDoc[];

    const recent = await Blog.find({
      status: 'published',
      slug: { $ne: slug },
    })
      .select('title slug coverImage category readTime publishedAt createdAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .lean() as BlogDoc[];

    return { blog, related, recent };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlog(slug);
  if (!data) return { title: 'Blog Not Found | PickMySchool' };

  const { blog } = data;
  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.excerpt;
  const url = `https://www.pickmyschool.in/blogs/${blog.slug}`;

  return {
    title: `${title} | PickMySchool Blog`,
    description,
    keywords: blog.metaKeywords?.length ? blog.metaKeywords : [blog.category, ...blog.tags],
    authors: [{ name: blog.author }],
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'PickMySchool',
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author],
      tags: blog.tags,
      ...(blog.coverImage && { images: [{ url: blog.coverImage, alt: blog.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(blog.coverImage && { images: [blog.coverImage] }),
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getBlog(slug);
  if (!data) notFound();

  const { blog, related, recent } = data;
  const date = blog.publishedAt || blog.createdAt;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage,
    author: { '@type': 'Person', name: blog.author },
    publisher: {
      '@type': 'Organization',
      name: 'PickMySchool',
      url: 'https://www.pickmyschool.in',
    },
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    mainEntityOfPage: `https://www.pickmyschool.in/blogs/${blog.slug}`,
    keywords: blog.tags?.join(', '),
    articleSection: blog.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        <div className="relative">
          {blog.coverImage ? (
            <div className="relative h-72 md:h-96 overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 container mx-auto">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Blogs
                </Link>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-cyan-500 text-white border-0">{blog.category}</Badge>
                  {blog.featured && <Badge className="bg-yellow-400 text-yellow-900 border-0">Featured</Badge>}
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white leading-tight max-w-3xl">
                  {blog.title}
                </h1>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 py-16">
              <div className="container mx-auto px-4">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Blogs
                </Link>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-white/20 text-white border-white/30">{blog.category}</Badge>
                  {blog.featured && <Badge className="bg-yellow-400 text-yellow-900 border-0">Featured</Badge>}
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white leading-tight max-w-3xl">
                  {blog.title}
                </h1>
              </div>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
            <main>
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm px-5 md:px-8 py-6 md:py-8">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    {blog.authorAvatar ? (
                      <img src={blog.authorAvatar} alt={blog.author} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {blog.author.charAt(0)}
                      </div>
                    )}
                    {blog.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {blog.readTime} min read
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {blog.views.toLocaleString()} views
                  </span>
                </div>

                <p className="text-lg text-slate-600 leading-relaxed mb-8 border-l-4 border-cyan-400 pl-5 italic bg-cyan-50/50 py-3 pr-4 rounded-r-xl">
                  {blog.excerpt}
                </p>

                <article
                  className="blog-editor-content prose max-w-none text-slate-800
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                    [&_p]:mb-4 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                    [&_li]:mb-1
                    [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-4
                    [&_a]:text-cyan-600 [&_a]:underline
                    [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {blog.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 mt-8 pt-6 border-t border-slate-200">
                    <span className="text-sm font-semibold text-slate-600 mr-1 flex items-center gap-1">
                      <Tag className="w-4 h-4" /> Tags:
                    </span>
                    {blog.tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/blogs?tag=${encodeURIComponent(tag)}`}
                        className="text-sm bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-full hover:bg-cyan-100 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {related.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-500" /> Related Articles
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {related.map(post => (
                      <Link
                        key={post.slug}
                        href={`/blogs/${post.slug}`}
                        className="group bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                      >
                        {post.coverImage && (
                          <img src={post.coverImage} alt={post.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <div className="p-3">
                          <Badge variant="outline" className="text-xs mb-2">{post.category}</Badge>
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                            {post.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {post.readTime} min read
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 text-center">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to All Articles
                </Link>
              </div>
            </main>

            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3">
                  <p className="text-white font-semibold text-sm tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    Recent Posts
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  {recent.length > 0 ? recent.map(post => {
                    const postDate = post.publishedAt || post.createdAt;
                    return (
                      <Link
                        key={post.slug}
                        href={`/blogs/${post.slug}`}
                        className="group flex gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {post.coverImage ? (
                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-cyan-700 font-medium mb-0.5">{post.category}</p>
                          <p className="text-sm text-slate-800 font-semibold line-clamp-2 group-hover:text-cyan-600 transition-colors">
                            {post.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(postDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </Link>
                    );
                  }) : (
                    <p className="text-sm text-slate-500 px-2 py-3">No recent posts available.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
