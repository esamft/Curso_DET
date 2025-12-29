import { cn } from '@/utils/cn';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const getVariant = (score: number) => {
    if (score >= 140) return 'excellent';
    if (score >= 115) return 'high';
    if (score >= 95) return 'medium';
    if (score >= 70) return 'low';
    return 'basic';
  };

  const variant = getVariant(score);

  const variantStyles = {
    excellent: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    high: 'bg-gradient-to-br from-green-400 to-green-500 text-white',
    medium: 'bg-gradient-to-br from-lime-400 to-lime-500 text-white',
    low: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white',
    basic: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {score}
    </span>
  );
}
