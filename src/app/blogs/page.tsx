'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, Tag, Search, ChevronLeft, ChevronRight, Star, BookOpen, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const BLOGS_PER_PAGE = 12;

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  readTime: number;
  views: number;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
}

function BlogCard({ blog }: { blog: Blog }) {
  const date = blog.publishedAt || blog.createdAt;
  return (
    <Link href={`/blogs/${blog.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-cyan-50 to-blue-100 overflow-hidden">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-cyan-300" />
          </div>
        )}
        {blog.featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
              <Star className="w-3 h-3" /> Featured
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur text-cyan-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h2 className="font-bold text-slate-800 text-base leading-snug mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
          {blog.title}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {blog.excerpt}
        </p>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-xs bg-cyan-50 text-cyan-600 border border-cyan-100 px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {blog.readTime} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
      <Skeleton className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-4" />
      </div>
    </div>
  );
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<{ _id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const totalPages = Math.ceil(total / BLOGS_PER_PAGE);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(BLOGS_PER_PAGE),
      offset: String((page - 1) * BLOGS_PER_PAGE),
    });
    if (search) params.set('q', search);
    if (activeCategory !== 'all') params.set('category', activeCategory);

    try {
      const res = await fetch(`/api/blogs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs);
        setTotal(data.total);
        if (data.categories?.length) setCategories(data.categories);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-2xl" />
        </div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <BookOpen className="w-4 h-4" /> Education Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            PickMySchool Blog
          </h1>
          <p className="text-cyan-100 text-lg max-w-xl mx-auto mb-8">
            Expert advice, tips, and insights to help you make the best school decisions for your child.
          </p>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search articles…"
                className="pl-9 h-11 bg-white/95 border-0 rounded-xl text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" className="h-11 px-6 bg-white text-cyan-700 hover:bg-cyan-50 font-semibold rounded-xl border-0 shadow">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => handleCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300 hover:text-cyan-600'
            }`}
          >
            All Articles {total > 0 && activeCategory === 'all' && `(${total})`}
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => handleCategory(cat._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat._id
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300 hover:text-cyan-600'
              }`}
            >
              {cat._id} ({cat.count})
            </button>
          ))}
        </div>

        {/* Results info */}
        {!loading && (
          <p className="text-sm text-slate-500 mb-6 text-center">
            {search
              ? `${total} result${total !== 1 ? 's' : ''} for "${search}"`
              : `${total} article${total !== 1 ? 's' : ''}`}
            {totalPages > 1 && ` — Page ${page} of ${totalPages}`}
          </p>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : blogs.length > 0
            ? blogs.map(blog => <BlogCard key={blog._id} blog={blog} />)
            : (
              <div className="col-span-3 text-center py-20">
                <BookOpen className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-500">No articles found</h3>
                {search && (
                  <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }} className="mt-3 text-cyan-600 text-sm underline">
                    Clear search
                  </button>
                )}
              </div>
            )
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 px-3 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      page === p
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300 hover:text-cyan-600'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-9 px-3 rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
