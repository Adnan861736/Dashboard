import React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
          onClick={() => onOpenChange(false)}
        />
      )}
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center">{children}</div>}
    </>
  );
};

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative w-full max-w-lg rounded-xl border border-border bg-card text-card-foreground shadow-lg',
        'backdrop-blur-sm',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-200',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
);

DialogContent.displayName = 'DialogContent';

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 border-b border-border p-6', className)}
    {...props}
  />
));

DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col-reverse gap-3 border-t border-border p-6 sm:flex-row', className)}
    {...props}
  />
));

DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));

DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));

DialogDescription.displayName = 'DialogDescription';

export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'absolute right-4 top-4 rounded-lg opacity-70 transition-opacity duration-200 hover:opacity-100 disabled:pointer-events-none',
      className
    )}
    {...props}
  >
    <span className="sr-only">Close</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 6l-12 12M6 6l12 12" />
    </svg>
  </button>
));

DialogClose.displayName = 'DialogClose';
