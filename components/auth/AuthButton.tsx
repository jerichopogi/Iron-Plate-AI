'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ children, isLoading, icon, variant = 'default', className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || isLoading}
        className={`w-full h-12 min-h-[48px] text-base font-medium ${className ?? ''}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </Button>
    );
  }
);

AuthButton.displayName = 'AuthButton';

export { AuthButton };
