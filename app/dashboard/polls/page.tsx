'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { pollsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, BarChart3, X, Vote, Eye, Clock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface PollOption {
  id: string;
  text: string;
  order: number;
  votesCount: number;
  percentage: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  pointsReward: number;
  startDate?: string;
  expiryDate?: string;
  admin: {
    id: string;
    name: string;
  };
  options: PollOption[];
  totalVotes: number;
  userVoted?: boolean;
  createdAt: string;
}

export default function PollsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create poll form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointsReward, setPointsReward] = useState(5);
  const [expiryDate, setExpiryDate] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      console.log('Fetching polls...');
      const response = await pollsAPI.getAll();
      console.log('Polls response:', response.data);

      // Backend returns: { success: true, count: number, data: [...] }
      const pollsData = response.data.data || [];
      setPolls(pollsData);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'فشل في تحميل الاستطلاعات';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('الرجاء إدخال عنوان الاستطلاع');
      return;
    }

    // Filter out empty options
    const validOptions = options.filter(opt => opt.trim() !== '');

    if (validOptions.length < 2) {
      toast.error('الرجاء إضافة خيارين على الأقل');
      return;
    }

    try {
      const pollData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        pointsReward: pointsReward,
        startDate: new Date().toISOString(), // Always set to current time
        options: validOptions
      };

      // Add expiry date if provided
      if (expiryDate) {
        pollData.expiryDate = new Date(expiryDate).toISOString();
      }

      await pollsAPI.create(pollData);

      toast.success('تم إنشاء الاستطلاع بنجاح');
      setShowModal(false);
      setTitle('');
      setDescription('');
      setPointsReward(5);
      setExpiryDate('');
      setOptions(['', '']);
      fetchPolls();
    } catch (error: any) {
      console.error('Error creating poll:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء إنشاء الاستطلاع';
      toast.error(errorMessage);
    }
  };

  const handleVote = async () => {
    if (!selectedPoll || !selectedOptionId) {
      toast.error('الرجاء اختيار خيار');
      return;
    }

    try {
      await pollsAPI.vote(selectedPoll.id, selectedOptionId);
      toast.success('تم التصويت بنجاح');
      setShowVoteModal(false);
      setSelectedPoll(null);
      setSelectedOptionId('');
      fetchPolls();
    } catch (error: any) {
      console.error('Error voting:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء التصويت';
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPollToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!pollToDelete) return;

    try {
      setDeleting(true);
      await pollsAPI.delete(pollToDelete);
      toast.success('تم حذف الاستطلاع بنجاح');
      fetchPolls();
      setShowDeleteDialog(false);
      setPollToDelete(null);
    } catch (error: any) {
      console.error('Error deleting poll:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء الحذف';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const addOptionField = () => {
    setOptions([...options, '']);
  };

  const removeOptionField = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const openVoteModal = (poll: Poll) => {
    setSelectedPoll(poll);
    setSelectedOptionId('');
    setShowVoteModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            استطلاعات الرأي
          </h1>
          <p className="text-muted-foreground text-lg mt-2">إدارة الاستطلاعات والتصويت</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="lg">
          <Plus className="ml-2 h-5 w-5" />
          إضافة استطلاع جديد
        </Button>
      </div>

      {/* Polls Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.length === 0 ? (
          <div className="col-span-full text-center p-12 border-2 border-dashed border-border rounded-lg">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">لا توجد استطلاعات</p>
            <Button onClick={() => setShowModal(true)} variant="outline" className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              إضافة استطلاع
            </Button>
          </div>
        ) : (
          polls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{poll.title}</CardTitle>
                {poll.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {poll.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>{poll.totalVotes} صوت</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-medium">
                      <span>{poll.pointsReward}</span>
                      <span className="text-xs">نقطة</span>
                    </div>
                  </div>

                  {poll.userVoted && (
                    <div className="text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-md inline-block">
                      ✓ تم التصويت
                    </div>
                  )}

                  {/* Date Information */}
                  {(poll.startDate || poll.expiryDate) && (
                    <div className="space-y-1 text-xs text-muted-foreground border-t pt-3">
                      {poll.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>البداية: {new Date(poll.startDate).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                      {poll.expiryDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>الانتهاء: {new Date(poll.expiryDate).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                      {poll.expiryDate && new Date(poll.expiryDate) < new Date() && (
                        <div className="text-xs bg-red-500/10 text-red-600 px-2 py-1 rounded-md inline-block mt-1">
                          منتهي
                        </div>
                      )}
                      {poll.startDate && new Date(poll.startDate) > new Date() && (
                        <div className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md inline-block mt-1">
                          قادم
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    بواسطة: {poll.admin.name}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {!poll.userVoted && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openVoteModal(poll)}
                        className="flex-1"
                      >
                        <Vote className="ml-2 h-4 w-4" />
                        تصويت
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/polls/${poll.id}`)}
                      className={poll.userVoted ? 'flex-1' : ''}
                    >
                      <Eye className="ml-2 h-4 w-4" />
                      {poll.userVoted ? 'عرض النتائج' : 'النتائج'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(poll.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Poll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>إضافة استطلاع رأي جديد</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowModal(false);
                    setTitle('');
                    setDescription('');
                    setPointsReward(5);
                    setExpiryDate('');
                    setOptions(['', '']);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">عنوان الاستطلاع</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: ما هو رأيك في...؟"
                    required
                    className="text-lg"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الوصف (اختياري)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف مختصر عن الاستطلاع"
                    rows={3}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Points Reward */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">نقاط المشاركة</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(parseInt(e.target.value) || 5)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    عدد النقاط التي سيحصل عليها المستخدم عند المشاركة
                  </p>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ الانتهاء (اختياري)</label>
                  <Input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    إذا لم يتم التحديد، لن ينتهي الاستطلاع. سيبدأ الاستطلاع فوراً عند الإنشاء.
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">الخيارات</label>
                    <Button
                      type="button"
                      onClick={addOptionField}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة خيار
                    </Button>
                  </div>

                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`الخيار ${index + 1}`}
                          required
                        />
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOptionField(index)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      setTitle('');
                      setDescription('');
                      setPointsReward(5);
                      setExpiryDate('');
                      setOptions(['', '']);
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    حفظ الاستطلاع
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vote Modal */}
      {showVoteModal && selectedPoll && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedPoll.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowVoteModal(false);
                    setSelectedPoll(null);
                    setSelectedOptionId('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {selectedPoll.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedPoll.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 text-sm">
                <span className="text-muted-foreground">المكافأة:</span>
                <span className="text-primary font-semibold">{selectedPoll.pointsReward} نقطة</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={selectedOptionId}
                onValueChange={setSelectedOptionId}
                className="space-y-3"
              >
                {selectedPoll.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 space-x-reverse p-4 rounded-lg border-2 border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowVoteModal(false);
                    setSelectedPoll(null);
                    setSelectedOptionId('');
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleVote}
                  className="flex-1"
                  disabled={!selectedOptionId}
                >
                  <Vote className="ml-2 h-4 w-4" />
                  تصويت الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الاستطلاع"
        description="هل أنت متأكد من حذف هذا الاستطلاع؟ سيتم حذف جميع الأصوات المرتبطة به. لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف الاستطلاع"
        cancelText="إلغاء"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
