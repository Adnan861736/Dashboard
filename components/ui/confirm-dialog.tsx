import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="h-6 w-6" />,
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
          buttonVariant: 'destructive' as const,
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          iconBg: 'bg-yellow-500/10',
          iconColor: 'text-yellow-600 dark:text-yellow-500',
          buttonVariant: 'default' as const,
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          buttonVariant: 'default' as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 rounded-lg opacity-70 transition-opacity duration-200 hover:opacity-100 disabled:pointer-events-none"
          disabled={loading}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">إغلاق</span>
        </button>

        <DialogHeader className="border-none pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 rounded-full p-3 ${styles.iconBg} ${styles.iconColor}`}>
              {styles.icon}
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl text-right">{title}</DialogTitle>
              <DialogDescription className="text-right text-base leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="border-none pt-2 sm:flex-row-reverse">
          <Button
            onClick={handleConfirm}
            variant={styles.buttonVariant}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>جاري الحذف...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={loading}
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
