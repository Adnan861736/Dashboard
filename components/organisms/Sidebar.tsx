'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Gamepad2,
  MessageSquare,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/dashboard' },
  { icon: BarChart3, label: 'استطلاعات الرأي', href: '/dashboard/polls' },
  { icon: FileText, label: 'المقالات', href: '/dashboard/articles' },
  { icon: Gamepad2, label: 'الألعاب', href: '/dashboard/games' },
  { icon: MessageSquare, label: 'الجلسات الحوارية', href: '/dashboard/discussions' },
  { icon: Users, label: 'المستخدمون', href: '/dashboard/users' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-card',
          'border-l border-border/50 backdrop-blur-xl shadow-2xl',
          'z-50 transform transition-all duration-300 ease-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'lg:static lg:z-0 lg:shadow-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-primary/10">
          <h2 className="text-xl font-bold text-primary">
            منصة الوعي
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden text-foreground hover:text-primary transition-all duration-200 hover:rotate-90 hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl',
                  'transition-all duration-300 ease-out',
                  'group relative overflow-hidden',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-md hover:translate-x-[-4px]'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-l-full" />
                )}

                {/* Icon with animation */}
                <div className={cn(
                  'transition-transform duration-300',
                  isActive && 'scale-110',
                  !isActive && 'group-hover:scale-110 group-hover:rotate-12'
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <span className="font-semibold">{item.label}</span>

                {/* Hover effect background */}
                {!isActive && (
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-xl" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
