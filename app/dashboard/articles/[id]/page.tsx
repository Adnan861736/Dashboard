'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { articlesAPI, surveysAPI } from '@/lib/api';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { ArrowRight, Calendar, User, Tag, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Article {
  id: string;
  title: string;
  content: string;
  author?: string | {
    id?: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

interface SurveyOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface SurveyQuestion {
  id: string;
  text: string;
  options: SurveyOption[];
}

interface Survey {
  id: string;
  title: string;
  questions: SurveyQuestion[];
}

interface UserAnswers {
  [questionId: string]: string; // questionId -> selectedOptionId
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchArticle();
    fetchSurvey();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await articlesAPI.getById(articleId);
      console.log('Article detail response:', response.data);

      const articleData = response.data.article || response.data.data || response.data;
      setArticle(articleData);
    } catch (error: any) {
      console.error('Error fetching article:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'فشل في تحميل المقالة';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurvey = async () => {
    try {
      setSurveyLoading(true);
      const response = await surveysAPI.getByArticleId(articleId);
      console.log('Survey response:', response.data);

      const surveyData = response.data.survey || response.data.data || response.data;

      // Convert backend format to frontend format
      if (surveyData && surveyData.questions) {
        const formattedSurvey = {
          ...surveyData,
          questions: surveyData.questions.map((q: any) => {
            console.log('Question:', q);
            return {
              id: q.id,
              text: q.questionText || q.text,
              options: q.options.map((opt: any) => {
                console.log('Option:', opt, 'isCorrect:', opt.isCorrect);
                // Try different possible field names for isCorrect
                const isCorrect = opt.isCorrect ?? opt.is_correct ?? opt.correct ?? false;
                return {
                  id: opt.id,
                  text: opt.optionText || opt.text,
                  isCorrect: isCorrect
                };
              })
            };
          })
        };
        console.log('Formatted survey:', formattedSurvey);
        setSurvey(formattedSurvey);
      } else {
        setSurvey(surveyData);
      }
    } catch (error: any) {
      console.error('Error fetching survey:', error);
      // Don't show error toast if survey doesn't exist
      if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'فشل في تحميل الاستبيان';
        toast.error(errorMessage);
      }
    } finally {
      setSurveyLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionId,
    });
  };

  const handleSubmitSurvey = async () => {
    if (!survey) return;

    // Check if all questions are answered
    const allAnswered = survey.questions.every((q) => userAnswers[q.id]);
    if (!allAnswered) {
      toast.error('يرجى الإجابة على جميع الأسئلة');
      return;
    }

    // Calculate score
    let correctCount = 0;
    survey.questions.forEach((question) => {
      const selectedOptionId = userAnswers[question.id];
      const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
      if (selectedOption?.isCorrect) {
        correctCount++;
      }
    });

    // Save answers to backend
    try {
      const answersPayload = survey.questions.map((question) => ({
        questionId: question.id,
        optionId: userAnswers[question.id],
      }));

      console.log('Submitting survey answers:', answersPayload);
      await surveysAPI.submit(survey.id, answersPayload);
      console.log('Survey answers saved successfully');
    } catch (error: any) {
      console.error('Error saving survey answers:', error);
      // Don't block showing results if save fails
      toast.error('تم حساب النتيجة لكن حدث خطأ في حفظ الإجابات');
    }

    setScore(correctCount);
    setShowResults(true);

    const percentage = (correctCount / survey.questions.length) * 100;
    if (percentage >= 70) {
      toast.success(`أحسنت! لقد حصلت على ${correctCount} من ${survey.questions.length}`);
    } else {
      toast(`لقد حصلت على ${correctCount} من ${survey.questions.length}`, {
        icon: 'ℹ️',
      });
    }
  };

  const handleRetakeSurvey = () => {
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
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

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground mb-4">المقالة غير موجودة</p>
            <Button onClick={() => router.push('/dashboard/articles')}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى المقالات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-4 md:p-8 max-w-5xl" dir="rtl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/articles')}
          className="mb-6 hover:bg-primary/10 transition-all"
        >
          <ArrowRight className="ml-2 h-5 w-5" />
          العودة إلى المقالات
        </Button>

        {/* Article Content */}
        <Card className="mb-8 overflow-hidden border-2 border-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-8">
            <div className="space-y-6">
              <CardTitle className="text-xl md:text-2xl font-black leading-tight bg-gradient-to-l from-primary to-foreground bg-clip-text text-transparent">
                {article.title}
              </CardTitle>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{typeof article.author === 'string' ? article.author : article.author?.name || 'غير معروف'}</span>
                </div>

                <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <Tag className="h-4 w-4" />
                  <span className="font-bold text-primary">
                    {article.category.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{article.source}</span>
                </div>

                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{new Date(article.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
          </CardHeader>

        <CardContent className="pt-8">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {article.content}
            </p>
          </div>
        </CardContent>
        </Card>

      {/* Survey Section - Display Mode for Admin */}
      {surveyLoading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل الاستبيان...</p>
          </CardContent>
        </Card>
      ) : survey ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span>📝</span>
              {survey.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              الإجابات الصحيحة مُعلّمة باللون الأخضر
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {survey.questions.map((question, qIndex) => {
              return (
                <div key={question.id} className="space-y-3 p-6 bg-muted/30 rounded-lg border-2 border-border">
                  <h3 className="font-bold text-lg text-foreground">
                    السؤال {qIndex + 1}: {question.text}
                  </h3>

                  <div className="space-y-2 mt-4">
                    {question.options.map((option, optIndex) => {
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                            option.isCorrect
                              ? 'bg-green-500/10 border-green-500 shadow-sm'
                              : 'bg-background border-border'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            option.isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <span className={`flex-1 ${option.isCorrect ? 'font-semibold text-green-700 dark:text-green-400' : ''}`}>
                            {option.text}
                          </span>
                          {option.isCorrect && (
                            <span className="text-green-600 dark:text-green-400 text-xl font-bold">✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">لا يوجد استبيان لهذه المقالة</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
