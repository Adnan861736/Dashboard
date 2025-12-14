'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/ui/textarea';
import { gamesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, X, Gamepad2, Trophy } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface GameWord {
  number: number;
  direction: 'across' | 'down';
  question: string;
  answer: string;
  position: { row: number; col: number };
}

interface CrosswordContent {
  words: GameWord[];
}

interface PuzzleContent {
  pieces: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

interface Game {
  id: string;
  type: 'crossword' | 'puzzle';
  title: string;
  content: CrosswordContent | PuzzleContent;
  educationalMessage?: string;
  pointsReward: number;
  admin: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'crossword' | 'puzzle'>('all');

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [gameType, setGameType] = useState<'crossword' | 'puzzle'>('crossword');
  const [educationalMessage, setEducationalMessage] = useState('');
  const [pointsReward, setPointsReward] = useState(10);

  // Crossword specific
  const [words, setWords] = useState<GameWord[]>([
    { number: 1, direction: 'across', question: '', answer: '', position: { row: 0, col: 0 } },
  ]);

  // Puzzle specific
  const [pieces, setPieces] = useState(100);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getAll();
      const gamesData = response.data.data || [];
      setGames(gamesData);
    } catch (error: any) {
      console.error('Error fetching games:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'فشل في تحميل الألعاب';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('الرجاء إدخال عنوان اللعبة');
      return;
    }

    try {
      if (gameType === 'crossword') {
        const validWords = words.filter((w) => w.answer.trim() !== '' && w.question.trim() !== '');
        if (validWords.length === 0) {
          toast.error('الرجاء إضافة كلمات واحدة على الأقل');
          return;
        }

        const content = {
          words: validWords,
        };

        const gameData = {
          type: gameType,
          title: title.trim(),
          content,
          educationalMessage: educationalMessage.trim() || undefined,
          pointsReward,
        };

        if (editingGame) {
          await gamesAPI.update(editingGame.id, gameData);
          toast.success('تم تحديث اللعبة بنجاح');
        } else {
          await gamesAPI.create(gameData);
          toast.success('تم إنشاء اللعبة بنجاح');
        }
      } else {
        // Puzzle game - use FormData for image upload
        if (!editingGame && !imageFile) {
          toast.error('الرجاء اختيار صورة للبازل');
          return;
        }

        const formData = new FormData();
        formData.append('type', 'puzzle');
        formData.append('title', title.trim());
        formData.append('pointsReward', pointsReward.toString());

        if (educationalMessage.trim()) {
          formData.append('educationalMessage', educationalMessage.trim());
        }

        const content = {
          pieces,
          difficulty,
        };
        formData.append('content', JSON.stringify(content));

        // Add image file if selected
        if (imageFile) {
          formData.append('image', imageFile);
        }

        if (editingGame) {
          await gamesAPI.update(editingGame.id, formData);
          toast.success('تم تحديث اللعبة بنجاح');
        } else {
          await gamesAPI.create(formData);
          toast.success('تم إنشاء اللعبة بنجاح');
        }
      }

      resetForm();
      setShowModal(false);
      fetchGames();
    } catch (error: any) {
      console.error('Error saving game:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'حدث خطأ أثناء حفظ اللعبة';
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setGameToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!gameToDelete) return;

    try {
      setDeleting(true);
      await gamesAPI.delete(gameToDelete);
      toast.success('تم حذف اللعبة بنجاح');
      fetchGames();
      setShowDeleteDialog(false);
      setGameToDelete(null);
    } catch (error: any) {
      console.error('Error deleting game:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'حدث خطأ أثناء الحذف';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setTitle(game.title);
    setGameType(game.type);
    setEducationalMessage(game.educationalMessage || '');
    setPointsReward(game.pointsReward);

    if (game.type === 'crossword') {
      const content = game.content as CrosswordContent;
      setWords(content.words && content.words.length > 0 ? content.words : [
        { number: 1, direction: 'across', question: '', answer: '', position: { row: 0, col: 0 } },
      ]);
    } else {
      const content = game.content as PuzzleContent;
      setPieces(content.pieces || 100);
      setDifficulty(content.difficulty || 'medium');
      setImageUrl(content.imageUrl || '');
      setImageFile(null);
      setImagePreview(null);
    }

    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('يرجى اختيار صورة بصيغة JPG, PNG أو GIF');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setEditingGame(null);
    setTitle('');
    setGameType('crossword');
    setEducationalMessage('');
    setPointsReward(10);
    setWords([{ number: 1, direction: 'across', question: '', answer: '', position: { row: 0, col: 0 } }]);
    setPieces(100);
    setDifficulty('medium');
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
  };

  const addWord = () => {
    const nextNumber = words.length + 1;
    setWords([
      ...words,
      { number: nextNumber, direction: 'across', question: '', answer: '', position: { row: 0, col: 0 } },
    ]);
  };

  const removeWord = (index: number) => {
    if (words.length > 1) {
      const updatedWords = words.filter((_, i) => i !== index);
      // Re-number the words
      const renumberedWords = updatedWords.map((word, idx) => ({
        ...word,
        number: idx + 1,
      }));
      setWords(renumberedWords);
    }
  };

  const updateWord = (index: number, field: keyof GameWord, value: any) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    setWords(newWords);
  };

  const filteredGames = games.filter((game) => {
    if (filterType === 'all') return true;
    return game.type === filterType;
  });

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
          <h1 className="text-4xl font-bold text-foreground">إدارة الألعاب</h1>
          <p className="text-muted-foreground text-lg mt-2">
            إنشاء وتحرير وحذف الألعاب التعليمية
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} size="lg">
          <Plus className="ml-2 h-5 w-5" />
          إضافة لعبة جديدة
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex gap-4">
        <Select
          value={filterType}
          onValueChange={(value: any) =>
            setFilterType(value as 'all' | 'crossword' | 'puzzle')
          }
          placeholder="اختر نوع اللعبة"
          className="w-48"
        >
          <option value="all">جميع الألعاب</option>
          <option value="crossword">ألعاب كلمات متقاطعة</option>
          <option value="puzzle">ألعاب الأحجية</option>
        </Select>
      </div>

      {/* Games Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGames.length === 0 ? (
          <div className="col-span-full text-center p-12 border-2 border-dashed border-border rounded-lg">
            <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">لا توجد ألعاب</p>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              variant="outline"
              className="mt-4"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة لعبة
            </Button>
          </div>
        ) : (
          filteredGames.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {game.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        <Gamepad2 className="h-3 w-3" />
                        {game.type === 'crossword'
                          ? 'كلمات متقاطعة'
                          : 'أحجية'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {game.type === 'crossword' && (
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        عدد الكلمات:{' '}
                        <span className="font-medium text-foreground">
                          {(game.content as CrosswordContent).words?.length || 0}
                        </span>
                      </p>
                    </div>
                  )}

                  {game.type === 'puzzle' && (
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        عدد القطع:{' '}
                        <span className="font-medium text-foreground">
                          {(game.content as PuzzleContent).pieces || 'غير محدد'}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        مستوى الصعوبة:{' '}
                        <span className="font-medium text-foreground">
                          {(game.content as PuzzleContent).difficulty === 'easy'
                            ? 'سهل'
                            : (game.content as PuzzleContent).difficulty === 'medium'
                            ? 'متوسط'
                            : (game.content as PuzzleContent).difficulty === 'hard'
                            ? 'صعب'
                            : 'غير محدد'}
                        </span>
                      </p>
                      {(game.content as PuzzleContent).imageUrl && (() => {
                        const imageUrl = (game.content as PuzzleContent).imageUrl!;
                        return (
                          <div className="mt-2 pt-2 border-t border-border">
                            <img
                              src={imageUrl.startsWith('http')
                                ? imageUrl
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005'}${imageUrl}`}
                              alt={game.title}
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {game.educationalMessage && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border">
                      {game.educationalMessage}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-lg font-bold">
                        <Trophy className="h-4 w-4" />
                        <span>{game.pointsReward}</span>
                      </div>
                    </div>
                    {game.admin && (
                      <div className="text-xs text-muted-foreground">
                        بواسطة: {game.admin.name}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(game)}
                      className="h-9 w-9 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(game.id)}
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Create/Edit Game Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingGame ? 'تحرير اللعبة' : 'إضافة لعبة جديدة'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
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
                  <label className="text-sm font-medium">عنوان اللعبة</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: كلمات متقاطعة عن الحيوانات"
                    required
                  />
                </div>

                {/* Game Type - disabled for editing */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع اللعبة</label>
                  <Select
                    value={gameType}
                    onValueChange={(value: any) => {
                      if (!editingGame) {
                        setGameType(value);
                      }
                    }}
                    placeholder="اختر نوع اللعبة"
                    disabled={!!editingGame}
                  >
                    <option value="crossword">كلمات متقاطعة</option>
                    <option value="puzzle">أحجية</option>
                  </Select>
                </div>

                {/* Educational Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الرسالة التعليمية (اختياري)</label>
                  <Textarea
                    value={educationalMessage}
                    onChange={(e) => setEducationalMessage(e.target.value)}
                    placeholder="أضف رسالة تعليمية تتعلق باللعبة..."
                    rows={3}
                  />
                </div>

                {/* Points Reward */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">نقاط المكافأة</label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(parseInt(e.target.value) || 10)}
                    required
                  />
                </div>

                {/* Crossword Specific Fields */}
                {gameType === 'crossword' && (
                  <>
                    {/* Words */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">الكلمات</label>
                        <Button
                          type="button"
                          onClick={addWord}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="ml-2 h-4 w-4" />
                          إضافة كلمة
                        </Button>
                      </div>

                      {words.map((word, index) => (
                        <div key={index} className="space-y-2 p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              كلمة {index + 1}
                            </span>
                            {words.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWord(index)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Input
                              value={word.answer}
                              onChange={(e) =>
                                updateWord(index, 'answer', e.target.value)
                              }
                              placeholder="الإجابة (الكلمة)"
                              required
                            />
                            <Input
                              value={word.question}
                              onChange={(e) =>
                                updateWord(index, 'question', e.target.value)
                              }
                              placeholder="السؤال (التعريف)"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={word.number}
                              onChange={(e) =>
                                updateWord(index, 'number', parseInt(e.target.value) || 1)
                              }
                              placeholder="رقم"
                              required
                            />
                            <Input
                              type="number"
                              min="0"
                              value={word.position.row}
                              onChange={(e) =>
                                updateWord(
                                  index,
                                  'position',
                                  { ...word.position, row: parseInt(e.target.value) || 0 }
                                )
                              }
                              placeholder="صف"
                              required
                            />
                            <Input
                              type="number"
                              min="0"
                              value={word.position.col}
                              onChange={(e) =>
                                updateWord(
                                  index,
                                  'position',
                                  { ...word.position, col: parseInt(e.target.value) || 0 }
                                )
                              }
                              placeholder="عمود"
                              required
                            />
                            <Select
                              value={word.direction}
                              onValueChange={(value: any) =>
                                updateWord(index, 'direction', value)
                              }
                            >
                              <option value="across">أفقي</option>
                              <option value="down">عمودي</option>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Puzzle Specific Fields */}
                {gameType === 'puzzle' && (
                  <>
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">صورة البازل</label>
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          onChange={handleImageChange}
                          required={!editingGame}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          الصيغ المدعومة: JPG, PNG, GIF (حد أقصى 5 ميجابايت)
                        </p>

                        {/* Image Preview */}
                        {(imagePreview || (editingGame && imageUrl)) && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                            <img
                              src={imagePreview || (imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005'}${imageUrl}`)}
                              alt="معاينة الصورة"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3Eصورة غير متاحة%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            {imagePreview && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview(null);
                                }}
                                className="absolute top-2 right-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pieces */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">عدد القطع</label>
                      <Input
                        type="number"
                        min="4"
                        max="1000"
                        step="4"
                        value={pieces}
                        onChange={(e) => setPieces(parseInt(e.target.value) || 100)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        عدد قطع البازل (يفضل أن يكون رقماً زوجياً)
                      </p>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">مستوى الصعوبة</label>
                      <Select
                        value={difficulty}
                        onValueChange={(value: any) => setDifficulty(value)}
                      >
                        <option value="easy">سهل</option>
                        <option value="medium">متوسط</option>
                        <option value="hard">صعب</option>
                      </Select>
                    </div>
                  </>
                )}

                {/* Form Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingGame ? 'حفظ التعديلات' : 'إنشاء اللعبة'}
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
        title="تأكيد حذف اللعبة"
        description="هل أنت متأكد من حذف هذه اللعبة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف اللعبة"
        cancelText="إلغاء"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
