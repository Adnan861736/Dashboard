'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { LoadingPage } from '@/components/atoms/LoadingSpinner';
import { Users, FileText, BarChart3, MessageSquare } from 'lucide-react';
import { usersAPI, articlesAPI, pollsAPI, discussionsAPI } from '@/lib/api';
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArticles: 0,
    totalPolls: 0,
    totalDiscussions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, articlesRes, pollsRes, discussionsRes] = await Promise.all([
        usersAPI.getAll(),
        articlesAPI.getAll(),
        pollsAPI.getAll(),
        discussionsAPI.getAll(),
      ]);

      console.log('Users response:', usersRes.data);
      console.log('Articles response:', articlesRes.data);
      console.log('Polls response:', pollsRes.data);
      console.log('Discussions response:', discussionsRes.data);

      // Parse responses based on backend structure
      // Backend returns: { success: true, data: [...], count: number }
      const users = usersRes.data.data || usersRes.data.users || usersRes.data || [];
      const articles = articlesRes.data.data || articlesRes.data.articles || articlesRes.data || [];
      const polls = pollsRes.data.data || pollsRes.data.polls || pollsRes.data || [];
      const discussions = discussionsRes.data.data || discussionsRes.data.discussions || discussionsRes.data || [];

      console.log('Parsed users count:', Array.isArray(users) ? users.length : (usersRes.data.count || 0));
      console.log('Parsed articles count:', Array.isArray(articles) ? articles.length : (articlesRes.data.count || 0));
      console.log('Parsed polls count:', Array.isArray(polls) ? polls.length : (pollsRes.data.count || 0));
      console.log('Parsed discussions count:', Array.isArray(discussions) ? discussions.length : (discussionsRes.data.count || 0));

      setStats({
        totalUsers: usersRes.data.count || (Array.isArray(users) ? users.length : 0),
        totalArticles: articlesRes.data.count || (Array.isArray(articles) ? articles.length : 0),
        totalPolls: pollsRes.data.count || (Array.isArray(polls) ? polls.length : 0),
        totalDiscussions: discussionsRes.data.count || (Array.isArray(discussions) ? discussions.length : 0),
      });

      // Prepare chart data (last 7 days activity - simulated)
      const mockChartData = [
        { name: 'السبت', users: 12, articles: 5, polls: 3, discussions: 2 },
        { name: 'الأحد', users: 19, articles: 8, polls: 5, discussions: 4 },
        { name: 'الاثنين', users: 15, articles: 6, polls: 2, discussions: 3 },
        { name: 'الثلاثاء', users: 25, articles: 10, polls: 7, discussions: 5 },
        { name: 'الأربعاء', users: 22, articles: 7, polls: 4, discussions: 3 },
        { name: 'الخميس', users: 30, articles: 12, polls: 6, discussions: 6 },
        { name: 'الجمعة', users: 28, articles: 9, polls: 8, discussions: 4 },
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
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground animate-in slide-in-from-top-2 duration-500">
          لوحة التحكم
        </h1>
        <p className="text-muted-foreground text-lg animate-in slide-in-from-top-3 duration-700 delay-100">
          مرحباً بك في منصة تعزيز الوعي المجتمعي
        </p>
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
            <CardTitle>النشاط الأخير</CardTitle>
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
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="articles"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="polls"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="discussions"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
