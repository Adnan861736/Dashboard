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
  const [pieces, setPieces] = useState(9);
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

      // Parse content field from string to object
      const parsedGames = gamesData.map((game: any) => {
        try {
          // Parse content if it's a string
          const content = typeof game.content === 'string'
            ? JSON.parse(game.content)
            : game.content;

          return {
            ...game,
            content
          };
        } catch (parseError) {
          console.error('Error parsing game content:', parseError, game);
          return game;
        }
      });

      setGames(parsedGames);
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
      let content = game.content as any;

      // Handle different content structures
      let words: GameWord[] = [];

      if (content.words && Array.isArray(content.words)) {
        // New structure: {words: [...]}
        words = content.words;
      } else if (content.grid && content.clues) {
        // Old structure: {grid: [...], clues: {...}}
        // Skip old structure games or provide default
        words = [
          { number: 1, direction: 'across', question: '', answer: '', position: { row: 0, col: 0 } },
        ];
        toast.error('هذه اللعبة تستخدم هيكل قديم، يرجى إعادة إنشائها');
      } else {
        // Fallback
        words = [
          { number: 1, direction: 'across', question: '', answer: '', position: { row: 0, col: 0 } },
        ];
      }

      setWords(words.length > 0 ? words : [
        { number: 1, direction: 'across', question: '', answer: '', position: { row: 0, col: 0 } },
      ]);
    } else {
      const content = game.content as PuzzleContent;
      setPieces(content.pieces || 9);
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
    setPieces(9);
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {filteredGames.length === 0 ? (
          <div className="col-span-full text-center p-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
            <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">لا توجد ألعاب</p>
            <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة لعبة تعليمية جديدة</p>
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
            <Card key={game.id} className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors">
                      {game.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        game.type === 'crossword'
                          ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                          : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                      }`}>
                        <Gamepad2 className="h-3 w-3" />
                        {game.type === 'crossword' ? 'كلمات متقاطعة' : 'أحجية'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                        <Trophy className="h-3 w-3" />
                        {game.pointsReward} نقطة
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Game Type Specific Content */}
                  {game.type === 'crossword' && (() => {
                    const content = game.content as any;
                    const wordsCount = content.words?.length || 0;
                    const isOldFormat = content.grid && content.clues;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 bg-muted/50 rounded-lg p-2.5">
                            <p className="text-xs text-muted-foreground mb-0.5">عدد الكلمات</p>
                            <p className="font-bold text-lg text-foreground">{wordsCount}</p>
                          </div>
                        </div>
                        {isOldFormat && (
                          <p className="text-xs text-warning bg-warning/10 px-2 py-1.5 rounded-md flex items-center gap-1">
                            ⚠️ هيكل قديم - يُنصح بإعادة الإنشاء
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {game.type === 'puzzle' && (() => {
                    const content = game.content as PuzzleContent;
                    const imageUrl = content.imageUrl;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 bg-muted/50 rounded-lg p-2.5">
                            <p className="text-xs text-muted-foreground mb-0.5">عدد القطع</p>
                            <p className="font-bold text-lg text-foreground">{content.pieces || 'غير محدد'}</p>
                          </div>
                        </div>
                        {imageUrl && (
                          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted/30 group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                            <img
                              src={imageUrl.startsWith('http')
                                ? imageUrl
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005'}${imageUrl}`}
                              alt={game.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Educational Message */}
                  {game.educationalMessage && (
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        💡 {game.educationalMessage}
                      </p>
                    </div>
                  )}

                  {/* Admin Info */}
                  {game.admin && (
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      👤 بواسطة: <span className="font-medium">{game.admin.name}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(game)}
                      className="flex-1 h-9 group/edit hover:bg-primary/5 hover:border-primary/50"
                    >
                      <Edit className="h-3.5 w-3.5 ml-1.5 group-hover/edit:text-primary" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(game.id)}
                      className="h-9 px-3 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {/* Word Number - Read-only, Auto-generated */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                  رقم الكلمة
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">تلقائي</span>
                                </label>
                                <Input
                                  type="number"
                                  value={word.number}
                                  readOnly
                                  disabled
                                  className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                                  title="يتم تعيين رقم الكلمة تلقائياً بناءً على الترتيب"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                  يتم ترقيم الكلمات تلقائياً
                                </p>
                              </div>

                              {/* Direction */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                  الاتجاه
                                </label>
                                <Select
                                  value={word.direction}
                                  onValueChange={(value: any) =>
                                    updateWord(index, 'direction', value)
                                  }
                                >
                                  <option value="across">أفقي ←</option>
                                  <option value="down">عمودي ↓</option>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">
                                  اتجاه الكلمة في الشبكة
                                </p>
                              </div>
                            </div>

                            {/* Position - Row and Column */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                  موقع الصف
                                  <span className="text-[10px] text-primary">↕</span>
                                </label>
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
                                  placeholder="0"
                                  required
                                  className="text-center font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                  رقم الصف من الأعلى (يبدأ من 0)
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                  موقع العمود
                                  <span className="text-[10px] text-primary">↔</span>
                                </label>
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
                                  placeholder="0"
                                  required
                                  className="text-center font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                  رقم العمود من اليمين (يبدأ من 0)
                                </p>
                              </div>
                            </div>

                            {/* Visual Helper */}
                            <div className="p-3 bg-muted/30 rounded-lg border border-border">
                              <p className="text-xs text-muted-foreground mb-2 font-medium">
                                💡 مساعد بصري:
                              </p>
                              <div className="grid gap-1 w-fit" style={{ gridTemplateColumns: `repeat(${Math.max(word.position.col + 3, 5)}, minmax(0, 1fr))` }}>
                                {[...Array(Math.max(word.position.row + 2, 3))].map((_, rowIdx) => (
                                  <React.Fragment key={rowIdx}>
                                    {[...Array(Math.max(word.position.col + 3, 5))].map((_, colIdx) => {
                                      const isTarget = rowIdx === word.position.row && colIdx === word.position.col;
                                      const isWordPath = word.direction === 'across'
                                        ? (rowIdx === word.position.row && colIdx >= word.position.col && colIdx < word.position.col + word.answer.length)
                                        : (colIdx === word.position.col && rowIdx >= word.position.row && rowIdx < word.position.row + word.answer.length);

                                      return (
                                        <div
                                          key={`${rowIdx}-${colIdx}`}
                                          className={`w-7 h-7 border text-[9px] flex items-center justify-center font-medium ${
                                            isTarget
                                              ? 'bg-primary text-primary-foreground border-primary font-bold ring-2 ring-primary ring-offset-1'
                                              : isWordPath && word.answer.length > 0
                                              ? 'bg-primary/20 border-primary/50 text-primary'
                                              : 'bg-background border-border text-muted-foreground/60'
                                          }`}
                                        >
                                          {isTarget ? '★' : `${rowIdx},${colIdx}`}
                                        </div>
                                      );
                                    })}
                                  </React.Fragment>
                                ))}
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-[10px] text-muted-foreground">
                                  ★ = نقطة بداية الكلمة (صف {word.position.row}، عمود {word.position.col})
                                </p>
                                {word.answer.length > 0 && (
                                  <p className="text-[10px] text-primary/80">
                                    {word.direction === 'across' ? '←' : '↓'} مسار الكلمة "{word.answer}" ({word.answer.length} حرف)
                                  </p>
                                )}
                              </div>
                            </div>
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
                        min="1"
                        max="10000"
                        value={pieces}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= 10000) {
                            setPieces(value);
                          } else if (e.target.value === '') {
                            setPieces(1);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 1) {
                            setPieces(9);
                          }
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        أدخل أي رقم صحيح من 1 إلى 10000 (زوجي أو فردي)
                      </p>
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
