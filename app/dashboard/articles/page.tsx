'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { LoadingPage } from '@/components/atoms/LoadingSpinner';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { articlesAPI, categoriesAPI, surveysAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, X, FolderPlus } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Article {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    name: string;
  };
  author: string | {
    name: string;
  };
  source?: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  interface SurveyOption {
    id: string;
    text: string;
    isCorrect: boolean;
  }

  interface SurveyQuestion {
    id: string;
    question: string;
    options: SurveyOption[];
  }

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    author: '',
    source: '',
  });

  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [currentSurveyId, setCurrentSurveyId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((article) =>
        article.category.id === selectedCategory
      );
    }

    setFilteredArticles(filtered);
  }, [searchTerm, selectedCategory, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getAll();
      console.log('Articles response:', response.data);

      // Try different possible response structures
      const articlesData = response.data.articles || response.data.data || response.data || [];
      console.log('Articles data:', articlesData);

      setArticles(articlesData);
      setFilteredArticles(articlesData);
    } catch (error: any) {
      console.error('Failed to fetch articles:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'فشل في تحميل المقالات';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      console.log('Categories response:', response.data);
      // Try different possible response structures
      const categoriesData = response.data.categories || response.data.data || response.data || [];
      console.log('Categories data:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('فشل في تحميل الفئات');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = {
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        author: formData.author,
        source: formData.source,
      };

      let articleId: string;

      if (editingArticle) {
        await articlesAPI.update(editingArticle.id, dataToSend);
        articleId = editingArticle.id;
        toast.success('تم التحديث بنجاح');
      } else {
        const response = await articlesAPI.create(dataToSend);
        console.log('Article creation response:', response.data);
        // Get the created article ID from response
        articleId = response.data.article?.id || response.data.data?.id || response.data.id;
        console.log('Extracted article ID:', articleId);

        if (!articleId) {
          console.error('Could not extract article ID from response:', response.data);
          toast.error('تم إنشاء المقال لكن لم يتم الحصول على معرف المقال');
        } else {
          toast.success('تم الإنشاء بنجاح');
        }
      }

      // Save or update survey if there are questions
      if (surveyQuestions.length > 0 && articleId) {
        try {
          console.log('Article ID:', articleId);
          console.log('Survey Questions:', surveyQuestions);

          // Filter out empty questions and validate
          const validQuestions = surveyQuestions.filter(q => {
            const hasQuestion = q.question && q.question.trim() !== '';
            const hasValidOptions = q.options && q.options.length >= 2;
            const hasAtLeastOneCorrect = q.options.some(opt => opt.isCorrect);
            return hasQuestion && hasValidOptions && hasAtLeastOneCorrect;
          });

          if (validQuestions.length === 0) {
            console.warn('No valid questions found');
            toast.success('تم حفظ المقال لكن لا توجد أسئلة صالحة في الاستبيان');
            setShowModal(false);
            setEditingArticle(null);
            setFormData({ title: '', content: '', categoryId: '', author: '', source: '' });
            setSurveyQuestions([]);
            setCurrentSurveyId(null);
            fetchArticles();
            return;
          }

          const surveyData = {
            title: `استبيان: ${formData.title}`,
            articleId: articleId,
            questions: validQuestions.map(q => ({
              questionText: q.question.trim(),
              options: q.options.filter(opt => opt.text.trim() !== '').map(opt => ({
                optionText: opt.text.trim(),
                isCorrect: opt.isCorrect
              }))
            }))
          };

          console.log('Survey Data to send:', JSON.stringify(surveyData, null, 2));

          if (currentSurveyId) {
            // Update existing survey
            try {
              const surveyResponse = await surveysAPI.update(currentSurveyId, surveyData);
              console.log('Survey updated successfully:', surveyResponse.data);
              toast.success('تم حفظ المقال والاستبيان بنجاح');
            } catch (updateError: any) {
              console.error('Error updating survey:', updateError);
              throw updateError;
            }
          } else {
            // Create new survey
            try {
              const surveyResponse = await surveysAPI.create(surveyData);
              console.log('Survey created successfully:', surveyResponse.data);
              toast.success('تم حفظ المقال والاستبيان بنجاح');
            } catch (createError: any) {
              console.error('Error creating survey:', createError);
              throw createError;
            }
          }
        } catch (surveyError: any) {
          console.error('Error saving survey:', surveyError);
          console.error('Error response:', surveyError.response?.data);
          const errorMsg = surveyError.response?.data?.message || surveyError.response?.data?.error || 'خطأ غير معروف';
          toast.error(`تم حفظ المقال لكن حدث خطأ في حفظ الاستبيان: ${errorMsg}`);
        }
      } else if (currentSurveyId && surveyQuestions.length === 0) {
        // If survey exists but all questions were removed, delete it
        try {
          await surveysAPI.delete(currentSurveyId);
          console.log('Survey deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting survey:', deleteError);
        }
      }

      setShowModal(false);
      setEditingArticle(null);
      setFormData({ title: '', content: '', categoryId: '', author: '', source: '' });
      setSurveyQuestions([]);
      setCurrentSurveyId(null);
      fetchArticles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleEdit = async (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      categoryId: article.category.id,
      author: typeof article.author === 'string' ? article.author : article.author?.name || '',
      source: article.source || '',
    });

    // Load associated survey if exists
    try {
      const surveyResponse = await surveysAPI.getByArticleId(article.id);
      const surveyData = surveyResponse.data.survey || surveyResponse.data.data || surveyResponse.data;

      if (surveyData && surveyData.questions) {
        // Save the survey ID for updating
        setCurrentSurveyId(surveyData.id);

        // Convert backend survey format to form format
        const formattedQuestions = surveyData.questions.map((q: any) => ({
          id: q.id || Date.now().toString(),
          question: q.questionText || q.text || q.question || '',
          options: q.options.map((opt: any) => ({
            id: opt.id || Date.now().toString(),
            text: opt.optionText || opt.text || '',
            // Try different field names for isCorrect, default to false if not found
            isCorrect: opt.isCorrect ?? opt.is_correct ?? opt.correct ?? false
          }))
        }));
        console.log('Loaded survey questions for editing:', formattedQuestions);
        setSurveyQuestions(formattedQuestions);
      } else {
        setSurveyQuestions([]);
        setCurrentSurveyId(null);
      }
    } catch (error) {
      console.log('No survey found for this article or error loading survey');
      setSurveyQuestions([]);
      setCurrentSurveyId(null);
    }

    setShowModal(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.name.trim()) {
      toast.error('الرجاء إدخال اسم الفئة');
      return;
    }

    try {
      await categoriesAPI.create({ name: newCategory.name });
      toast.success('تمت إضافة الفئة بنجاح');
      setShowCategoryModal(false);
      setNewCategory({ name: '' });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleDeleteClick = (id: string) => {
    setArticleToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      setDeleting(true);
      await articlesAPI.delete(articleToDelete);
      toast.success('تم حذف المقال بنجاح');
      fetchArticles();
      setShowDeleteDialog(false);
      setArticleToDelete(null);
    } catch (error: any) {
      console.error('Error deleting article:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'حدث خطأ أثناء الحذف';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Survey functions
  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: Date.now().toString(),
      question: '',
      options: [
        { id: Date.now().toString() + '-1', text: '', isCorrect: false },
        { id: Date.now().toString() + '-2', text: '', isCorrect: false },
        { id: Date.now().toString() + '-3', text: '', isCorrect: false },
        { id: Date.now().toString() + '-4', text: '', isCorrect: false },
      ],
    };
    setSurveyQuestions([...surveyQuestions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setSurveyQuestions(surveyQuestions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, newQuestion: string) => {
    setSurveyQuestions(surveyQuestions.map(q =>
      q.id === questionId ? { ...q, question: newQuestion } : q
    ));
  };

  const updateOption = (questionId: string, optionId: string, newText: string) => {
    setSurveyQuestions(surveyQuestions.map(q =>
      q.id === questionId
        ? {
            ...q,
            options: q.options.map(o =>
              o.id === optionId ? { ...o, text: newText } : o
            ),
          }
        : q
    ));
  };

  const setCorrectAnswer = (questionId: string, optionId: string) => {
    console.log('Setting correct answer:', { questionId, optionId });
    const updatedQuestions = surveyQuestions.map(q =>
      q.id === questionId
        ? {
            ...q,
            options: q.options.map(o =>
              ({ ...o, isCorrect: o.id === optionId })
            ),
          }
        : q
    );
    console.log('Updated questions:', updatedQuestions);
    setSurveyQuestions(updatedQuestions);
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            المقالات
          </h1>
          <p className="text-muted-foreground text-lg">إدارة المقالات والمحتوى</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCategoryModal(true)} variant="outline">
            <FolderPlus className="h-4 w-4 ml-2" />
            إضافة فئة
          </Button>
          <Button onClick={() => {
            setEditingArticle(null);
            setCurrentSurveyId(null);
            setShowModal(true);
          }}>
            <Plus className="h-4 w-4 ml-2" />
            إنشاء مقال
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 group flex-1 w-full">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <Input
                placeholder="بحث عن مقال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-transparent focus-visible:border-primary"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
              >
                <option value="">جميع الفئات</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted-foreground">
            <p className="text-lg font-semibold mb-2">لا توجد مقالات</p>
            <p className="text-sm">جرّب إضافة مقال جديد أو تعديل الفلترة</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Card
              key={article.id}
              hover
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => router.push(`/dashboard/articles/${article.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2 flex-1">{article.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {article.category.name}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {article.content}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    بواسطة: {typeof article.author === 'string' ? article.author : article.author?.name || 'غير معروف'}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(article)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(article.id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <CardHeader>
              <CardTitle>
                {editingArticle ? 'تعديل المقال' : 'إنشاء مقال'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="عنوان المقال"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الفئة
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                    required
                  >
                    <option value="">اختر فئة</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      يرجى إضافة فئة أولاً
                    </p>
                  )}
                </div>

                <Input
                  label="اسم الكاتب"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                  required
                />

                <Input
                  label="المصدر"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="مثال: موقع الأخبار"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    المحتوى
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                {/* Survey Section */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">الاستبيان</h3>
                    <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة سؤال
                    </Button>
                  </div>

                  {surveyQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      لم تتم إضافة أسئلة بعد
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {surveyQuestions.map((question, qIndex) => (
                        <div key={question.id} className="border border-border rounded-lg p-4 space-y-3">
                          {/* Question Header */}
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-foreground mb-2">
                                سؤال {qIndex + 1}
                              </label>
                              <Input
                                value={question.question}
                                onChange={(e) => updateQuestion(question.id, e.target.value)}
                                placeholder="اكتب السؤال هنا..."
                                required={surveyQuestions.length > 0}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                              className="text-destructive hover:bg-destructive/10 mt-7"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Options */}
                          <div className="space-y-3 pr-4">
                            <label className="block text-sm font-medium text-foreground">
                              الخيارات (اختر الإجابة الصحيحة)
                            </label>
                            {question.options.map((option, oIndex) => (
                              <div key={option.id} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={option.isCorrect}
                                  onChange={() => setCorrectAnswer(question.id, option.id)}
                                  className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                                />
                                <span className="text-sm text-muted-foreground min-w-[20px]">
                                  {oIndex + 1}.
                                </span>
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                                  placeholder={`الخيار ${oIndex + 1}`}
                                  required={surveyQuestions.length > 0}
                                  className={option.isCorrect ? 'border-primary bg-primary/5' : ''}
                                />
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground mt-2">
                              اضغط على الدائرة بجانب الإجابة الصحيحة
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      setEditingArticle(null);
                      setFormData({ title: '', content: '', categoryId: '', author: '', source: '' });
                      setSurveyQuestions([]);
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">حفظ</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" />
                إضافة فئة جديدة
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                أضف فئة جديدة لتنظيم المقالات
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <Input
                  label="اسم الفئة"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  placeholder="مثال: البيئة، الصحة، التعليم..."
                  required
                />

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setNewCategory({ name: '' });
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة
                  </Button>
                </div>
              </form>

              {/* عرض التصنيفات الحالية */}
              {categories.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">الفئات الحالية</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="p-3 bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
                      >
                        <p className="font-medium text-foreground">{category.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف المقال"
        description="هل أنت متأكد من حذف هذا المقال؟ سيتم حذف الاستبيان المرتبط به أيضاً. لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف المقال"
        cancelText="إلغاء"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
