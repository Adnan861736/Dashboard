'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { LoadingPage } from '@/components/atoms/LoadingSpinner';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Trash2, Edit, Search, Trophy, X, User as UserIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  points: number;
  createdAt: string;
}

interface EditUserData {
  name: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  points: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<EditUserData>({
    name: '',
    phoneNumber: '',
    role: 'user',
    points: 0,
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const response = await usersAPI.getAll();
      console.log('Users response:', response.data);

      const usersData = response.data.users || response.data.data || response.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'فشل في تحميل المستخدمين';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      console.log('Fetching leaderboard...');
      const response = await usersAPI.getLeaderboard(10);
      console.log('Leaderboard response:', response.data);

      const leaderboardData = response.data.users || response.data.leaderboard || response.data.data || response.data || [];
      setLeaderboard(leaderboardData);
      setShowLeaderboard(true);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'فشل في تحميل لوحة المتصدرين';
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await usersAPI.delete(userToDelete);
      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء الحذف';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditData({
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      points: user.points,
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await usersAPI.update(editingUser.id, editData);
      toast.success('تم تحديث بيانات المستخدم بنجاح');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء التحديث';
      toast.error(errorMessage);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg font-bold text-xs">
        <span>👑</span>
        مدير
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg font-bold text-xs">
        <UserIcon className="h-3 w-3" />
        مستخدم
      </span>
    );
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
            المستخدمون
          </h1>
          <p className="text-muted-foreground text-lg">إدارة المستخدمين والصلاحيات</p>
        </div>
        <Button onClick={fetchLeaderboard} variant="outline" className="gap-2">
          <Trophy className="h-4 w-4" />
          لوحة المتصدرين
        </Button>
      </div>

      {/* Search */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <Input
              placeholder="بحث بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md border-transparent focus-visible:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <span>قائمة المستخدمين</span>
            <span className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
              {filteredUsers.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary/20 bg-accent/30">
                  <th className="text-right p-4 font-bold text-foreground text-sm uppercase tracking-wider">#</th>
                  <th className="text-right p-4 font-bold text-foreground text-sm uppercase tracking-wider">الاسم</th>
                  <th className="text-right p-4 font-bold text-foreground text-sm uppercase tracking-wider">رقم الهاتف</th>
                  <th className="text-right p-4 font-bold text-foreground text-sm uppercase tracking-wider">الصلاحية</th>
                  <th className="text-right p-4 font-bold text-foreground text-sm uppercase tracking-wider">النقاط</th>
                  <th className="text-right p-4 font-bold text-foreground text-sm uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📭</div>
                        <p className="text-lg font-medium">لا توجد بيانات</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-sm group"
                    >
                      <td className="p-4 text-muted-foreground font-mono">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm group-hover:scale-110 transition-transform">
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-4 text-foreground font-semibold">{user.name}</td>
                      <td className="p-4 text-muted-foreground font-mono">{user.phoneNumber}</td>
                      <td className="p-4">{getRoleBadge(user.role)}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-success/10 text-success px-3 py-1.5 rounded-lg font-bold">
                          <span className="text-lg">🏆</span>
                          {user.points}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="text-primary hover:bg-primary/10 hover:scale-110 transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user.id)}
                            className="text-destructive hover:bg-destructive/10 hover:scale-110 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>تعديل بيانات المستخدم</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">الاسم</label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
                  <Input
                    value={editData.phoneNumber}
                    onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                    placeholder="+963998107722"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">الصلاحية</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value as 'user' | 'admin' })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="user">مستخدم</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">النقاط</label>
                  <Input
                    type="number"
                    value={editData.points}
                    onChange={(e) => setEditData({ ...editData, points: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1">
                    حفظ التعديلات
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  لوحة المتصدرين
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLeaderboard(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد بيانات في لوحة المتصدرين
                  </p>
                ) : (
                  leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        index === 0
                          ? 'bg-yellow-500/10 border-yellow-500/50'
                          : index === 1
                          ? 'bg-gray-400/10 border-gray-400/50'
                          : index === 2
                          ? 'bg-orange-700/10 border-orange-700/50'
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-lg font-bold">
                        <Trophy className="h-4 w-4" />
                        {user.points}
                      </div>
                    </div>
                  ))
                )}
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
        title="تأكيد حذف المستخدم"
        description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته ونقاطه بشكل نهائي. لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف المستخدم"
        cancelText="إلغاء"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
