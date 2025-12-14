'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { LoadingPage } from '@/components/atoms/LoadingSpinner';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { discussionsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar, Users, Clock, Video } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface DiscussionSession {
  id: string;
  title: string;
  description?: string;
  meetLink?: string;
  dateTime: string;
  pointsReward: number;
  admin: {
    id: string;
    name: string;
  };
  attendances?: Array<{
    id: string;
    userId: string;
    attended: boolean;
  }>;
  createdAt: string;
}

export default function DiscussionsPage() {
  const [sessions, setSessions] = useState<DiscussionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<DiscussionSession | null>(null);
  const [filterUpcoming, setFilterUpcoming] = useState(false);
  const router = useRouter();

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    meetLink: '',
    pointsReward: 20,
  });

  useEffect(() => {
    fetchSessions();
  }, [filterUpcoming]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await discussionsAPI.getAll(filterUpcoming);
      console.log('Sessions response:', response.data);

      const sessionsData = response.data.data || response.data.sessions || response.data || [];
      setSessions(sessionsData);
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      toast.error('فشل في تحميل الجلسات الحوارية');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description || undefined,
        dateTime: formData.dateTime,
        meetLink: formData.meetLink || undefined,
        pointsReward: formData.pointsReward,
      };

      if (editingSession) {
        await discussionsAPI.update(editingSession.id, dataToSend);
        toast.success('تم تحديث الجلسة بنجاح');
      } else {
        await discussionsAPI.create(dataToSend);
        toast.success('تم إنشاء الجلسة بنجاح');
      }

      setShowModal(false);
      setEditingSession(null);
      setFormData({
        title: '',
        description: '',
        dateTime: '',
        meetLink: '',
        pointsReward: 20,
      });
      fetchSessions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (session: DiscussionSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || '',
      dateTime: session.dateTime.slice(0, 16), // Format for datetime-local input
      meetLink: session.meetLink || '',
      pointsReward: session.pointsReward,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      setDeleting(true);
      await discussionsAPI.delete(sessionToDelete);
      toast.success('تم حذف الجلسة بنجاح');
      fetchSessions();
      setShowDeleteDialog(false);
      setSessionToDelete(null);
    } catch (error: any) {
      console.error('Error deleting session:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'حدث خطأ أثناء الحذف';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">الجلسات الحوارية</h1>
          <p className="text-muted-foreground text-lg">إدارة الجلسات والفعاليات</p>
        </div>
        <Button
          onClick={() => {
            setEditingSession(null);
            setFormData({
              title: '',
              description: '',
              dateTime: '',
              meetLink: '',
              pointsReward: 20,
            });
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4 ml-2" />
          إنشاء جلسة جديدة
        </Button>
      </div>

      {/* Filter */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterUpcoming}
                onChange={(e) => setFilterUpcoming(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 rounded"
              />
              <span className="text-sm font-medium text-foreground">
                عرض الجلسات القادمة فقط
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted-foreground">
            <p className="text-lg font-semibold mb-2">لا توجد جلسات حوارية</p>
            <p className="text-sm">قم بإنشاء جلسة جديدة للبدء</p>
          </div>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              hover
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isUpcoming(session.dateTime) ? 'border-primary/30' : 'border-muted/30'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2 flex-1">{session.title}</CardTitle>
                  {isUpcoming(session.dateTime) && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                      قادمة
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(session.dateTime)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{session.pointsReward} نقطة للحضور</span>
                    </div>

                    {session.meetLink && (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-primary" />
                        <a
                          href={session.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          رابط الاجتماع
                        </a>
                      </div>
                    )}

                    {session.attendances && session.attendances.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendances.length} مشارك</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      بواسطة: {session.admin?.name || 'غير معروف'}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(session)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(session.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <CardHeader>
              <CardTitle>
                {editingSession ? 'تعديل الجلسة' : 'إنشاء جلسة جديدة'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="عنوان الجلسة"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: جلسة حوارية حول البيئة"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="وصف مفصل عن الجلسة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    موعد الجلسة
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <Input
                  label="رابط Google Meet (اختياري)"
                  type="url"
                  value={formData.meetLink}
                  onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                />

                <Input
                  label="النقاط للحضور"
                  type="number"
                  value={formData.pointsReward}
                  onChange={(e) =>
                    setFormData({ ...formData, pointsReward: parseInt(e.target.value) || 20 })
                  }
                  min={1}
                  required
                />

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSession(null);
                      setFormData({
                        title: '',
                        description: '',
                        dateTime: '',
                        meetLink: '',
                        pointsReward: 20,
                      });
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingSession ? 'حفظ التعديلات' : 'إنشاء الجلسة'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الجلسة"
        description="هل أنت متأكد من حذف هذه الجلسة الحوارية؟ سيتم حذف جميع البيانات المرتبطة بها. لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف الجلسة"
        cancelText="إلغاء"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
