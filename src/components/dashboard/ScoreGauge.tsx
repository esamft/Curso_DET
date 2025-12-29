import { useEffect, useRef } from 'react';
import { getExamLevel } from '@/types/exam';
import { cn } from '@/utils/cn';

interface ScoreGaugeProps {
  score: number;
  scoreRange?: { min: number; max: number };
  className?: string;
}

export function ScoreGauge({ score, scoreRange, className }: ScoreGaugeProps) {
  const needleRef = useRef<SVGGElement>(null);
  const level = getExamLevel(score);

  useEffect(() => {
    if (!needleRef.current) return;

    // Calculate angle for needle (-90 to 90 degrees)
    const minScore = 10;
    const maxScore = 160;
    const minAngle = -90;
    const maxAngle = 90;

    const angle =
      ((score - minScore) / (maxScore - minScore)) * (maxAngle - minAngle) + minAngle;

    needleRef.current.style.transform = `rotate(${angle}deg)`;
    needleRef.current.style.transformOrigin = '100px 100px';
  }, [score]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg className="w-full max-w-[280px] h-[160px]" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Colored sections */}
        <path
          d="M 20 100 A 80 80 0 0 1 60 40"
          fill="none"
          stroke="#F44336"
          strokeWidth="20"
          strokeLinecap="round"
        />

        <path
          d="M 60 40 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="#FFC107"
          strokeWidth="20"
          strokeLinecap="round"
        />

        <path
          d="M 100 20 A 80 80 0 0 1 140 40"
          fill="none"
          stroke="#8BC34A"
          strokeWidth="20"
          strokeLinecap="round"
        />

        <path
          d="M 140 40 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Needle */}
        <g
          ref={needleRef}
          className="transition-transform duration-[2s] ease-out"
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="100" cy="100" r="8" fill="#3C3C3C" />
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="#3C3C3C"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <div className="text-center mt-5">
        <div className="text-5xl font-black bg-gradient-to-br from-purple to-purple-dark bg-clip-text text-transparent">
          {scoreRange ? `${scoreRange.min}-${scoreRange.max}` : score}
        </div>
        <div className="text-lg text-green-600 font-semibold mt-2">
          {level.icon} Nível {level.level} {level.name}
        </div>
      </div>

      <div className="flex justify-between w-full max-w-[240px] mt-4 text-sm text-gray-500">
        <span>10</span>
        <span>60</span>
        <span>110</span>
        <span>160</span>
      </div>
    </div>
  );
}
