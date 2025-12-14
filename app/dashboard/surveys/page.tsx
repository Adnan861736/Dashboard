'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { LoadingPage } from '@/components/atoms/LoadingSpinner';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { surveysAPI, articlesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, BarChart } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  article: {
    id: string;
    title: string;
  };
  questions: Array<{
    id: string;
    questionText: string;
    options: Array<{
      id: string;
      optionText: string;
      isCorrect: boolean;
    }>;
  }>;
  createdAt: string;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    articleId: '',
    title: '',
    questions: [
      {
        questionText: '',
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
      },
    ],
  });

  useEffect(() => {
    fetchSurveys();
    fetchArticles();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      // Since there's no "get all surveys" endpoint, we'll fetch from articles
      const articlesRes = await articlesAPI.getAll();
      const articlesData = articlesRes.data.articles || [];

      const surveysData = await Promise.all(
        articlesData.map(async (article: any) => {
          try {
            const surveyRes = await surveysAPI.getByArticleId(article.id);
            return surveyRes.data.survey;
          } catch (error) {
            return null;
          }
        })
      );

      setSurveys(surveysData.filter((s) => s !== null));
    } catch (error: any) {
      toast.error('فشل في تحميل الاستبيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await articlesAPI.getAll();
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Transform the data to match API expectations
      const apiData = {
        title: formData.title,
        articleId: formData.articleId,
        questions: formData.questions.map(q => ({
          questionText: q.questionText,
          options: q.options.map(opt => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect
          }))
        }))
      };

      await surveysAPI.create(apiData);
      toast.success('تم إنشاء الاستبيان بنجاح');
      setShowModal(false);
      resetForm();
      fetchSurveys();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const resetForm = () => {
    setFormData({
      articleId: '',
      title: '',
      questions: [
        {
          questionText: '',
          options: [
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false },
          ],
        },
      ],
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          options: [
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false },
          ],
        },
      ],
    });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push({ optionText: '', isCorrect: false });
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateQuestion = (questionIndex: number, questionText: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].questionText = questionText;
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    optionText: string
  ) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex].optionText = optionText;
    setFormData({ ...formData, questions: newQuestions });
  };

  const toggleCorrect = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex].isCorrect =
      !newQuestions[questionIndex].options[optionIndex].isCorrect;
    setFormData({ ...formData, questions: newQuestions });
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">الاستبيانات</h1>
          <p className="text-muted-foreground mt-1">إدارة الاستبيانات التفاعلية</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إنشاء استبيان جديد
        </Button>
      </div>

      {/* Surveys List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted-foreground">
            لا توجد استبيانات
          </div>
        ) : (
          surveys.map((survey) => (
            <Card key={survey.id} hover>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{survey.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{survey.article.title}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {survey.questions.length} أسئلة
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <BarChart className="h-4 w-4 ml-2" />
                      النتائج
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>إنشاء استبيان جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="عنوان الاستبيان"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    المقال المرتبط
                  </label>
                  <select
                    value={formData.articleId}
                    onChange={(e) =>
                      setFormData({ ...formData, articleId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">اختر مقال</option>
                    {articles.map((article) => (
                      <option key={article.id} value={article.id}>
                        {article.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">الأسئلة</h3>
                    <Button type="button" variant="ghost" size="sm" onClick={addQuestion}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة سؤال
                    </Button>
                  </div>

                  {formData.questions.map((question, qIndex) => (
                    <Card key={qIndex}>
                      <CardContent className="p-4 space-y-3">
                        <Input
                          label={`سؤال ${qIndex + 1}`}
                          value={question.questionText}
                          onChange={(e) => updateQuestion(qIndex, e.target.value)}
                          required
                        />

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">
                            الخيارات
                          </label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={() => toggleCorrect(qIndex, oIndex)}
                                className="h-4 w-4"
                              />
                              <Input
                                placeholder={`خيار ${oIndex + 1}`}
                                value={option.optionText}
                                onChange={(e) =>
                                  updateOption(qIndex, oIndex, e.target.value)
                                }
                                required
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addOption(qIndex)}
                          >
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة خيار
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2 justify-end">
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
                  <Button type="submit">حفظ</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
