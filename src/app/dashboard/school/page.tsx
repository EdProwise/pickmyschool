'use client';

  // HMR touch
  import { useState, useEffect, useRef, type ChangeEvent } from 'react';
  import { useRouter } from 'next/navigation';
  import { 
    Users, TrendingUp, Clock, Eye, Mail, Phone, Calendar,
    Filter, Search, Edit, MoreVertical, Plus, Building2,
    LayoutDashboard, MessageSquare, Info, Contact2, Building,
    Image, DollarSign, Trophy, GraduationCap, Newspaper,
    Star, BarChart3, Bell, User as UserIcon, Sparkles, Target,
    CheckCircle2, XCircle, AlertCircle, ArrowUpRight, Menu, X, LogOut, Settings, ThumbsUp, ThumbsDown, Video, Globe, ClipboardList, FileText, MapPin, UserPlus, FileDown, FileUp, Tag, UserCog, Pencil, Trash2
  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMe, type User, type Enquiry } from '@/lib/api';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  BasicInfoSection,
  ContactInfoSection,
  FacilitiesSection,
  GallerySection,
  VirtualTourSection,
  FeesSection
} from './sections';
import { SettingsSection } from './SettingsSection';
import { ResultsSection } from './ResultsSection';
import { AlumniSection } from './AlumniSection';
import { NewsSection } from './NewsSection';
import { AnalyticsSection } from './AnalyticsSection';
import { EnquirySettingsSection } from './EnquirySettingsSection';
import { SchoolPagePreview } from './SchoolPagePreview';
import { WhatsappAPISection } from './WhatsappAPISection';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lead-dashboard', label: 'Lead Dashboard', icon: Tag },
  { id: 'enquiry', label: 'Enquiry List', icon: MessageSquare },
  { id: 'whatsapp-api', label: 'Whatsapp API', icon: MessageSquare },
  { id: 'enquiry-settings', label: 'Enquiry Form Settings', icon: ClipboardList },
  { id: 'school-page', label: 'School Page', icon: Globe },
  { id: 'basic-info', label: 'Basic Info', icon: Info },
  { id: 'contact', label: 'Contact Information', icon: Contact2 },
  { id: 'facilities', label: 'Facilities & Infrastructure', icon: Building },
  { id: 'gallery', label: 'Gallery & Documents', icon: Image },
  { id: 'virtualtour', label: 'Virtual Tour', icon: Video },
  { id: 'fees', label: 'Fees Structure', icon: DollarSign },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'alumini', label: 'Alumni', icon: Users },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'review', label: 'Review', icon: Star },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const NO_TAGS_FILTER = '__no_tags__';
const NO_LEAD_FILTER = '__no_lead__';

export default function SchoolDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // School profile state
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Selected enquiry for editing
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  
  // Additional data modal state
  const [additionalDataEnquiry, setAdditionalDataEnquiry] = useState<Enquiry | null>(null);
  const [additionalAddress, setAdditionalAddress] = useState('');
  const [additionalState, setAdditionalState] = useState('');
  const [additionalAge, setAdditionalAge] = useState('');
  const [additionalGender, setAdditionalGender] = useState('');

  // Add enquiry modal state
  const [showAddEnquiryModal, setShowAddEnquiryModal] = useState(false);
  const [newEnquiryName, setNewEnquiryName] = useState('');
  const [newEnquiryEmail, setNewEnquiryEmail] = useState('');
  const [newEnquiryPhone, setNewEnquiryPhone] = useState('');
  const [newEnquiryClass, setNewEnquiryClass] = useState('');
  const [newEnquiryMessage, setNewEnquiryMessage] = useState('');
  const [addingEnquiry, setAddingEnquiry] = useState(false);
  const [importingEnquiries, setImportingEnquiries] = useState(false);
  const enquiryImportInputRef = useRef<HTMLInputElement | null>(null);
  const [viewMessageEnquiry, setViewMessageEnquiry] = useState<Enquiry | null>(null);

  // Tags modal state
  const [tagsEnquiry, setTagsEnquiry] = useState<Enquiry | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [savingTags, setSavingTags] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');

  // Lead Assigned modal state
  const [leadEnquiry, setLeadEnquiry] = useState<Enquiry | null>(null);
  const [editLeadAssigned, setEditLeadAssigned] = useState('');
  const [newLeadInput, setNewLeadInput] = useState('');
  const [savingLead, setSavingLead] = useState(false);
  const [editingStaffIndex, setEditingStaffIndex] = useState<number | null>(null);
  const [editingStaffValue, setEditingStaffValue] = useState('');

  // Enquiry pagination
  const [filterTag, setFilterTag] = useState('all');
  const [filterLead, setFilterLead] = useState('all');

  const [enquiryPage, setEnquiryPage] = useState(1);
  const ENQUIRIES_PER_PAGE = 30;

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deletingEnquiryId, setDeletingEnquiryId] = useState<string | null>(null);

  // Edit fields modal state
  const [editFieldsEnquiry, setEditFieldsEnquiry] = useState<Enquiry | null>(null);
  const [editFieldsName, setEditFieldsName] = useState('');
  const [editFieldsEmail, setEditFieldsEmail] = useState('');
  const [editFieldsPhone, setEditFieldsPhone] = useState('');
  const [editFieldsClass, setEditFieldsClass] = useState('');
  const [savingFields, setSavingFields] = useState(false);
  const [leadDashboardSort, setLeadDashboardSort] = useState<{ col: 'tag' | 'new' | 'inProgress' | 'converted' | 'lost' | 'total'; dir: 'asc' | 'desc' }>({ col: 'tag', dir: 'asc' });
  const [leadAssignedSort, setLeadAssignedSort] = useState<{ col: 'lead' | 'new' | 'inProgress' | 'converted' | 'lost' | 'total'; dir: 'asc' | 'desc' }>({ col: 'lead', dir: 'asc' });
  const [classSort, setClassSort] = useState<{ col: 'class' | 'new' | 'inProgress' | 'converted' | 'lost' | 'total'; dir: 'asc' | 'desc' }>({ col: 'class', dir: 'asc' });

  const normalizeEnquiryId = (value: any) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      if (typeof value.$oid === 'string') return value.$oid;
      if (typeof value.toString === 'function') return value.toString();
    }
    return String(value);
  };

  const normalizeEnquiryForState = (enquiry: any) => {
    const normalizedId = normalizeEnquiryId(enquiry?.id ?? enquiry?._id);
    return {
      ...enquiry,
      id: normalizedId,
      _id: normalizedId,
    } as Enquiry;
  };

  const normalizeNoteDate = (value: unknown, fallbackDate?: string) => {
    if (typeof value === 'string' && value.trim()) return value;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
    if (fallbackDate) return fallbackDate;
    return new Date().toISOString();
  };

  const normalizeNotesHistory = (notesValue: unknown, fallbackDate?: string): Array<{ date: string; text: string }> => {
    const toEntry = (candidate: unknown): { date: string; text: string } | null => {
      if (typeof candidate === 'string') {
        const text = candidate.trim();
        if (!text) return null;
        return { date: normalizeNoteDate(undefined, fallbackDate), text };
      }

      if (candidate && typeof candidate === 'object') {
        const rawText =
          typeof (candidate as any).text === 'string'
            ? (candidate as any).text
            : typeof (candidate as any).message === 'string'
              ? (candidate as any).message
              : '';
        const text = rawText.trim();
        if (!text) return null;
        const date = normalizeNoteDate((candidate as any).date ?? (candidate as any).createdAt, fallbackDate);
        return { date, text };
      }

      return null;
    };

    if (!notesValue) return [];

    if (Array.isArray(notesValue)) {
      return notesValue.map(toEntry).filter((entry): entry is { date: string; text: string } => Boolean(entry));
    }

    if (typeof notesValue === 'string') {
      const trimmed = notesValue.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(toEntry).filter((entry): entry is { date: string; text: string } => Boolean(entry));
        }
        const single = toEntry(parsed);
        return single ? [single] : [{ date: normalizeNoteDate(undefined, fallbackDate), text: trimmed }];
      } catch {
        return [{ date: normalizeNoteDate(undefined, fallbackDate), text: trimmed }];
      }
    }

    const single = toEntry(notesValue);
    return single ? [single] : [];
  };

  const fetchAllEnquiries = async (token: string) => {
    const batchSize = 1000;
    let offset = 0;
    let hasMore = true;
    const all: any[] = [];

    while (hasMore) {
      const response = await fetch(`/api/schools/enquiries?limit=${batchSize}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load enquiries');

      const data = await response.json();
      const batch = Array.isArray(data?.enquiries)
        ? data.enquiries
        : Array.isArray(data)
          ? data
          : [];

      all.push(...batch);

      const apiHasMore = Boolean(data?.metadata?.hasMore);
      hasMore = apiHasMore || batch.length === batchSize;
      offset += batch.length;

      if (batch.length === 0) {
        hasMore = false;
      }
    }

    return all;
  };

  useEffect(() => {
    loadSchoolData();
  }, []);

  useEffect(() => {
    // Load review stats for header rating display
    if (profile?.id) {
      loadReviewStats();
    }
  }, [profile?.id]);

  // Load notifications on mount and periodically
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

    useEffect(() => {
      // Load profile when switching to profile-related sections
      if (['dashboard', 'enquiry', 'basic-info', 'contact', 'facilities', 'gallery', 'virtualtour', 'fees', 'school-page', 'enquiry-settings', 'review', 'whatsapp-api'].includes(activeSection) && !profile) {
        loadSchoolProfile();
      }
    }, [activeSection, profile]);


  // Load reviews when switching to review section
  useEffect(() => {
    if (activeSection === 'review' && profile?.id) {
      loadReviews();
      loadReviewStats();
    }
  }, [activeSection, profile?.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const loadSchoolData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access dashboard');
      router.push('/login');
      return;
    }

    try {
      const { user: userData } = await getMe(token);
      
      if (userData.role !== 'school') {
        toast.error('Access denied. Schools only.');
        router.push('/login');
        return;
      }

      setUser(userData);

      // Load all school enquiries (API is paginated with max 1000 per request).
      const incoming = await fetchAllEnquiries(token);
      setEnquiries(incoming.map((enquiry: any) => normalizeEnquiryForState(enquiry)));
    } catch (error) {
      console.error('Failed to load school data:', error);
      toast.error('Failed to load dashboard data');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const loadSchoolProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setProfileLoading(true);
    try {
      const response = await fetch('/api/schools/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile loaded from API:', data);
        // LOGGING THIS as per request
        console.log('Facility images in loaded profile:', data?.facilityImages);
        setProfile(data);
      } else if (response.status === 404) {
        // Profile doesn't exist yet, initialize with default values
        setProfile({
          name: '',
          board: '',
          city: '',
          facilityImages: {},
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async (data: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch('/api/schools/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      console.log('Profile saved successfully:', updatedProfile);
      // Log updated profile's facility images in console
      console.log('Facility images in saved profile:', updatedProfile?.facilityImages);
      toast.success('Profile updated successfully');
      
      // Reload profile to ensure fresh data
      await loadSchoolProfile();
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const mergeUpdatedEnquiry = (updatedEnquiry: any) => {
    const normalized = normalizeEnquiryForState(updatedEnquiry);
    const updatedId = normalizeEnquiryId(normalized.id ?? (normalized as any)._id);

    setEnquiries((prev) =>
      prev.map((enquiry) =>
        normalizeEnquiryId((enquiry as any).id ?? (enquiry as any)._id) === updatedId
          ? ({ ...enquiry, ...normalized } as Enquiry)
          : enquiry
      )
    );

    if (selectedEnquiry && normalizeEnquiryId((selectedEnquiry as any).id ?? (selectedEnquiry as any)._id) === updatedId) {
      setSelectedEnquiry((prev) => (prev ? ({ ...prev, ...normalized } as Enquiry) : prev));
    }
    if (viewMessageEnquiry && normalizeEnquiryId((viewMessageEnquiry as any).id ?? (viewMessageEnquiry as any)._id) === updatedId) {
      setViewMessageEnquiry((prev) => (prev ? ({ ...prev, ...normalized } as Enquiry) : prev));
    }
    if (tagsEnquiry && normalizeEnquiryId((tagsEnquiry as any).id ?? (tagsEnquiry as any)._id) === updatedId) {
      setTagsEnquiry((prev) => (prev ? ({ ...prev, ...normalized } as Enquiry) : prev));
    }
    if (leadEnquiry && normalizeEnquiryId((leadEnquiry as any).id ?? (leadEnquiry as any)._id) === updatedId) {
      setLeadEnquiry((prev) => (prev ? ({ ...prev, ...normalized } as Enquiry) : prev));
    }
    if (additionalDataEnquiry && normalizeEnquiryId((additionalDataEnquiry as any).id ?? (additionalDataEnquiry as any)._id) === updatedId) {
      setAdditionalDataEnquiry((prev) => (prev ? ({ ...prev, ...normalized } as Enquiry) : prev));
    }
  };

  const refreshEnquiriesSilently = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const incoming = await fetchAllEnquiries(token);
      setEnquiries(incoming.map((enquiry: any) => normalizeEnquiryForState(enquiry)));
    } catch (error) {
      console.error('Silent enquiry refresh failed:', error);
    }
  };

  const handleUpdateEnquiry = async (enquiryId: string | number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in again.');
      return;
    }
    const normalizedId = normalizeEnquiryId(enquiryId);

    const previousEnquiry = enquiries.find(
      (item) => normalizeEnquiryId((item as any).id ?? (item as any)._id) === normalizedId
    );

    const trimmedNotes = enquiryNotes.trim();

    // Optimistic UI update so status appears immediately.
    setEnquiries((prev) =>
      prev.map((item) =>
        normalizeEnquiryId((item as any).id ?? (item as any)._id) === normalizedId
          ? ({
              ...item,
              status: enquiryStatus || item.status,
              message: enquiryMessage,
              notes: trimmedNotes ? trimmedNotes : item.notes,
            } as Enquiry)
          : item
      )
    );
    setSelectedEnquiry(null);
    setEnquiryNotes('');
    setEnquiryMessage('');

    try {
      const response = await fetch(`/api/enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: enquiryStatus,
          message: enquiryMessage,
          ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        }),
      });

      if (!response.ok) throw new Error('Failed to update enquiry');
      const data = await response.json();
      if (data?.enquiry) {
        mergeUpdatedEnquiry(data.enquiry);
        if (filterStatus !== 'all' && data.enquiry.status && filterStatus !== data.enquiry.status) {
          setFilterStatus('all');
          setEnquiryPage(1);
          toast.info('Status updated. Showing all statuses so the updated enquiry remains visible.');
        }
      }

      toast.success('Enquiry updated successfully');
      void refreshEnquiriesSilently();
    } catch (error) {
      // Revert optimistic update if API failed.
      if (previousEnquiry) {
        mergeUpdatedEnquiry(previousEnquiry);
      }
      toast.error('Failed to update enquiry');
    }
  };

  const handleSaveAdditionalData = async (enquiryId: string | number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentAddress: additionalAddress,
          studentState: additionalState,
          studentAge: additionalAge,
          studentGender: additionalGender,
        }),
      });

      if (!response.ok) throw new Error('Failed to save additional data');
      const data = await response.json();
      if (data?.enquiry) {
        mergeUpdatedEnquiry(data.enquiry);
      }

      toast.success('Additional data saved successfully');
      setAdditionalDataEnquiry(null);
      void refreshEnquiriesSilently();
    } catch (error) {
      toast.error('Failed to save additional data');
    }
  };

  const handleAddEnquiry = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!newEnquiryName || !newEnquiryEmail || !newEnquiryPhone || !newEnquiryClass) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAddingEnquiry(true);
    try {
      const response = await fetch('/api/schools/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentName: newEnquiryName,
          studentEmail: newEnquiryEmail,
          studentPhone: newEnquiryPhone,
          studentClass: newEnquiryClass,
          message: newEnquiryMessage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add enquiry');
      }
      const data = await response.json();
      if (data?.enquiry) {
        const created = normalizeEnquiryForState(data.enquiry);
        setEnquiries((prev) => [created, ...prev]);
      }

      toast.success('Enquiry added successfully');
      setShowAddEnquiryModal(false);
      setNewEnquiryName('');
      setNewEnquiryEmail('');
      setNewEnquiryPhone('');
      setNewEnquiryClass('');
      setNewEnquiryMessage('');
      void refreshEnquiriesSilently();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add enquiry');
    } finally {
      setAddingEnquiry(false);
    }
  };

  const handleSaveTags = async () => {
    if (!tagsEnquiry) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setSavingTags(true);
    try {
      const response = await fetch(`/api/enquiries/${tagsEnquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tags: editTags }),
      });
      if (!response.ok) throw new Error('Failed to save tags');
      const data = await response.json();
      if (data?.enquiry) {
        mergeUpdatedEnquiry(data.enquiry);
      }
      toast.success('Tags updated successfully');
      setTagsEnquiry(null);
      void refreshEnquiriesSilently();
    } catch {
      toast.error('Failed to save tags');
    } finally {
      setSavingTags(false);
    }
  };

  const handleSaveLeadAssigned = async () => {
    if (!leadEnquiry) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setSavingLead(true);
    try {
      const response = await fetch(`/api/enquiries/${leadEnquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadAssigned: editLeadAssigned }),
      });
      if (!response.ok) throw new Error('Failed to save lead assigned');
      const data = await response.json();
      if (data?.enquiry) {
        mergeUpdatedEnquiry(data.enquiry);
      }
      toast.success('Lead assigned updated successfully');
      setLeadEnquiry(null);
      void refreshEnquiriesSilently();
    } catch {
      toast.error('Failed to save lead assigned');
    } finally {
      setSavingLead(false);
    }
  };

  const handleDeleteEnquiry = async (enquiry: Enquiry) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    const enquiryId = normalizeEnquiryId((enquiry as any).id ?? (enquiry as any)._id);
    if (!enquiryId) {
      toast.error('Invalid enquiry id');
      return;
    }

    setDeletingEnquiryId(enquiryId);
    try {
      const response = await fetch(`/api/enquiries/${enquiryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete enquiry');
      }

      setEnquiries((prev) =>
        prev.filter((item) => normalizeEnquiryId((item as any).id ?? (item as any)._id) !== enquiryId)
      );

      if (selectedEnquiry && normalizeEnquiryId((selectedEnquiry as any).id ?? (selectedEnquiry as any)._id) === enquiryId) {
        setSelectedEnquiry(null);
      }
      if (viewMessageEnquiry && normalizeEnquiryId((viewMessageEnquiry as any).id ?? (viewMessageEnquiry as any)._id) === enquiryId) {
        setViewMessageEnquiry(null);
      }
      if (tagsEnquiry && normalizeEnquiryId((tagsEnquiry as any).id ?? (tagsEnquiry as any)._id) === enquiryId) {
        setTagsEnquiry(null);
      }
      if (leadEnquiry && normalizeEnquiryId((leadEnquiry as any).id ?? (leadEnquiry as any)._id) === enquiryId) {
        setLeadEnquiry(null);
      }
      if (additionalDataEnquiry && normalizeEnquiryId((additionalDataEnquiry as any).id ?? (additionalDataEnquiry as any)._id) === enquiryId) {
        setAdditionalDataEnquiry(null);
      }

      toast.success('Enquiry deleted successfully');
      void refreshEnquiriesSilently();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete enquiry');
    } finally {
      setDeletingEnquiryId(null);
    }
  };

  const handleSaveFields = async () => {
    if (!editFieldsEnquiry) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!editFieldsName.trim()) {
      toast.error('Student name is required');
      return;
    }
    setSavingFields(true);
    try {
      const response = await fetch(`/api/enquiries/${editFieldsEnquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          studentName: editFieldsName.trim(),
          studentEmail: editFieldsEmail.trim(),
          studentPhone: editFieldsPhone.trim(),
          studentClass: editFieldsClass,
        }),
      });
      if (!response.ok) throw new Error('Failed to save enquiry fields');
      const data = await response.json();
      if (data?.enquiry) {
        mergeUpdatedEnquiry(data.enquiry);
      }
      toast.success('Enquiry updated successfully');
      setEditFieldsEnquiry(null);
      void refreshEnquiriesSilently();
    } catch {
      toast.error('Failed to save enquiry fields');
    } finally {
      setSavingFields(false);
    }
  };

  const handleSaveNewTag = async () => {
    if (!newTagInput.trim() || !profile) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const existing: string[] = profile.enquiryTags || [];
    if (existing.includes(newTagInput.trim())) { setNewTagInput(''); return; }
    const updated = [...existing, newTagInput.trim()];
    try {
      await fetch('/api/schools/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enquiryTags: updated }),
      });
      setProfile((p: any) => ({ ...p, enquiryTags: updated }));
      setNewTagInput('');
      toast.success('Tag defined');
    } catch {
      toast.error('Failed to save tag');
    }
  };

  const handleSaveNewLeadStaff = async () => {
      if (!newLeadInput.trim() || !profile) return;
      const token = localStorage.getItem('token');
      if (!token) return;
      const existing: string[] = profile.leadStaff || [];
      if (existing.includes(newLeadInput.trim())) { setNewLeadInput(''); return; }
      const updated = [...existing, newLeadInput.trim()];
      try {
        await fetch('/api/schools/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ leadStaff: updated }),
        });
        setProfile((p: any) => ({ ...p, leadStaff: updated }));
        setNewLeadInput('');
        toast.success('Staff member added');
      } catch {
        toast.error('Failed to save staff member');
      }
    };

  const handleDeleteTag = async (index: number) => {
    if (!profile) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const existing: string[] = profile.enquiryTags || [];
    const removed = existing[index];
    const updated = existing.filter((_, i) => i !== index);
    try {
      await fetch('/api/schools/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enquiryTags: updated }),
      });
      setProfile((p: any) => ({ ...p, enquiryTags: updated }));
      // Also deselect if it was selected on the current enquiry
      setEditTags((prev) => prev.filter((t) => t !== removed));
      toast.success('Tag deleted');
    } catch {
      toast.error('Failed to delete tag');
    }
  };

  const handleRenameTag = async (index: number) => {
    if (!profile || !editingTagValue.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const existing: string[] = profile.enquiryTags || [];
    const oldName = existing[index];
    const newName = editingTagValue.trim();
    if (oldName === newName) { setEditingTagIndex(null); return; }
    const updated = existing.map((t, i) => (i === index ? newName : t));
    try {
      await fetch('/api/schools/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enquiryTags: updated }),
      });
      setProfile((p: any) => ({ ...p, enquiryTags: updated }));
      // Update selection if old name was selected
      setEditTags((prev) => prev.map((t) => (t === oldName ? newName : t)));
      setEditingTagIndex(null);
      setEditingTagValue('');
      toast.success('Tag renamed');
    } catch {
      toast.error('Failed to rename tag');
    }
  };

  const handleDeleteStaff = async (index: number) => {
    if (!profile) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const existing: string[] = profile.leadStaff || [];
    const removed = existing[index];
    const updated = existing.filter((_, i) => i !== index);
    try {
      await fetch('/api/schools/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadStaff: updated }),
      });
      setProfile((p: any) => ({ ...p, leadStaff: updated }));
      if (editLeadAssigned === removed) setEditLeadAssigned('');
      toast.success('Staff member deleted');
    } catch {
      toast.error('Failed to delete staff member');
    }
  };

  const handleRenameStaff = async (index: number) => {
    if (!profile || !editingStaffValue.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const existing: string[] = profile.leadStaff || [];
    const oldName = existing[index];
    const newName = editingStaffValue.trim();
    if (oldName === newName) { setEditingStaffIndex(null); return; }
    const updated = existing.map((s, i) => (i === index ? newName : s));
    try {
      await fetch('/api/schools/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadStaff: updated }),
      });
      setProfile((p: any) => ({ ...p, leadStaff: updated }));
      if (editLeadAssigned === oldName) setEditLeadAssigned(newName);
      setEditingStaffIndex(null);
      setEditingStaffValue('');
      toast.success('Staff member renamed');
    } catch {
      toast.error('Failed to rename staff member');
    }
  };

  type ImportedEnquiryRow = {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    studentClass: string;
    message: string;
    status: string;
    latestNote: string;
    studentAddress: string;
    studentState: string;
    studentAge: string;
    studentGender: string;
    tags: string;
    leadAssigned: string;
  };

  const normalizeImportHeader = (header: string) =>
    header.toLowerCase().replace(/[^a-z0-9]/g, '');

  const toImportString = (value: unknown) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };

  const getImportField = (row: Record<string, string>, aliases: string[]) => {
    for (const alias of aliases) {
      const value = row[alias];
      if (value !== undefined) return value;
    }
    return '';
  };

  const parseImportRow = (rawRow: Record<string, unknown>): ImportedEnquiryRow => {
    const normalizedRow = Object.entries(rawRow).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[normalizeImportHeader(key)] = toImportString(value);
      return acc;
    }, {});

    return {
      studentName: getImportField(normalizedRow, ['studentname', 'name', 'student']),
      studentEmail: getImportField(normalizedRow, ['studentemail', 'email', 'mail']),
      studentPhone: getImportField(normalizedRow, ['studentphone', 'phone', 'mobileno', 'mobile', 'contact', 'contactnumber']),
      studentClass: getImportField(normalizedRow, ['studentclass', 'class', 'grade', 'standard']),
      message: getImportField(normalizedRow, ['message', 'notes', 'remark', 'remarks']),
      status: getImportField(normalizedRow, ['status', 'enquirystatus']),
      latestNote: getImportField(normalizedRow, ['latestnote', 'note', 'latestremarks', 'latestremark']),
      studentAddress: getImportField(normalizedRow, ['studentaddress', 'address']),
      studentState: getImportField(normalizedRow, ['studentstate', 'state']),
      studentAge: getImportField(normalizedRow, ['studentage', 'age']),
      studentGender: getImportField(normalizedRow, ['studentgender', 'gender', 'sex']),
      tags: getImportField(normalizedRow, ['tags', 'tag']),
      leadAssigned: getImportField(normalizedRow, ['leadassigned', 'lead', 'assignedlead', 'leadowner']),
    };
  };

  const handleImportExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const file = event.target.files?.[0];
    if (!file) return;

    setImportingEnquiries(true);
    try {
      const workbookData = await file.arrayBuffer();
      const workbook = XLSX.read(workbookData, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        toast.error('No sheet found in the selected Excel file');
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (rows.length === 0) {
        toast.error('Excel file is empty');
        return;
      }

      const parsedRows = rows
        .map(parseImportRow)
        .filter((row) =>
          [
            row.studentName,
            row.studentEmail,
            row.studentPhone,
            row.studentClass,
            row.message,
            row.status,
            row.latestNote,
            row.studentAddress,
            row.studentState,
            row.studentAge,
            row.studentGender,
            row.tags,
            row.leadAssigned,
          ].some((value) => value !== '')
        );

      if (parsedRows.length === 0) {
        toast.error('No valid rows found to import');
        return;
      }

      const response = await fetch('/api/schools/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allowBlank: true,
          enquiries: parsedRows,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import enquiries');
      }

      const importedCount = data.importedCount ?? 0;
      const updatedCount = data.updatedCount ?? 0;
      const failedCount = data.failedCount ?? 0;
      if (importedCount > 0 || updatedCount > 0) {
        toast.success(
          failedCount > 0
            ? `${importedCount} imported, ${updatedCount} updated, ${failedCount} rows failed`
            : `${importedCount} imported, ${updatedCount} updated successfully`
        );
      } else {
        toast.error('No enquiries were imported or updated');
      }

      if (failedCount > 0 && Array.isArray(data.failedRows)) {
        console.error('Failed import rows:', data.failedRows);
      }

      await loadSchoolData();
    } catch (error: any) {
      console.error('Failed to import enquiries:', error);
      toast.error(error.message || 'Failed to import Excel file');
    } finally {
      setImportingEnquiries(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const exportToCSV = () => {
    if (filteredEnquiries.length === 0) {
      toast.error('No enquiries to export');
      return;
    }

    const headers = ['Student Name', 'Email', 'Phone', 'Class', 'Status', 'Date', 'Message', 'Address', 'State', 'Age', 'Gender', 'Tags', 'Lead Assigned', 'Notes'];
    const csvData = filteredEnquiries.map(enquiry => {
      const notesHistory = normalizeNotesHistory((enquiry as any).notes, (enquiry as any).createdAt);
      const notesText = notesHistory.map((n) => `${n.date}: ${n.text}`).join(' | ');

      return [
        enquiry.studentName,
        enquiry.studentEmail,
        enquiry.studentPhone,
        enquiry.studentClass,
        enquiry.status,
        new Date(enquiry.createdAt).toLocaleDateString(),
        enquiry.message || '',
        (enquiry as any).studentAddress || '',
        (enquiry as any).studentState || '',
        (enquiry as any).studentAge || '',
        (enquiry as any).studentGender || '',
        ((enquiry as any).tags || []).join(', '),
        (enquiry as any).leadAssigned || '',
        notesText
      ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImportExcelTemplate = () => {
    const headers = [
      'Student Name',
      'Student Email',
      'Student Phone',
      'Student Class',
      'Status',
      'Latest Note',
      'Message',
      'Student Address',
      'Student State',
      'Student Age',
      'Student Gender',
      'Tags',
      'Lead Assigned',
    ];

    const sampleRows = [
      headers,
      ['Aarav Sharma', 'aarav@example.com', '9876543210', '5th', 'In Progress', 'Follow-up done', 'Interested in admission', 'Pune', 'Maharashtra', '10', 'Male', 'Hot,Scholarship', 'Counsellor A'],
      ['', '', '9876543210', '', 'Lost', 'Not interested now', '', '', '', '', '', '', 'Counsellor A'],
      ['', '', '9123456789', '6th', '', '', '', '', '', '', '', '', ''],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');
    XLSX.writeFile(workbook, 'enquiry_import_template.xlsx');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'In Progress':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'Converted':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'Lost':
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesStatus = filterStatus === 'all' || enquiry.status === filterStatus;
    const query = searchTerm.trim().toLowerCase();
    const tags = ((enquiry as any).tags || []) as string[];
    const leadAssigned = ((enquiry as any).leadAssigned || '').toString().trim();
    const searchableFields = [
      enquiry.studentName || '',
      enquiry.studentEmail || '',
      enquiry.studentPhone || '',
      enquiry.studentClass || '',
      enquiry.status || '',
      leadAssigned,
      enquiry.message || '',
      getLatestNoteText((enquiry as any).notes),
      tags.join(' '),
      new Date(enquiry.createdAt).toLocaleDateString(),
    ];
    const matchesSearch = query === '' || searchableFields.some((value) => String(value).toLowerCase().includes(query));
    const matchesTag =
      filterTag === 'all'
        ? true
        : filterTag === NO_TAGS_FILTER
          ? tags.length === 0
          : tags.includes(filterTag);
    const matchesLead =
      filterLead === 'all'
        ? true
        : filterLead === NO_LEAD_FILTER
          ? leadAssigned === ''
          : leadAssigned === filterLead;
    return matchesStatus && matchesSearch && matchesTag && matchesLead;
  });

  const totalEnquiryPages = Math.ceil(filteredEnquiries.length / ENQUIRIES_PER_PAGE);
  const paginatedEnquiries = filteredEnquiries.slice(
    (enquiryPage - 1) * ENQUIRIES_PER_PAGE,
    enquiryPage * ENQUIRIES_PER_PAGE
  );

  const stats = {
    totalLeads: enquiries.length,
    newEnquiries: enquiries.filter(e => e.status === 'New').length,
    inProgress: enquiries.filter(e => e.status === 'In Progress').length,
    converted: enquiries.filter(e => e.status === 'Converted').length,
    lost: enquiries.filter(e => e.status === 'Lost').length,
    contacted: Math.floor(enquiries.length * 0.85),
  };

  // Calculate previous month stats for comparison
  const now = new Date();
  const today = new Date();
  // Fixed: Assign today for consistency
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

  const thisMonthEnquiries = enquiries.filter(e => new Date(e.createdAt) >= thisMonthStart);
  const lastMonthEnquiries = enquiries.filter(e => {
    const date = new Date(e.createdAt);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const thisMonthConverted = thisMonthEnquiries.filter(e => e.status === 'Converted').length;
  const lastMonthConverted = lastMonthEnquiries.filter(e => e.status === 'Converted').length;

  // Calculate growth percentage (avoid division by zero)
  const growthPercentage = lastMonthEnquiries.length > 0
    ? Math.round(((thisMonthEnquiries.length - lastMonthEnquiries.length) / lastMonthEnquiries.length) * 100)
    : 0;

  // Calculate conversion rate
  const conversionRate = stats.totalLeads > 0
    ? Math.round((stats.converted / stats.totalLeads) * 100)
    : 0;

  const loadReviews = async () => {
    const token = localStorage.getItem('token');
    const schoolId = profile?.id;
    if (!token || !schoolId) return;

    setReviewsLoading(true);
    try {
      const response = await fetch(
        `/api/reviews?schoolId=${schoolId}&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadReviewStats = async () => {
    const token = localStorage.getItem('token');
    const schoolId = profile?.id;
    if (!token || !schoolId) return;

    setStatsLoading(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}/reviews/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReviewStats(data);
      }
    } catch (error) {
      console.error('Failed to load review stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setNotificationsLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId || n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const unreadNotifications = notifications.filter(n => !n.isRead);
    for (const notification of unreadNotifications) {
      await markNotificationRead(notification.id || notification._id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'enquiry':
        return <MessageSquare className="text-cyan-500" size={16} />;
      case 'review':
        return <Star className="text-yellow-500" size={16} />;
      default:
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  const handleModerateReview = async (reviewId: number, action: 'approved' | 'rejected') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus: action }),
      });

      if (!response.ok) {
        throw new Error('Failed to moderate review');
      }

      toast.success(`Review ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
      loadReviews();
      loadReviewStats();
    } catch (error) {
      toast.error('Failed to moderate review');
    }
  };

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  function getLatestNoteText(notesValue: unknown): string {
    const notesHistory = normalizeNotesHistory(notesValue);
    if (notesHistory.length === 0) return '';
    return notesHistory[notesHistory.length - 1].text;
  }

  function getLatestNoteDate(notesValue: unknown): string {
    const notesHistory = normalizeNotesHistory(notesValue);
    if (notesHistory.length === 0) return '';
    return notesHistory[notesHistory.length - 1].date;
  }

  const renderEnquirySection = () => (
    <div className="space-y-6">
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <MessageSquare className="text-white" size={20} />
              </div>
              Leads & Enquiries
            </CardTitle>
            <div className="flex gap-2 flex-wrap items-center">
              <Button
                onClick={() => setShowAddEnquiryModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
              >
                  <Plus className="mr-2" size={16} />
                  Add Enquiry
                </Button>
                <input
                  ref={enquiryImportInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleImportExcel}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 shadow-sm"
                    >
                      <FileDown className="mr-2" size={16} />
                      Import / Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => enquiryImportInputRef.current?.click()}
                      disabled={importingEnquiries}
                      className="cursor-pointer"
                    >
                      {importingEnquiries ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2" size={14} />
                          Import from Excel
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                      <FileDown className="mr-2" size={14} />
                      Export to Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadImportExcelTemplate} className="cursor-pointer">
                      <FileText className="mr-2" size={14} />
                      Download Import Excel File
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setEnquiryPage(1); }}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-cyan-400"
                  />
                </div>
                  <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setEnquiryPage(1); }}>
                  <SelectTrigger className="w-40 bg-white/50">
                    <Filter size={16} className="mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTag} onValueChange={(v) => { setFilterTag(v); setEnquiryPage(1); }}>
                  <SelectTrigger className="w-40 bg-white/50">
                    <Tag size={14} className="mr-2 text-purple-500" />
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    <SelectItem value={NO_TAGS_FILTER}>No Tags</SelectItem>
                    {(profile?.enquiryTags || []).map((tag: string) => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLead} onValueChange={(v) => { setFilterLead(v); setEnquiryPage(1); }}>
                  <SelectTrigger className="w-44 bg-white/50">
                    <UserCog size={14} className="mr-2 text-cyan-600" />
                    <SelectValue placeholder="All Leads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leads</SelectItem>
                    <SelectItem value={NO_LEAD_FILTER}>No Lead</SelectItem>
                    {(profile?.leadStaff || []).map((staff: string) => (
                      <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEnquiries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                <Users className="opacity-50" size={48} />
              </div>
              <p className="text-xl font-semibold mb-2">No enquiries found</p>
              <p>Enquiries from parents will appear here</p>
            </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                      <TableRow className="border-gray-200 hover:bg-transparent">
                        <TableHead className="font-semibold">Student Name</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Phone</TableHead>
                        <TableHead className="font-semibold">Class</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Tags</TableHead>
                        <TableHead className="font-semibold">Lead Assigned</TableHead>
                        <TableHead className="font-semibold">Latest Note</TableHead>
                        <TableHead className="font-semibold">Latest Note Date</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                    <TableBody>
                      {paginatedEnquiries.map((enquiry) => (
                      <TableRow key={enquiry.id} className="border-gray-100 hover:bg-cyan-50/50 transition-colors">
                        <TableCell className="font-semibold">
                          {enquiry.studentName || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={12} className="text-cyan-600" />
                            <span className="text-muted-foreground">{enquiry.studentEmail || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={12} className="text-cyan-600" />
                            <span className="text-muted-foreground">{enquiry.studentPhone || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50">
                            {enquiry.studentClass || '—'}
                          </Badge>
                        </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(enquiry.status)} text-white border-0 shadow-sm`}>
                              {enquiry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[140px]">
                              {((enquiry as any).tags || []).length > 0
                                ? ((enquiry as any).tags as string[]).map((tag) => (
                                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                      {tag}
                                    </span>
                                  ))
                                : <span className="text-xs text-muted-foreground">—</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {(enquiry as any).leadAssigned
                              ? <span className="inline-flex items-center gap-1 text-sm text-cyan-700 font-medium"><UserCog size={13} />{(enquiry as any).leadAssigned}</span>
                              : <span className="text-xs text-muted-foreground">—</span>
                            }
                          </TableCell>
                        <TableCell className="max-w-[220px]">
                          {getLatestNoteText((enquiry as any).notes) ? (
                            <p className="text-xs text-gray-700 truncate" title={getLatestNoteText((enquiry as any).notes)}>
                              {getLatestNoteText((enquiry as any).notes)}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground">â€”</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getLatestNoteDate((enquiry as any).notes)
                            ? new Date(getLatestNoteDate((enquiry as any).notes)).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(enquiry.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-cyan-50">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuItem
                                    onClick={() => setViewMessageEnquiry(enquiry)}
                                    className="cursor-pointer"
                                  >
                                    <MessageSquare className="mr-2" size={14} />
                                    View Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedEnquiry(enquiry);
                                      setEnquiryStatus(enquiry.status);
                                      setEnquiryNotes('');
                                      setEnquiryMessage(enquiry.message || '');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="mr-2" size={14} />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedEnquiry(enquiry);
                                      setEnquiryStatus(enquiry.status);
                                      setEnquiryNotes('');
                                      setEnquiryMessage(enquiry.message || '');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <FileText className="mr-2" size={14} />
                                    Prepare Notes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setTagsEnquiry(enquiry);
                                      setEditTags((enquiry as any).tags || []);
                                      setNewTagInput('');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Tag className="mr-2" size={14} />
                                    Edit Tags
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setLeadEnquiry(enquiry);
                                      setEditLeadAssigned((enquiry as any).leadAssigned || '');
                                      setNewLeadInput('');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <UserCog className="mr-2" size={14} />
                                    Edit Lead Assigned
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setAdditionalDataEnquiry(enquiry);
                                      setAdditionalAddress((enquiry as any).studentAddress || '');
                                      setAdditionalState((enquiry as any).studentState || '');
                                      setAdditionalAge((enquiry as any).studentAge || '');
                                      setAdditionalGender((enquiry as any).studentGender || '');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <UserPlus className="mr-2" size={14} />
                                    Add Additional Data
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditFieldsEnquiry(enquiry);
                                      setEditFieldsName(enquiry.studentName || '');
                                      setEditFieldsEmail(enquiry.studentEmail || '');
                                      setEditFieldsPhone(enquiry.studentPhone || '');
                                      setEditFieldsClass(enquiry.studentClass || '');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="mr-2" size={14} />
                                    Edit Enquiry
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => void handleDeleteEnquiry(enquiry)}
                                    disabled={deletingEnquiryId === normalizeEnquiryId((enquiry as any).id ?? (enquiry as any)._id)}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2" size={14} />
                                    {deletingEnquiryId === normalizeEnquiryId((enquiry as any).id ?? (enquiry as any)._id) ? 'Deleting...' : 'Delete Enquiry'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                </div>
                {totalEnquiryPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {(enquiryPage - 1) * ENQUIRIES_PER_PAGE + 1}–{Math.min(enquiryPage * ENQUIRIES_PER_PAGE, filteredEnquiries.length)} of {filteredEnquiries.length} enquiries
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setEnquiryPage(1)} disabled={enquiryPage === 1} className="h-8 w-8 p-0">«</Button>
                      <Button variant="outline" size="sm" onClick={() => setEnquiryPage(p => Math.max(1, p - 1))} disabled={enquiryPage === 1} className="h-8 px-3">Prev</Button>
                      {Array.from({ length: totalEnquiryPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalEnquiryPages || Math.abs(p - enquiryPage) <= 1)
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                          if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === '…' ? (
                            <span key={`e-${idx}`} className="h-8 w-8 flex items-center justify-center text-sm text-muted-foreground">…</span>
                          ) : (
                            <Button
                              key={p}
                              variant={enquiryPage === p ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setEnquiryPage(p as number)}
                              className={`h-8 w-8 p-0 ${enquiryPage === p ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0' : ''}`}
                            >{p}</Button>
                          )
                        )}
                      <Button variant="outline" size="sm" onClick={() => setEnquiryPage(p => Math.min(totalEnquiryPages, p + 1))} disabled={enquiryPage === totalEnquiryPages} className="h-8 px-3">Next</Button>
                      <Button variant="outline" size="sm" onClick={() => setEnquiryPage(totalEnquiryPages)} disabled={enquiryPage === totalEnquiryPages} className="h-8 w-8 p-0">»</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

      {/* Edit Enquiry Modal */}
      <Dialog open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Edit className="text-white" size={20} />
              </div>
              Update Enquiry - {selectedEnquiry?.studentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
              <Select value={enquiryStatus} onValueChange={setEnquiryStatus}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enquiryMessage" className="text-sm font-semibold">Message</Label>
              <Textarea
                id="enquiryMessage"
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                rows={3}
                placeholder="Update enquiry message..."
                className="bg-white/50 resize-none"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold">Note History</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200">
                {(() => {
                  if (!selectedEnquiry) return null;
                  const notes = normalizeNotesHistory((selectedEnquiry as any).notes, (selectedEnquiry as any).createdAt);

                  if (notes.length === 0) {
                    return <p className="text-sm text-muted-foreground text-center py-4">No notes recorded yet</p>;
                  }

                  return notes.map((note: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                          {new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  )).reverse();
                })()}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold">Add New Note</Label>
              <Textarea
                id="notes"
                value={enquiryNotes}
                onChange={(e) => setEnquiryNotes(e.target.value)}
                rows={3}
                placeholder="Type a new note here..."
                className="bg-white/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => selectedEnquiry && handleUpdateEnquiry(selectedEnquiry.id)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg flex-1"
              >
                <CheckCircle2 className="mr-2" size={18} />
                Update Enquiry
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedEnquiry(null)}
                className="border-2 flex-1"
              >
                <XCircle className="mr-2" size={18} />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Data Modal */}
      <Dialog open={!!additionalDataEnquiry} onOpenChange={(open) => !open && setAdditionalDataEnquiry(null)}>
        <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <UserPlus className="text-white" size={20} />
              </div>
              Add Additional Data - {additionalDataEnquiry?.studentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                  <MapPin size={14} className="text-cyan-600" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={additionalAddress}
                  onChange={(e) => setAdditionalAddress(e.target.value)}
                  rows={6}
                  placeholder="Enter student's address..."
                  className="bg-white/50 resize-none"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                  <Select value={additionalState} onValueChange={setAdditionalState}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                      <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                      <SelectItem value="Assam">Assam</SelectItem>
                      <SelectItem value="Bihar">Bihar</SelectItem>
                      <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                      <SelectItem value="Goa">Goa</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Kerala">Kerala</SelectItem>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Manipur">Manipur</SelectItem>
                      <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                      <SelectItem value="Mizoram">Mizoram</SelectItem>
                      <SelectItem value="Nagaland">Nagaland</SelectItem>
                      <SelectItem value="Odisha">Odisha</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Sikkim">Sikkim</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                      <SelectItem value="Tripura">Tripura</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-semibold">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={additionalAge}
                      onChange={(e) => setAdditionalAge(e.target.value)}
                      placeholder="Age"
                      className="bg-white/50"
                      min="3"
                      max="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold">Gender</Label>
                    <Select value={additionalGender} onValueChange={setAdditionalGender}>
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => additionalDataEnquiry && handleSaveAdditionalData(additionalDataEnquiry.id)}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg flex-1"
                >
                  <CheckCircle2 className="mr-2" size={18} />
                  Save Additional Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAdditionalDataEnquiry(null)}
                  className="border-2 flex-1"
                >
                  <XCircle className="mr-2" size={18} />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Enquiry Modal */}
        <Dialog open={showAddEnquiryModal} onOpenChange={(open) => !open && setShowAddEnquiryModal(false)}>
          <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Plus className="text-white" size={20} />
                </div>
                Add New Enquiry
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName" className="text-sm font-semibold">
                    Student Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentName"
                    value={newEnquiryName}
                    onChange={(e) => setNewEnquiryName(e.target.value)}
                    placeholder="Enter student name"
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail" className="text-sm font-semibold">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    value={newEnquiryEmail}
                    onChange={(e) => setNewEnquiryEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentPhone" className="text-sm font-semibold">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentPhone"
                    type="tel"
                    value={newEnquiryPhone}
                    onChange={(e) => setNewEnquiryPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentClass" className="text-sm font-semibold">
                    Class <span className="text-red-500">*</span>
                  </Label>
                  <Select value={newEnquiryClass} onValueChange={setNewEnquiryClass}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nursery">Nursery</SelectItem>
                      <SelectItem value="LKG">LKG</SelectItem>
                      <SelectItem value="UKG">UKG</SelectItem>
                      <SelectItem value="1st">1st</SelectItem>
                      <SelectItem value="2nd">2nd</SelectItem>
                      <SelectItem value="3rd">3rd</SelectItem>
                      <SelectItem value="4th">4th</SelectItem>
                      <SelectItem value="5th">5th</SelectItem>
                      <SelectItem value="6th">6th</SelectItem>
                      <SelectItem value="7th">7th</SelectItem>
                      <SelectItem value="8th">8th</SelectItem>
                      <SelectItem value="9th">9th</SelectItem>
                      <SelectItem value="10th">10th</SelectItem>
                      <SelectItem value="11th">11th</SelectItem>
                      <SelectItem value="12th">12th</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-semibold">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={newEnquiryMessage}
                  onChange={(e) => setNewEnquiryMessage(e.target.value)}
                  rows={3}
                  placeholder="Enter any additional notes or message..."
                  className="bg-white/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddEnquiry}
                  disabled={addingEnquiry}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg flex-1"
                >
                  {addingEnquiry ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2" size={18} />
                      Add Enquiry
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddEnquiryModal(false);
                    setNewEnquiryName('');
                    setNewEnquiryEmail('');
                    setNewEnquiryPhone('');
                    setNewEnquiryClass('');
                    setNewEnquiryMessage('');
                  }}
                  className="border-2 flex-1"
                >
                  <XCircle className="mr-2" size={18} />
                  Cancel
                </Button>
              </div>
            </div>
            </DialogContent>
          </Dialog>

          {/* View Message Modal */}
          <Dialog open={!!viewMessageEnquiry} onOpenChange={(open) => !open && setViewMessageEnquiry(null)}>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <MessageSquare className="text-white" size={20} />
                  </div>
                  Enquiry Message
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[100px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {viewMessageEnquiry?.message || "No message provided."}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setViewMessageEnquiry(null)} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Tags Modal */}
          <Dialog open={!!tagsEnquiry} onOpenChange={(open) => !open && setTagsEnquiry(null)}>
            <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Tag className="text-white" size={20} />
                  </div>
                  Edit Tags — {tagsEnquiry?.studentName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                {/* Define new tag */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Define New Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="e.g. Hot Lead, Callback, Interested..."
                      className="bg-white/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNewTag()}
                    />
                    <Button onClick={handleSaveNewTag} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 shrink-0">
                      + Add
                    </Button>
                  </div>
                </div>

                  {/* Available tags to pick */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Select Tags</Label>
                    <div className="space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[60px] max-h-56 overflow-y-auto overscroll-contain pr-2">
                      {(profile?.enquiryTags || []).length === 0 && (
                        <span className="text-xs text-muted-foreground">No tags defined yet. Add one above.</span>
                      )}
                      {(profile?.enquiryTags || []).map((tag: string, idx: number) => {
                        const selected = editTags.includes(tag);
                        const isEditing = editingTagIndex === idx;
                        return (
                          <div key={tag} className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Input
                                  value={editingTagValue}
                                  onChange={(e) => setEditingTagValue(e.target.value)}
                                  className="h-8 text-xs flex-1"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameTag(idx);
                                    if (e.key === 'Escape') { setEditingTagIndex(null); setEditingTagValue(''); }
                                  }}
                                />
                                <Button size="sm" className="h-8 px-2 bg-purple-600 hover:bg-purple-700 text-white text-xs" onClick={() => handleRenameTag(idx)}>Save</Button>
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => { setEditingTagIndex(null); setEditingTagValue(''); }}>×</Button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditTags(selected ? editTags.filter((t) => t !== tag) : [...editTags, tag])}
                                  className={`flex-1 text-left px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    selected
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                      : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                                  }`}
                                >
                                  {selected ? '✓ ' : ''}{tag}
                                </button>
                                <button
                                  title="Rename"
                                  onClick={() => { setEditingTagIndex(idx); setEditingTagValue(tag); }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() => handleDeleteTag(idx)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                {/* Current selection preview */}
                {editTags.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Selected tags:</Label>
                    <div className="flex flex-wrap gap-1">
                      {editTags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                          {tag}
                          <button onClick={() => setEditTags(editTags.filter((t) => t !== tag))} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveTags}
                    disabled={savingTags}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg flex-1"
                  >
                    {savingTags ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" /> : <CheckCircle2 className="mr-2" size={18} />}
                    Save Tags
                  </Button>
                  <Button variant="outline" onClick={() => setTagsEnquiry(null)} className="border-2 flex-1">
                    <XCircle className="mr-2" size={18} />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Lead Assigned Modal */}
          <Dialog open={!!leadEnquiry} onOpenChange={(open) => !open && setLeadEnquiry(null)}>
            <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                    <UserCog className="text-white" size={20} />
                  </div>
                  Lead Assigned — {leadEnquiry?.studentName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                {/* Define new staff */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Add Staff Member</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newLeadInput}
                      onChange={(e) => setNewLeadInput(e.target.value)}
                      placeholder="e.g. Rahul Sharma, Priya Mehta..."
                      className="bg-white/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNewLeadStaff()}
                    />
                    <Button onClick={handleSaveNewLeadStaff} variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 shrink-0">
                      + Add
                    </Button>
                  </div>
                </div>

                  {/* Staff list to pick from */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Assign To</Label>
                    <div className="space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[60px] max-h-56 overflow-y-auto overscroll-contain pr-2">
                      {(profile?.leadStaff || []).length === 0 && (
                        <p className="text-xs text-muted-foreground p-2">No staff defined yet. Add one above.</p>
                      )}
                      {(profile?.leadStaff || []).map((staff: string, idx: number) => {
                        const isEditing = editingStaffIndex === idx;
                        return (
                          <div key={staff} className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Input
                                  value={editingStaffValue}
                                  onChange={(e) => setEditingStaffValue(e.target.value)}
                                  className="h-9 text-sm flex-1"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameStaff(idx);
                                    if (e.key === 'Escape') { setEditingStaffIndex(null); setEditingStaffValue(''); }
                                  }}
                                />
                                <Button size="sm" className="h-9 px-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs" onClick={() => handleRenameStaff(idx)}>Save</Button>
                                <Button size="sm" variant="ghost" className="h-9 px-2 text-xs" onClick={() => { setEditingStaffIndex(null); setEditingStaffValue(''); }}>×</Button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditLeadAssigned(editLeadAssigned === staff ? '' : staff)}
                                  className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                    editLeadAssigned === staff
                                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                                      : 'bg-white text-gray-700 border-gray-200 hover:bg-cyan-50 hover:border-cyan-200'
                                  }`}
                                >
                                  <UserCog size={14} />
                                  {staff}
                                  {editLeadAssigned === staff && <CheckCircle2 size={14} className="ml-auto" />}
                                </button>
                                <button
                                  title="Rename"
                                  onClick={() => { setEditingStaffIndex(idx); setEditingStaffValue(staff); }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() => handleDeleteStaff(idx)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                {editLeadAssigned && (
                  <p className="text-sm text-cyan-700 font-medium">
                    Assigning to: <strong>{editLeadAssigned}</strong>
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveLeadAssigned}
                    disabled={savingLead}
                    className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white shadow-lg flex-1"
                  >
                    {savingLead ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" /> : <CheckCircle2 className="mr-2" size={18} />}
                    Save Lead Assigned
                  </Button>
                  <Button variant="outline" onClick={() => setLeadEnquiry(null)} className="border-2 flex-1">
                    <XCircle className="mr-2" size={18} />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Enquiry Fields Modal */}
          <Dialog open={!!editFieldsEnquiry} onOpenChange={(open) => !open && setEditFieldsEnquiry(null)}>
            <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Pencil className="text-white" size={20} />
                  </div>
                  Edit Enquiry — {editFieldsEnquiry?.studentName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="editName" className="text-sm font-semibold">
                    Student Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="editName"
                    value={editFieldsName}
                    onChange={(e) => setEditFieldsName(e.target.value)}
                    placeholder="Enter student name"
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail" className="text-sm font-semibold">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editFieldsEmail}
                    onChange={(e) => setEditFieldsEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone" className="text-sm font-semibold">Phone Number</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    value={editFieldsPhone}
                    onChange={(e) => setEditFieldsPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClass" className="text-sm font-semibold">Class</Label>
                  <Select value={editFieldsClass} onValueChange={setEditFieldsClass}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nursery">Nursery</SelectItem>
                      <SelectItem value="LKG">LKG</SelectItem>
                      <SelectItem value="UKG">UKG</SelectItem>
                      <SelectItem value="1st">1st</SelectItem>
                      <SelectItem value="2nd">2nd</SelectItem>
                      <SelectItem value="3rd">3rd</SelectItem>
                      <SelectItem value="4th">4th</SelectItem>
                      <SelectItem value="5th">5th</SelectItem>
                      <SelectItem value="6th">6th</SelectItem>
                      <SelectItem value="7th">7th</SelectItem>
                      <SelectItem value="8th">8th</SelectItem>
                      <SelectItem value="9th">9th</SelectItem>
                      <SelectItem value="10th">10th</SelectItem>
                      <SelectItem value="11th">11th</SelectItem>
                      <SelectItem value="12th">12th</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveFields}
                    disabled={savingFields}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg flex-1"
                  >
                    {savingFields ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" /> : <CheckCircle2 className="mr-2" size={18} />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditFieldsEnquiry(null)} className="border-2 flex-1">
                    <XCircle className="mr-2" size={18} />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        );


  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-80 bg-gradient-to-b from-cyan-600 to-blue-700 p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-white/20 rounded-xl mb-8" />
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/50 rounded-xl w-1/4 mb-6" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white/50 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-300/20 to-blue-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-300/10 to-pink-300/10 rounded-full blur-3xl -z-10" />

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 
        bg-gradient-to-b from-cyan-500 via-cyan-600 to-blue-700 
        p-6 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full" />
          <button
            onClick={() => router.push('/')}
            className="relative flex items-center gap-3 w-full hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <h2 className="text-white text-2xl font-bold">PickMySchool</h2>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group ${
                  isActive
                    ? 'bg-white text-cyan-600 shadow-lg scale-105 font-semibold'
                    : 'text-white/90 hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-cyan-600' : 'text-white/80 group-hover:text-white'} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
              <Building2 className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/70 text-xs">School Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-4 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="hidden lg:block w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div className="min-w-0 ml-12 lg:ml-0">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent truncate">
                  Welcome, {user.name}!
                </h1>
                <p className="text-sm text-muted-foreground">Manage your institution</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Rating */}
              <div className="hidden md:flex items-center gap-1 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
                {[...Array(5)].map((_, i) => {
                  const avgRating = reviewStats?.averageRating || 0;
                  return (
                    <Star
                      key={i}
                      size={18}
                      className={
                        avgRating > 0 && i < Math.floor(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : avgRating > 0 && i < avgRating
                          ? 'fill-yellow-400/50 text-yellow-400'
                          : 'fill-gray-300 text-gray-300'
                      }
                    />
                  );
                })}
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {reviewStats ? reviewStats.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              
{/* Notifications */}
                <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors group">
                      <Bell size={20} className="text-gray-600 group-hover:text-cyan-600 transition-colors" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto bg-white/95 backdrop-blur-2xl border-gray-200/60 shadow-2xl rounded-xl p-0">
                    <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllNotificationsRead();
                          }}
                          className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notificationsLoading ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Bell className="mx-auto mb-2 opacity-30" size={32} />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id || notification._id}
                            onClick={() => {
                              if (!notification.isRead) {
                                markNotificationRead(notification.id || notification._id);
                              }
                              // Navigate to relevant section based on notification type
                              if (notification.type === 'enquiry') {
                                setActiveSection('enquiry');
                              } else if (notification.type === 'review') {
                                setActiveSection('review');
                              }
                              setShowNotifications(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                              !notification.isRead ? 'bg-cyan-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                notification.type === 'enquiry' 
                                  ? 'bg-cyan-100' 
                                  : notification.type === 'review'
                                  ? 'bg-yellow-100'
                                  : 'bg-gray-100'
                              }`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              
              {/* User Profile with Logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
                    <UserIcon size={20} className="text-gray-600 group-hover:text-cyan-600 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-2xl border-gray-200/60 shadow-2xl rounded-xl p-2">
                  <div className="px-3 py-2 mb-2">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">School Admin</p>
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200">
                    <LogOut className="h-4 w-4 mr-2.5" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* School Profile Summary */}
              {profile && (
                <Card className="border-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50/30 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Building2 className="text-white" size={20} />
                      </div>
                      School Profile Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">No. of Students</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.totalStudents || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">No. of Teachers</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.totalTeachers || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">Board</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.board || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">School Type</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.schoolType || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">Est. Year</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.establishmentYear || 'Not set'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

                  {/* Stats Grid - Modern Bento Style */}
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-6">
                    {/* Total Enquiries */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Users className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <Target className="text-cyan-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">Total Enquiries</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.totalLeads}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp size={10} className={growthPercentage >= 0 ? "text-green-600" : "text-red-600"} />
                          <span className={growthPercentage >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{growthPercentage > 0 ? '+' : ''}{growthPercentage}%</span>
                        </p>
                      </CardContent>
                    </Card>

                    {/* Admission Confirmed */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <Trophy className="text-green-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">Confirmed</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.converted}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <span className="text-green-600 font-bold">{conversionRate}%</span> rate
                        </p>
                      </CardContent>
                    </Card>

                    {/* In Progress */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                            <Clock className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <AlertCircle className="text-yellow-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">In Progress</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.inProgress}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground">Pending</p>
                      </CardContent>
                    </Card>

                    {/* Lost Admission */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                            <XCircle className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <ThumbsDown className="text-red-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">Lost</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.lost}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground">
                          {stats.totalLeads > 0 ? Math.round((stats.lost / stats.totalLeads) * 100) : 0}% loss
                        </p>
                      </CardContent>
                    </Card>

                    {/* New Enquiries */}
                    <Card className="col-span-2 xl:col-span-1 group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <Sparkles className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <ArrowUpRight className="text-purple-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">New Enquiries</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.newEnquiries}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground">Awaiting</p>
                      </CardContent>
                    </Card>
                  </div>

                {/* Conversion Funnel */}

              <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <BarChart3 className="text-white" size={20} />
                    </div>
                    Admission Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {/* Enquiries */}
                    <div className="group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-semibold text-gray-700">Enquiries</span>
                        <span className="text-2xl font-bold text-cyan-600">{stats.totalLeads}</span>
                      </div>
                      <div className="relative h-16 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      </div>
                    </div>
                    {/* In Progress */}
                    <div className="group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-semibold text-gray-700">In Progress</span>
                        <span className="text-2xl font-bold text-yellow-600">{stats.inProgress}</span>
                      </div>
                      <div className="relative h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl overflow-hidden shadow-lg" style={{ width: '65%' }}>
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      </div>
                    </div>
                      {/* Confirmed */}
                      <div className="group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-semibold text-gray-700">Confirmed Admissions</span>
                          <span className="text-2xl font-bold text-green-600">{stats.converted}</span>
                        </div>
                        <div className="relative h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl overflow-hidden shadow-lg" style={{ width: '45%' }}>
                          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                        </div>
                      </div>
                      {/* Lost Admissions */}
                      <div className="group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-semibold text-gray-700">Lost Admissions</span>
                          <span className="text-2xl font-bold text-red-600">{stats.lost}</span>
                        </div>
                        <div className="relative h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl overflow-hidden shadow-lg" style={{ width: '25%' }}>
                          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                        </div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'lead-dashboard' && (() => {
            // ── Tag Stats ──────────────────────────────────────────────
            const allTagNames = Array.from(
              new Set(enquiries.flatMap(e => ((e as any).tags || []) as string[]))
            ).sort();
            const untagged = enquiries.filter(e => ((e as any).tags || []).length === 0);
            const tagStatsRaw = [
              ...allTagNames.map(tag => {
                const tagged = enquiries.filter(e => ((e as any).tags || []).includes(tag));
                return { tag, new: tagged.filter(e => e.status === 'New').length, inProgress: tagged.filter(e => e.status === 'In Progress').length, converted: tagged.filter(e => e.status === 'Converted').length, lost: tagged.filter(e => e.status === 'Lost').length, total: tagged.length, isUnknown: false };
              }),
              ...(untagged.length > 0 ? [{ tag: 'Unknown', new: untagged.filter(e => e.status === 'New').length, inProgress: untagged.filter(e => e.status === 'In Progress').length, converted: untagged.filter(e => e.status === 'Converted').length, lost: untagged.filter(e => e.status === 'Lost').length, total: untagged.length, isUnknown: true }] : []),
            ];
            const tagTotal = { new: tagStatsRaw.reduce((s, r) => s + r.new, 0), inProgress: tagStatsRaw.reduce((s, r) => s + r.inProgress, 0), converted: tagStatsRaw.reduce((s, r) => s + r.converted, 0), lost: tagStatsRaw.reduce((s, r) => s + r.lost, 0), total: tagStatsRaw.reduce((s, r) => s + r.total, 0) };
            const sortedTagStats = [...tagStatsRaw].sort((a, b) => {
              if (a.isUnknown) return 1;
              if (b.isUnknown) return -1;
              const { col, dir } = leadDashboardSort;
              const cmp = col === 'tag' ? a.tag.localeCompare(b.tag) : a[col] - b[col];
              return dir === 'asc' ? cmp : -cmp;
            });
            const handleTagSort = (col: typeof leadDashboardSort.col) => {
              setLeadDashboardSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: col === 'tag' ? 'asc' : 'desc' });
            };

            // ── Lead Assigned Stats ─────────────────────────────────────
            const allLeadNames = Array.from(
              new Set(enquiries.map(e => ((e as any).leadAssigned || '').toString().trim()).filter(l => l !== ''))
            ).sort();
            const unassigned = enquiries.filter(e => !((e as any).leadAssigned || '').toString().trim());
            const leadStatsRaw = [
              ...allLeadNames.map(lead => {
                const le = enquiries.filter(e => ((e as any).leadAssigned || '').toString().trim() === lead);
                return { lead, new: le.filter(e => e.status === 'New').length, inProgress: le.filter(e => e.status === 'In Progress').length, converted: le.filter(e => e.status === 'Converted').length, lost: le.filter(e => e.status === 'Lost').length, total: le.length, isUnknown: false };
              }),
              ...(unassigned.length > 0 ? [{ lead: 'Unknown', new: unassigned.filter(e => e.status === 'New').length, inProgress: unassigned.filter(e => e.status === 'In Progress').length, converted: unassigned.filter(e => e.status === 'Converted').length, lost: unassigned.filter(e => e.status === 'Lost').length, total: unassigned.length, isUnknown: true }] : []),
            ];
            const leadTotal = { new: leadStatsRaw.reduce((s, r) => s + r.new, 0), inProgress: leadStatsRaw.reduce((s, r) => s + r.inProgress, 0), converted: leadStatsRaw.reduce((s, r) => s + r.converted, 0), lost: leadStatsRaw.reduce((s, r) => s + r.lost, 0), total: leadStatsRaw.reduce((s, r) => s + r.total, 0) };
            const sortedLeadStats = [...leadStatsRaw].sort((a, b) => {
              if (a.isUnknown) return 1;
              if (b.isUnknown) return -1;
              const { col, dir } = leadAssignedSort;
              const cmp = col === 'lead' ? a.lead.localeCompare(b.lead) : a[col] - b[col];
              return dir === 'asc' ? cmp : -cmp;
            });
            const handleLeadSort = (col: typeof leadAssignedSort.col) => {
              setLeadAssignedSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: col === 'lead' ? 'asc' : 'desc' });
            };

            // ── Class Stats ─────────────────────────────────────────────
            const CLASS_ORDER = ['Nursery','LKG','UKG','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
            const allClassNames = Array.from(
              new Set(enquiries.map(e => (e.studentClass || '').toString().trim()).filter(c => c !== ''))
            ).sort((a, b) => {
              const ai = CLASS_ORDER.indexOf(a), bi = CLASS_ORDER.indexOf(b);
              if (ai !== -1 && bi !== -1) return ai - bi;
              if (ai !== -1) return -1;
              if (bi !== -1) return 1;
              return a.localeCompare(b);
            });
            const noClass = enquiries.filter(e => !(e.studentClass || '').toString().trim());
            const classStatsRaw = [
              ...allClassNames.map(cls => {
                const ce = enquiries.filter(e => (e.studentClass || '').toString().trim() === cls);
                return { class: cls, new: ce.filter(e => e.status === 'New').length, inProgress: ce.filter(e => e.status === 'In Progress').length, converted: ce.filter(e => e.status === 'Converted').length, lost: ce.filter(e => e.status === 'Lost').length, total: ce.length, isUnknown: false };
              }),
              ...(noClass.length > 0 ? [{ class: 'Unknown', new: noClass.filter(e => e.status === 'New').length, inProgress: noClass.filter(e => e.status === 'In Progress').length, converted: noClass.filter(e => e.status === 'Converted').length, lost: noClass.filter(e => e.status === 'Lost').length, total: noClass.length, isUnknown: true }] : []),
            ];
            const classTotal = { new: classStatsRaw.reduce((s, r) => s + r.new, 0), inProgress: classStatsRaw.reduce((s, r) => s + r.inProgress, 0), converted: classStatsRaw.reduce((s, r) => s + r.converted, 0), lost: classStatsRaw.reduce((s, r) => s + r.lost, 0), total: classStatsRaw.reduce((s, r) => s + r.total, 0) };
            const sortedClassStats = [...classStatsRaw].sort((a, b) => {
              if (a.isUnknown) return 1;
              if (b.isUnknown) return -1;
              const { col, dir } = classSort;
              let cmp = 0;
              if (col === 'class') {
                const ai = CLASS_ORDER.indexOf(a.class), bi = CLASS_ORDER.indexOf(b.class);
                cmp = (ai !== -1 && bi !== -1) ? ai - bi : ai !== -1 ? -1 : bi !== -1 ? 1 : a.class.localeCompare(b.class);
              } else {
                cmp = a[col] - b[col];
              }
              return dir === 'asc' ? cmp : -cmp;
            });
            const handleClassSort = (col: typeof classSort.col) => {
              setClassSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: col === 'class' ? 'asc' : 'desc' });
            };

            // ── Shared helpers ──────────────────────────────────────────
            const SortIcon = ({ active, isAsc }: { active: boolean; isAsc: boolean }) => (
              <span className={`ml-1 inline-flex flex-col leading-none text-[10px] ${active ? 'opacity-100' : 'opacity-30'}`}>
                <span className={isAsc ? 'text-current' : 'opacity-40'}>▲</span>
                <span className={!isAsc ? 'text-current' : 'opacity-40'}>▼</span>
              </span>
            );

            const numCell = (val: number, bg: string, text: string) => val > 0
              ? <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full ${bg} ${text} font-semibold text-sm`}>{val}</span>
              : <span className="text-gray-300 text-sm">—</span>;

            const totalNumCell = (val: number, bg: string, text: string) => (
              <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full ${bg} ${text} font-bold text-sm`}>{val}</span>
            );

            return (
              <div className="space-y-8">
                <div className="mb-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Lead Dashboard
                  </h2>
                  <p className="text-muted-foreground text-lg">Enquiry counts across all statuses</p>
                </div>

                {/* ── Tag-wise Table ── */}
                <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Tag className="text-white" size={20} />
                      </div>
                      Tag-wise Enquiry Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tagStatsRaw.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                          <Tag className="opacity-40" size={40} />
                        </div>
                        <p className="text-lg font-medium">No data yet</p>
                        <p className="text-sm mt-1">Add tags to your enquiries to see data here.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-gray-200">
                              <TableHead className="font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleTagSort('tag')}>
                                Tag <SortIcon active={leadDashboardSort.col === 'tag'} isAsc={leadDashboardSort.col === 'tag' && leadDashboardSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-purple-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleTagSort('new')}>
                                New <SortIcon active={leadDashboardSort.col === 'new'} isAsc={leadDashboardSort.col === 'new' && leadDashboardSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-yellow-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleTagSort('inProgress')}>
                                In Progress <SortIcon active={leadDashboardSort.col === 'inProgress'} isAsc={leadDashboardSort.col === 'inProgress' && leadDashboardSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-green-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleTagSort('converted')}>
                                Converted <SortIcon active={leadDashboardSort.col === 'converted'} isAsc={leadDashboardSort.col === 'converted' && leadDashboardSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-red-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleTagSort('lost')}>
                                Lost <SortIcon active={leadDashboardSort.col === 'lost'} isAsc={leadDashboardSort.col === 'lost' && leadDashboardSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-cyan-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleTagSort('total')}>
                                Total <SortIcon active={leadDashboardSort.col === 'total'} isAsc={leadDashboardSort.col === 'total' && leadDashboardSort.dir === 'asc'} />
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedTagStats.map(row => (
                              <TableRow key={row.tag} className="hover:bg-gray-50/80 transition-colors">
                                <TableCell>
                                  <Badge variant={row.isUnknown ? 'outline' : 'secondary'} className={`font-medium ${row.isUnknown ? 'border-gray-300 text-gray-400 italic' : ''}`}>
                                    {row.tag}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">{numCell(row.new, 'bg-purple-100', 'text-purple-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.inProgress, 'bg-yellow-100', 'text-yellow-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.converted, 'bg-green-100', 'text-green-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.lost, 'bg-red-100', 'text-red-700')}</TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">{row.total}</span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <tfoot>
                            <TableRow className="bg-gray-50/80 border-t-2 border-gray-200 font-bold">
                              <TableCell className="font-bold text-gray-800">Total</TableCell>
                              <TableCell className="text-center">{totalNumCell(tagTotal.new, 'bg-purple-200', 'text-purple-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(tagTotal.inProgress, 'bg-yellow-200', 'text-yellow-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(tagTotal.converted, 'bg-green-200', 'text-green-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(tagTotal.lost, 'bg-red-200', 'text-red-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(tagTotal.total, 'bg-cyan-200', 'text-cyan-800')}</TableCell>
                            </TableRow>
                          </tfoot>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── Lead Assigned Table ── */}
                <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Users className="text-white" size={20} />
                      </div>
                      Lead Assigned Enquiry Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leadStatsRaw.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                          <Users className="opacity-40" size={40} />
                        </div>
                        <p className="text-lg font-medium">No data yet</p>
                        <p className="text-sm mt-1">Assign leads to your enquiries to see data here.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-gray-200">
                              <TableHead className="font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleLeadSort('lead')}>
                                Lead Assigned <SortIcon active={leadAssignedSort.col === 'lead'} isAsc={leadAssignedSort.col === 'lead' && leadAssignedSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-purple-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleLeadSort('new')}>
                                New <SortIcon active={leadAssignedSort.col === 'new'} isAsc={leadAssignedSort.col === 'new' && leadAssignedSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-yellow-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleLeadSort('inProgress')}>
                                In Progress <SortIcon active={leadAssignedSort.col === 'inProgress'} isAsc={leadAssignedSort.col === 'inProgress' && leadAssignedSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-green-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleLeadSort('converted')}>
                                Converted <SortIcon active={leadAssignedSort.col === 'converted'} isAsc={leadAssignedSort.col === 'converted' && leadAssignedSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-red-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleLeadSort('lost')}>
                                Lost <SortIcon active={leadAssignedSort.col === 'lost'} isAsc={leadAssignedSort.col === 'lost' && leadAssignedSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-cyan-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleLeadSort('total')}>
                                Total <SortIcon active={leadAssignedSort.col === 'total'} isAsc={leadAssignedSort.col === 'total' && leadAssignedSort.dir === 'asc'} />
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedLeadStats.map(row => (
                              <TableRow key={row.lead} className="hover:bg-gray-50/80 transition-colors">
                                <TableCell>
                                  <Badge variant={row.isUnknown ? 'outline' : 'secondary'} className={`font-medium ${row.isUnknown ? 'border-gray-300 text-gray-400 italic' : ''}`}>
                                    {row.lead}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">{numCell(row.new, 'bg-purple-100', 'text-purple-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.inProgress, 'bg-yellow-100', 'text-yellow-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.converted, 'bg-green-100', 'text-green-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.lost, 'bg-red-100', 'text-red-700')}</TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">{row.total}</span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <tfoot>
                            <TableRow className="bg-gray-50/80 border-t-2 border-gray-200 font-bold">
                              <TableCell className="font-bold text-gray-800">Total</TableCell>
                              <TableCell className="text-center">{totalNumCell(leadTotal.new, 'bg-purple-200', 'text-purple-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(leadTotal.inProgress, 'bg-yellow-200', 'text-yellow-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(leadTotal.converted, 'bg-green-200', 'text-green-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(leadTotal.lost, 'bg-red-200', 'text-red-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(leadTotal.total, 'bg-cyan-200', 'text-cyan-800')}</TableCell>
                            </TableRow>
                          </tfoot>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* ── Class-wise Table ── */}
                <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                        <GraduationCap className="text-white" size={20} />
                      </div>
                      Class-wise Enquiry Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {classStatsRaw.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="opacity-40" size={40} />
                        </div>
                        <p className="text-lg font-medium">No data yet</p>
                        <p className="text-sm mt-1">Enquiries with a class assigned will appear here.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-gray-200">
                              <TableHead className="font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleClassSort('class')}>
                                Class <SortIcon active={classSort.col === 'class'} isAsc={classSort.col === 'class' && classSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-purple-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleClassSort('new')}>
                                New <SortIcon active={classSort.col === 'new'} isAsc={classSort.col === 'new' && classSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-yellow-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleClassSort('inProgress')}>
                                In Progress <SortIcon active={classSort.col === 'inProgress'} isAsc={classSort.col === 'inProgress' && classSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-green-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleClassSort('converted')}>
                                Converted <SortIcon active={classSort.col === 'converted'} isAsc={classSort.col === 'converted' && classSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-red-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleClassSort('lost')}>
                                Lost <SortIcon active={classSort.col === 'lost'} isAsc={classSort.col === 'lost' && classSort.dir === 'asc'} />
                              </TableHead>
                              <TableHead className="text-center font-semibold text-cyan-600 cursor-pointer select-none hover:bg-gray-50 transition-colors" onClick={() => handleClassSort('total')}>
                                Total <SortIcon active={classSort.col === 'total'} isAsc={classSort.col === 'total' && classSort.dir === 'asc'} />
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedClassStats.map(row => (
                              <TableRow key={row.class} className="hover:bg-gray-50/80 transition-colors">
                                <TableCell>
                                  <Badge variant={row.isUnknown ? 'outline' : 'secondary'} className={`font-medium ${row.isUnknown ? 'border-gray-300 text-gray-400 italic' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                                    {row.class}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">{numCell(row.new, 'bg-purple-100', 'text-purple-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.inProgress, 'bg-yellow-100', 'text-yellow-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.converted, 'bg-green-100', 'text-green-700')}</TableCell>
                                <TableCell className="text-center">{numCell(row.lost, 'bg-red-100', 'text-red-700')}</TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">{row.total}</span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <tfoot>
                            <TableRow className="bg-gray-50/80 border-t-2 border-gray-200 font-bold">
                              <TableCell className="font-bold text-gray-800">Total</TableCell>
                              <TableCell className="text-center">{totalNumCell(classTotal.new, 'bg-purple-200', 'text-purple-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(classTotal.inProgress, 'bg-yellow-200', 'text-yellow-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(classTotal.converted, 'bg-green-200', 'text-green-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(classTotal.lost, 'bg-red-200', 'text-red-800')}</TableCell>
                              <TableCell className="text-center">{totalNumCell(classTotal.total, 'bg-cyan-200', 'text-cyan-800')}</TableCell>
                            </TableRow>
                          </tfoot>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {activeSection === 'enquiry' && renderEnquirySection()}
          
            {activeSection === 'whatsapp-api' && (
                <WhatsappAPISection profile={profile} onRefresh={loadSchoolProfile} />
              )}

            {activeSection === 'enquiry-settings' && (
              <EnquirySettingsSection schoolId={profile?.id || null} />
            )}

            {activeSection === 'school-page' && (
              // This is the added section with your comments
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    School Page Preview
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    View your public school page and control its visibility
                  </p>
                </div>
                <SchoolPagePreview schoolId={profile?.id || null} />
              </div>
            )}


          {activeSection === 'basic-info' && (
            <BasicInfoSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'contact' && (
            <ContactInfoSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'facilities' && (
            <FacilitiesSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'gallery' && (
            <GallerySection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'virtualtour' && (
            <VirtualTourSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'fees' && (
            <FeesSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsSection
              user={user}
              onUserUpdate={handleUserUpdate}
            />
          )}

          {/* Review Section */}
          {activeSection === 'review' && (
            <div className="space-y-6">
                {/* Review Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {statsLoading ? (
                    <div className="col-span-3 text-center py-8">
                      <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading statistics...</p>
                    </div>
                  ) : reviewStats ? (
                    <>
                      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                              <Star className="text-white" size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                              <p className="text-2xl font-bold">{reviewStats.averageRating.toFixed(1)} / 5.0</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="text-white" size={24} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                                <p className="text-2xl font-bold">{reviewStats.counts?.approved + (reviewStats.counts?.pending || 0) + (reviewStats.counts?.rejected || 0) || 0}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : null}
                  </div>
                  <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Star className="text-white" size={20} />
                          </div>
                          Review Management
                        </CardTitle>
                      </div>
                    </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                          <Star className="opacity-50" size={48} />
                        </div>
                        <p className="text-xl font-semibold mb-2">No reviews found</p>
                        <p>Reviews will appear here once students submit them</p>
                      </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className="border-0 bg-white shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            {/* Review Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                  {review.studentName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg">{review.studentName}</h4>
                                  <div className="flex items-center gap-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={18}
                                        className={
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-gray-200 text-gray-200'
                                        }
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {getReviewStatusBadge(review.approvalStatus)}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Review Text */}
                            <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
                              {review.reviewText}
                            </p>

                            {/* Review Photos */}
                            {review.photos && review.photos.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {review.photos.map((photo: string, index: number) => (
                                  <div
                                    key={index}
                                    className="aspect-video rounded-lg overflow-hidden border-2 border-gray-100"
                                  >
                                    <img
                                      src={photo}
                                      alt={`Review photo ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Action Buttons */}
                            {review.approvalStatus === 'pending' && (
                              <div className="flex gap-3 pt-4 border-t">
                                <Button
                                  onClick={() => handleModerateReview(review.id, 'approved')}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                                >
                                  <ThumbsUp className="mr-2" size={16} />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleModerateReview(review.id, 'rejected')}
                                  variant="outline"
                                  className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                >
                                  <ThumbsDown className="mr-2" size={16} />
                                  Reject
                                </Button>
                              </div>
                            )}

                            {review.approvalStatus === 'approved' && (
                              <div className="flex items-center gap-2 pt-4 border-t">
                                <CheckCircle2 size={16} className="text-green-600" />
                                <span className="text-sm text-green-600 font-semibold">
                                  This review is visible on your school's public page
                                </span>
                              </div>
                            )}

                            {review.approvalStatus === 'rejected' && (
                              <div className="flex items-center gap-2 pt-4 border-t">
                                <XCircle size={16} className="text-red-600" />
                                <span className="text-sm text-red-600 font-semibold">
                                  This review has been rejected and is not visible publicly
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          {activeSection === 'results' && (
            <ResultsSection schoolId={profile?.id || 0} />
          )}

          {/* Alumni Section */}
          {activeSection === 'alumini' && (
            <AlumniSection schoolId={profile?.id || 0} />
          )}

          {/* News Section */}
          {activeSection === 'news' && (
            <NewsSection schoolId={profile?.id || 0} />
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <AnalyticsSection schoolId={profile?.id || 0} />
          )}

          {/* Other sections - Coming Soon */}
          {!['dashboard', 'lead-dashboard', 'enquiry', 'whatsapp-api', 'enquiry-settings', 'basic-info', 'contact', 'facilities', 'gallery', 'virtualtour', 'fees', 'settings', 'review', 'results', 'alumini', 'news', 'analytics', 'school-page'].includes(activeSection) && (
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
              <CardContent className="p-16">
                <div className="text-center text-muted-foreground">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="opacity-50" size={48} />
                  </div>
                  <p className="text-2xl mb-3 font-bold capitalize bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {activeSection.replace('-', ' ')}
                  </p>
                  <p className="text-lg">This section is coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">We're working hard to bring you this feature</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </main>
      </div>
    );
  }
