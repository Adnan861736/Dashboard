'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Phone, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      window.location.replace('/dashboard');
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(phoneNumber, password);
      // Small delay to ensure localStorage is set
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Card Container */}
        <div className="bg-card/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-border/50 relative overflow-hidden">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>

          {/* Header Section */}
          <div className="text-center mb-8 animate-in slide-in-from-top-2 duration-500">
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mb-4 shadow-lg shadow-primary/30 animate-in zoom-in duration-700 delay-100">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>

            <h2 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              تسجيل الدخول
            </h2>
            <p className="text-muted-foreground text-base">
              منصة تعزيز الوعي المجتمعي
            </p>
          </div>

          {/* Form Section */}
          <form className="space-y-5 animate-in slide-in-from-bottom-3 duration-700 delay-200" onSubmit={handleSubmit}>
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-foreground">
                رقم الهاتف
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Phone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3.5 pr-11 border-2 border-input rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                  placeholder="+963998107722"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                كلمة المرور
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-11 border-2 border-input rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 flex items-center justify-center py-3.5 px-6 rounded-xl shadow-lg text-base font-semibold text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                'دخول'
              )}
            </button>
          </form>

          {/* Welcome Message */}
          <div className="mt-6 text-center animate-in fade-in duration-1000 delay-300">
            <p className="text-sm text-muted-foreground">
              مرحباً بك في منصة الوعي
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
