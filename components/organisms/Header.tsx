'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Moon, Sun, Menu, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Side - Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-foreground hover:text-primary transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-primary/10"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-foreground hidden md:block">
            مرحباً بك في منصة تعزيز الوعي المجتمعي
          </h1>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-200 hover:scale-110 hover:rotate-12"
            title="تبديل المظهر"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-border/50">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground font-medium">{user?.role}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/20 flex items-center justify-center shadow-md shadow-primary/20 transition-all duration-200 hover:scale-110 hover:rotate-6">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-110"
            title="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
