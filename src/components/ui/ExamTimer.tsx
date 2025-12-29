import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface ExamTimerProps {
  duration: number; // in seconds
  onTimeUp?: () => void;
  variant?: 'primary' | 'warning' | 'danger';
  className?: string;
}

export function ExamTimer({ duration, onTimeUp, variant = 'primary', className }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;

  const isWarning = percentage <= 30 && percentage > 10;
  const isDanger = percentage <= 10;

  const colorClasses = {
    primary: 'text-secondary bg-blue-50',
    warning: 'text-orange-500 bg-orange-50',
    danger: 'text-red-500 bg-red-50',
  };

  const currentVariant = isDanger ? 'danger' : isWarning ? 'warning' : variant;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300',
        colorClasses[currentVariant],
        className
      )}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(isDanger && 'animate-pulse')}
        />
        <path
          d="M10 6v4l3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className={cn('font-bold tabular-nums', isDanger && 'animate-pulse')}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
