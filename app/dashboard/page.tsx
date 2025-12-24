'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { LoadingPage } from '@/components/atoms/LoadingSpinner';
import { Users, FileText, BarChart3, MessageSquare, Trophy, Crown, Medal, Gamepad2 } from 'lucide-react';
import { usersAPI, articlesAPI, pollsAPI, discussionsAPI, gamesAPI } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalArticles: number;
  totalPolls: number;
  totalDiscussions: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArticles: 0,
    totalPolls: 0,
    totalDiscussions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, articlesRes, pollsRes, discussionsRes, gamesRes, leaderboardRes] = await Promise.all([
        usersAPI.getAll(),
        articlesAPI.getAll(),
        pollsAPI.getAll(),
        discussionsAPI.getAll(),
        gamesAPI.getAll(),
        usersAPI.getLeaderboard(10), // Top 10 users
      ]);

      console.log('Users response:', usersRes.data);
      console.log('Articles response:', articlesRes.data);
      console.log('Polls response:', pollsRes.data);
      console.log('Discussions response:', discussionsRes.data);
      console.log('Games response:', gamesRes.data);
      console.log('Leaderboard response:', leaderboardRes.data);

      // Parse responses based on backend structure
      // Backend returns: { success: true, data: [...], count: number }
      const users = usersRes.data.data || usersRes.data.users || usersRes.data || [];
      const articles = articlesRes.data.data || articlesRes.data.articles || articlesRes.data || [];
      const polls = pollsRes.data.data || pollsRes.data.polls || pollsRes.data || [];
      const discussions = discussionsRes.data.data || discussionsRes.data.discussions || discussionsRes.data || [];
      const games = gamesRes.data.data || gamesRes.data.games || gamesRes.data || [];
      const leaderboardUsers = leaderboardRes.data.data || leaderboardRes.data.leaderboard || leaderboardRes.data || [];

      console.log('Parsed users count:', Array.isArray(users) ? users.length : (usersRes.data.count || 0));
      console.log('Parsed articles count:', Array.isArray(articles) ? articles.length : (articlesRes.data.count || 0));
      console.log('Parsed polls count:', Array.isArray(polls) ? polls.length : (pollsRes.data.count || 0));
      console.log('Parsed discussions count:', Array.isArray(discussions) ? discussions.length : (discussionsRes.data.count || 0));
      console.log('Parsed games count:', Array.isArray(games) ? games.length : (gamesRes.data.count || 0));

      setStats({
        totalUsers: usersRes.data.count || (Array.isArray(users) ? users.length : 0),
        totalArticles: articlesRes.data.count || (Array.isArray(articles) ? articles.length : 0),
        totalPolls: pollsRes.data.count || (Array.isArray(polls) ? polls.length : 0),
        totalDiscussions: discussionsRes.data.count || (Array.isArray(discussions) ? discussions.length : 0),
      });

      // Set leaderboard data
      setLeaderboard(Array.isArray(leaderboardUsers) ? leaderboardUsers : []);

      // Prepare chart data (last 7 days activity - simulated)
      const mockChartData = [
        { name: 'السبت', users: 12, articles: 5, polls: 3, discussions: 2, games: 3 },
        { name: 'الأحد', users: 19, articles: 8, polls: 5, discussions: 4, games: 5 },
        { name: 'الاثنين', users: 15, articles: 6, polls: 2, discussions: 3, games: 2 },
        { name: 'الثلاثاء', users: 25, articles: 10, polls: 7, discussions: 5, games: 7 },
        { name: 'الأربعاء', users: 22, articles: 7, polls: 4, discussions: 3, games: 4 },
        { name: 'الخميس', users: 30, articles: 12, polls: 6, discussions: 6, games: 6 },
        { name: 'الجمعة', users: 28, articles: 9, polls: 8, discussions: 4, games: 8 },
      ];
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Title */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground animate-in slide-in-from-top-2 duration-500">
            لوحة التحكم
          </h1>
          <p className="text-muted-foreground text-lg animate-in slide-in-from-top-3 duration-700 delay-100">
            مرحباً بك في منصة تعزيز الوعي المجتمعي
          </p>
        </div>

        {/* Leaderboard Button */}
        <button
          onClick={() => setShowLeaderboardModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all hover:scale-105 font-semibold"
        >
          <Trophy className="h-5 w-5" />
          <span>قائمة المتصدرين</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="إجمالي المقالات"
          value={stats.totalArticles}
          icon={FileText}
          iconColor="text-success"
        />
        <StatCard
          title="استطلاعات الرأي"
          value={stats.totalPolls}
          icon={BarChart3}
          iconColor="text-accent"
        />
        <StatCard
          title="الجلسات الحوارية"
          value={stats.totalDiscussions}
          icon={MessageSquare}
          iconColor="text-warning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>الإحصائيات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="articles" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="polls" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="discussions" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>الجلسات الحوارية والألعاب</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="discussions"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="جلسات حوارية"
                />
                <Line
                  type="monotone"
                  dataKey="games"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  name="ألعاب"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={() => setShowLeaderboardModal(false)}
        >
          <Card
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  قائمة المتصدرين
                </CardTitle>
                <button
                  onClick={() => setShowLeaderboardModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <span className="text-2xl text-muted-foreground">×</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                أفضل 10 مستخدمين حسب النقاط المكتسبة
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                  <p className="text-lg font-medium">لا يوجد مستخدمون في قائمة المتصدرين بعد</p>
                  <p className="text-sm mt-2">ابدأ بتحصيل النقاط لتظهر في القائمة!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((user, index) => {
                    const rank = index + 1;
                    const getRankIcon = () => {
                      if (rank === 1) return <Crown className="h-5 w-5" />;
                      if (rank === 2) return <Medal className="h-5 w-5" />;
                      if (rank === 3) return <Medal className="h-5 w-5" />;
                      return null;
                    };

                    const getRankBadgeColor = () => {
                      if (rank === 1) return 'bg-primary text-primary-foreground shadow-lg';
                      if (rank === 2) return 'bg-secondary text-secondary-foreground shadow-md';
                      if (rank === 3) return 'bg-accent text-accent-foreground shadow-md';
                      return 'bg-muted text-muted-foreground';
                    };

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-lg ${
                          rank <= 3
                            ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/30'
                            : 'bg-muted/30 border-border'
                        }`}
                      >
                        {/* Rank */}
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm ${getRankBadgeColor()}`}
                        >
                          {rank <= 3 ? getRankIcon() : rank}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-lg">{user.name}</h4>
                          <p className="text-xs text-muted-foreground">المرتبة #{rank}</p>
                        </div>

                        {/* Points */}
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            <span className="font-bold text-2xl text-foreground">{user.points}</span>
                          </div>
                          <p className="text-xs text-muted-foreground text-center">نقطة</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
