'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Phone, MapPin, Building2, User, Calendar,
  Eye, Edit, Trash2, MessageSquare, GraduationCap
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ContactSubmission {
  id: number;
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  message: string | null;
  subject: string | null;
  interestedClass: string | null;
  status: string;
  notes: string | null;
  assignedTo: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function ContactSubmissionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact-submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setEditStatus(submission.status);
    setEditNotes(submission.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(`/api/contact-submissions/${selectedSubmission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
        }),
      });

      if (response.ok) {
        toast.success('Submission updated successfully');
        setIsEditDialogOpen(false);
        loadSubmissions();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Submission deleted successfully');
        loadSubmissions();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'contacted':
        return 'Contacted';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const newSubmissions = submissions.filter(s => s.status === 'new').length;
  const inProgressSubmissions = submissions.filter(s => s.status === 'in_progress').length;
  const contactedSubmissions = submissions.filter(s => s.status === 'contacted').length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Contact Submissions</h1>
        <p className="text-slate-600">Manage school enquiries from the For Schools page</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-800">{submissions.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{newSubmissions}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressSubmissions}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Contacted</p>
                <p className="text-2xl font-bold text-green-600">{contactedSubmissions}</p>
              </div>
              <Phone className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">School / Subject</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Contact Person</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">City</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Class</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Date</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    No submissions yet
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 text-sm">{submission.schoolName || submission.subject || 'Enquiry'}</div>
                      {submission.subject && submission.schoolName && (
                        <div className="text-xs text-slate-500 mt-0.5">{submission.subject}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-sm whitespace-nowrap">{submission.contactPerson}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{submission.email}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{submission.phone}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{submission.city}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{submission.interestedClass || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusLabel(submission.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(submission.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => handleView(submission)} className="h-7 w-7 p-0">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(submission)} className="h-7 w-7 p-0" style={{ color: '#04d3d3', borderColor: '#04d3d3' }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(submission.id)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:border-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Type / Subject</Label>
                    <p className="font-medium text-blue-600">{selectedSubmission.subject || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">School Name</Label>
                    <p className="font-medium">{selectedSubmission.schoolName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Contact Person</Label>
                    <p className="font-medium">{selectedSubmission.contactPerson}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Interested Class</Label>
                    <p className="font-medium text-emerald-600">{selectedSubmission.interestedClass || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Email</Label>

                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Phone</Label>
                  <p className="font-medium">{selectedSubmission.phone}</p>
                </div>
                <div>
                  <Label className="text-slate-600">City</Label>
                  <p className="font-medium">{selectedSubmission.city}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Status</Label>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {getStatusLabel(selectedSubmission.status)}
                  </Badge>
                </div>
              </div>
              
              {selectedSubmission.message && (
                <div>
                  <Label className="text-slate-600">Message</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded text-sm">
                    {selectedSubmission.message}
                  </p>
                </div>
              )}

              {selectedSubmission.notes && (
                <div>
                  <Label className="text-slate-600">Admin Notes</Label>
                  <p className="mt-1 p-3 bg-blue-50 rounded text-sm">
                    {selectedSubmission.notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500">
                <p>Created: {formatDate(selectedSubmission.createdAt)}</p>
                <p>Updated: {formatDate(selectedSubmission.updatedAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this submission..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              style={{ backgroundColor: '#04d3d3', color: 'white' }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
