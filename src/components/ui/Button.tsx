import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'purple' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-primary/40',
  secondary: 'bg-gradient-to-br from-secondary to-secondary-dark text-white shadow-lg shadow-secondary/30 hover:shadow-secondary/40',
  success: 'bg-gradient-to-br from-success to-success-dark text-white shadow-lg shadow-success/30 hover:shadow-success/40',
  purple: 'bg-gradient-to-br from-purple to-purple-dark text-white shadow-lg shadow-purple/30 hover:shadow-purple/40',
  outline: 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-3 rounded-full font-bold transition-all duration-300',
        'hover:-translate-y-0.5 active:translate-y-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
