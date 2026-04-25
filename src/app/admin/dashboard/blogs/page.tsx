'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Search, Edit3, Trash2, Eye, RefreshCw, X, Save, ArrowLeft,
  FileText, Globe, Star, Clock, BarChart2, Tag, Image, BookOpen,
  Bold, Italic, Underline, List, ListOrdered, Link2, AlignLeft,
  AlignCenter, AlignRight, Code, Quote, Heading2, Heading3, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Admissions', 'School Life', 'Education Tips', 'Career Guidance', 'News & Updates', 'Technology in Education', 'General'];

interface Blog {
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
  status: 'draft' | 'published';
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  readTime: number;
  views: number;
  publishedAt?: string;
  createdAt: string;
}

const emptyForm = (): Partial<Blog> => ({
  title: '', slug: '', excerpt: '', content: '', coverImage: '',
  author: 'PickMySchool Team', authorAvatar: '', category: 'General',
  tags: [], status: 'draft', featured: false,
  metaTitle: '', metaDescription: '', metaKeywords: [],
});

export default function AdminBlogsPage() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState<Partial<Blog>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    loadBlogs();
  }, [statusFilter, search]);

  const getToken = () => localStorage.getItem('admin_token') ?? '';

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/blogs?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs);
        setTotal(data.total);
      }
    } finally { setLoading(false); }
  };

  // ── Editor helpers ──────────────────────────────────────────────────────────
  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    syncContent();
  };

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      setForm(prev => ({ ...prev, content: editorRef.current!.innerHTML }));
    }
  }, []);

  const insertHTML = (html: string) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    syncContent();
  };

  const toolbarButtons = [
    { icon: Bold, cmd: 'bold', title: 'Bold' },
    { icon: Italic, cmd: 'italic', title: 'Italic' },
    { icon: Underline, cmd: 'underline', title: 'Underline' },
  ];

  // ── Slug generation ─────────────────────────────────────────────────────────
  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleTitleChange = (v: string) => {
    setForm(prev => ({ ...prev, title: v, slug: generateSlug(v), metaTitle: prev.metaTitle || v }));
  };

  const handleExcerptChange = (v: string) => {
    setForm(prev => ({ ...prev, excerpt: v, metaDescription: prev.metaDescription || v }));
  };

  // ── Tags / Keywords ─────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) setForm(prev => ({ ...prev, tags: [...(prev.tags ?? []), t] }));
    setTagInput('');
  };
  const removeTag = (t: string) => setForm(prev => ({ ...prev, tags: prev.tags?.filter(x => x !== t) }));

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (k && !form.metaKeywords?.includes(k)) setForm(prev => ({ ...prev, metaKeywords: [...(prev.metaKeywords ?? []), k] }));
    setKeywordInput('');
  };
  const removeKeyword = (k: string) => setForm(prev => ({ ...prev, metaKeywords: prev.metaKeywords?.filter(x => x !== k) }));

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title || !form.excerpt || !form.content) {
      toast.error('Title, excerpt and content are required');
      return;
    }
    setSaving(true);
    try {
      const url = editingBlog ? `/api/admin/blogs/${editingBlog._id}` : '/api/admin/blogs';
      const method = editingBlog ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editingBlog ? 'Blog updated!' : 'Blog created!');
        setView('list');
        setEditingBlog(null);
        setForm(emptyForm());
        loadBlogs();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save');
      }
    } finally { setSaving(false); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) { toast.success('Blog deleted'); loadBlogs(); }
      else toast.error('Failed to delete');
    } finally { setDeletingId(null); }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({ ...blog });
    setTagInput('');
    setKeywordInput('');
    setPreviewMode(false);
    setView('edit');
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = blog.content || '';
    }, 100);
  };

  const openCreate = () => {
    setEditingBlog(null);
    setForm(emptyForm());
    setTagInput('');
    setKeywordInput('');
    setPreviewMode(false);
    setView('create');
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ''; }, 100);
  };

  // ── Quick toggle status ─────────────────────────────────────────────────────
  const toggleStatus = async (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/admin/blogs/${blog._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { toast.success(`Blog ${newStatus}`); loadBlogs(); }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (view === 'create' || view === 'edit') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setView('list'); setEditingBlog(null); }}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">{view === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="w-4 h-4 mr-1" /> {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={() => { setForm(p => ({ ...p, status: 'draft' })); setTimeout(handleSave, 0); }} variant="outline" disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> Save Draft
            </Button>
            <Button
              onClick={() => { setForm(p => ({ ...p, status: 'published' })); setTimeout(handleSave, 0); }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              disabled={saving}
            >
              <Globe className="w-4 h-4 mr-1" /> {saving ? 'Publishing…' : 'Publish'}
            </Button>
          </div>
        </div>

        {previewMode ? (
          /* ── Preview ──────────────────────────────────────────────────────── */
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            {form.coverImage && <img src={form.coverImage} alt={form.title} className="w-full h-64 object-cover rounded-xl mb-6" />}
            <div className="flex gap-2 mb-4">
              <Badge className="bg-cyan-100 text-cyan-700">{form.category}</Badge>
              {form.featured && <Badge className="bg-yellow-100 text-yellow-700"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">{form.title || 'Untitled'}</h1>
            <p className="text-lg text-slate-600 mb-6 border-l-4 border-cyan-400 pl-4 italic">{form.excerpt}</p>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.content || '' }} />
          </div>
        ) : (
          /* ── Editor ──────────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="xl:col-span-2 space-y-5">
              {/* Title */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <Label className="font-semibold mb-1.5 block">Title *</Label>
                    <Input
                      placeholder="Enter blog title…"
                      value={form.title}
                      onChange={e => handleTitleChange(e.target.value)}
                      className="text-lg font-semibold h-12"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold mb-1.5 block">Slug (URL)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400 whitespace-nowrap">/blogs/</span>
                      <Input
                        value={form.slug}
                        onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                        placeholder="url-slug"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold mb-1.5 block">Excerpt * <span className="text-slate-400 font-normal">(shown in listing cards)</span></Label>
                    <Textarea
                      rows={3}
                      placeholder="Write a compelling excerpt…"
                      value={form.excerpt}
                      onChange={e => handleExcerptChange(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rich Text Editor */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-0 overflow-hidden">
                  <div className="border-b border-slate-100 px-4 py-2 flex flex-wrap gap-1 bg-slate-50/80">
                    {/* Formatting toolbar */}
                    {toolbarButtons.map(({ icon: Icon, cmd, title }) => (
                      <button key={cmd} type="button" onMouseDown={e => { e.preventDefault(); execCmd(cmd); }}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title={title}>
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                    <div className="w-px bg-slate-300 mx-1" />
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'h2'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Heading 2">
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'h3'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Heading 3">
                      <Heading3 className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-slate-300 mx-1" />
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Bullet list">
                      <List className="w-4 h-4" />
                    </button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertOrderedList'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Numbered list">
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-slate-300 mx-1" />
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'blockquote'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Blockquote">
                      <Quote className="w-4 h-4" />
                    </button>
                    <button type="button" onMouseDown={e => {
                      e.preventDefault();
                      const url = prompt('Enter URL:');
                      if (url) execCmd('createLink', url);
                    }} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Insert link">
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button type="button" onMouseDown={e => {
                      e.preventDefault();
                      const url = prompt('Enter image URL:');
                      if (url) insertHTML(`<img src="${url}" alt="" class="w-full rounded-xl my-4" />`);
                    }} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Insert image">
                      <Image className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-slate-300 mx-1" />
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyLeft'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Align left">
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyCenter'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Align center">
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyRight'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Align right">
                      <AlignRight className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-slate-300 mx-1" />
                    <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('removeFormat'); }}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors text-xs font-bold" title="Clear formatting">
                      T<span className="line-through">x</span>
                    </button>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncContent}
                    onBlur={syncContent}
                    className="min-h-[420px] p-5 focus:outline-none prose max-w-none text-slate-800
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                      [&_p]:mb-4 [&_p]:leading-relaxed
                      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                      [&_li]:mb-1
                      [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-4
                      [&_a]:text-cyan-600 [&_a]:underline
                      [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full"
                    data-placeholder="Start writing your blog post here…"
                    style={{ position: 'relative' }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Publish settings */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-500" />Publish</h3>
                  <div className="flex items-center justify-between">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as any }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Featured Post</Label>
                    <Switch checked={form.featured} onCheckedChange={v => setForm(p => ({ ...p, featured: v }))} />
                  </div>
                </CardContent>
              </Card>

              {/* Category & Tags */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><Tag className="w-4 h-4 text-cyan-500" />Category & Tags</h3>
                  <div>
                    <Label className="mb-1.5 block">Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag…" className="h-8 text-sm" />
                      <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-2"><Plus className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {form.tags?.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full">
                          {t}
                          <button onClick={() => removeTag(t)}><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cover Image & Author */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><Image className="w-4 h-4 text-cyan-500" />Media & Author</h3>
                  <div>
                    <Label className="mb-1.5 block">Cover Image URL</Label>
                    <Input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
                      placeholder="https://…" className="text-sm" />
                    {form.coverImage && <img src={form.coverImage} alt="" className="mt-2 w-full h-32 object-cover rounded-lg" />}
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Author Name</Label>
                    <Input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className="text-sm" />
                  </div>
                </CardContent>
              </Card>

              {/* SEO */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-500" />SEO Settings
                  </h3>
                  <div>
                    <Label className="mb-1.5 block text-sm">Meta Title <span className="text-slate-400">({(form.metaTitle ?? '').length}/60)</span></Label>
                    <Input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
                      placeholder="SEO title…" className="text-sm" maxLength={60} />
                    <div className={`mt-1 h-1 rounded-full ${(form.metaTitle?.length ?? 0) > 60 ? 'bg-red-400' : (form.metaTitle?.length ?? 0) > 45 ? 'bg-yellow-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min(100, ((form.metaTitle?.length ?? 0) / 60) * 100)}%` }} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Meta Description <span className="text-slate-400">({(form.metaDescription ?? '').length}/160)</span></Label>
                    <Textarea value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
                      rows={3} placeholder="SEO description…" className="text-sm" maxLength={160} />
                    <div className={`mt-1 h-1 rounded-full ${(form.metaDescription?.length ?? 0) > 160 ? 'bg-red-400' : (form.metaDescription?.length ?? 0) > 120 ? 'bg-yellow-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min(100, ((form.metaDescription?.length ?? 0) / 160) * 100)}%` }} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input value={keywordInput} onChange={e => setKeywordInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        placeholder="Add keyword…" className="h-8 text-sm" />
                      <Button size="sm" variant="outline" onClick={addKeyword} className="h-8 px-2"><Plus className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {form.metaKeywords?.map(k => (
                        <span key={k} className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                          {k}
                          <button onClick={() => removeKeyword(k)}><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SERP Preview */}
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-2">SERP Preview</p>
                    <p className="text-blue-600 text-sm font-medium truncate">{form.metaTitle || form.title || 'Page Title'}</p>
                    <p className="text-green-700 text-xs truncate">https://pickmyschool.in/blogs/{form.slug || 'blog-slug'}</p>
                    <p className="text-slate-600 text-xs mt-0.5 line-clamp-2">{form.metaDescription || form.excerpt || 'Page description will appear here…'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── List View ───────────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Blog Management</h1>
          <p className="text-slate-500">{total} post{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadBlogs}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />New Blog Post
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: total, color: 'cyan' },
          { label: 'Published', value: blogs.filter(b => b.status === 'published').length, color: 'green' },
          { label: 'Draft', value: blogs.filter(b => b.status === 'draft').length, color: 'orange' },
          { label: 'Featured', value: blogs.filter(b => b.featured).length, color: 'yellow' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-0 shadow-md">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{label}</p>
              <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Blog Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Views</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No blog posts found</td></tr>
              ) : blogs.map(blog => (
                <tr key={blog._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      {blog.coverImage && <img src={blog.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-slate-400 font-mono">/blogs/{blog.slug}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {blog.featured && <span className="text-xs text-yellow-600 flex items-center gap-0.5"><Star className="w-3 h-3" />Featured</span>}
                          <span className="text-xs text-slate-400 flex items-center gap-0.5"><Clock className="w-3 h-3" />{blog.readTime}m read</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">{blog.category}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleStatus(blog)}>
                      <Badge className={blog.status === 'published' ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-700 border-0'}>
                        {blog.status}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{blog.views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(blog)}><Edit3 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}><ExternalLink className="w-3 h-3" /></Button>
                      <Button size="sm" variant="destructive" className="h-7 px-2" disabled={deletingId === blog._id} onClick={() => handleDelete(blog._id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
