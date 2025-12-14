'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pollsAPI } from '@/lib/api';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { ArrowRight, BarChart3, Users, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

interface PollOption {
  id: string;
  text: string;
  order: number;
  votesCount: number;
  percentage: number;
  voters?: Array<{
    userId: string;
    userName: string;
    votedAt: string;
  }>;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  pointsReward: number;
  admin: {
    id: string;
    name: string;
  };
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
}

export default function PollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVoters, setShowVoters] = useState(false);

  useEffect(() => {
    fetchPollResults();
  }, [pollId]);

  const fetchPollResults = async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getResults(pollId);
      console.log('Poll results response:', response.data);

      const pollData = response.data.data || response.data;
      setPoll(pollData);
    } catch (error: any) {
      console.error('Error fetching poll results:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'فشل في تحميل نتائج الاستطلاع';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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

  if (!poll) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground mb-4">الاستطلاع غير موجود</p>
            <Button onClick={() => router.push('/dashboard/polls')}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى الاستطلاعات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl" dir="rtl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/polls')}
        className="mb-6 hover:bg-primary/10 transition-all"
      >
        <ArrowRight className="ml-2 h-5 w-5" />
        العودة إلى الاستطلاعات
      </Button>

      {/* Poll Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="space-y-4">
            <CardTitle className="text-3xl font-bold">{poll.title}</CardTitle>

            {poll.description && (
              <p className="text-muted-foreground text-lg">{poll.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold">{poll.pointsReward} نقطة</span>
              </div>

              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">{poll.totalVotes} صوت</span>
              </div>

              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <Users className="h-4 w-4" />
                <span>بواسطة: {poll.admin.name}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">النتائج</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoters(!showVoters)}
            >
              {showVoters ? 'إخفاء المصوتين' : 'عرض المصوتين'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {poll.totalVotes === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لم يصوت أحد بعد</p>
            </div>
          ) : (
            poll.options.map((option, index) => (
              <div key={option.id} className="space-y-3">
                {/* Option Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium text-lg">{option.text}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{option.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">{option.votesCount} صوت</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary to-primary/80 rounded-full transition-all duration-500"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>

                {/* Voters List */}
                {showVoters && option.voters && option.voters.length > 0 && (
                  <div className="pr-11 pt-2">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-3">
                        المصوتون ({option.voters.length}):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {option.voters.map((voter) => (
                          <div
                            key={voter.userId}
                            className="flex items-center gap-2 text-sm bg-background px-3 py-2 rounded-md"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="font-medium">{voter.userName}</span>
                            <span className="text-xs text-muted-foreground mr-auto">
                              {new Date(voter.votedAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
