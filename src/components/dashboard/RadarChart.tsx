import { ExamScore } from '@/types/exam';

interface RadarChartProps {
  scores: Omit<ExamScore, 'overall'>;
  className?: string;
}

export function RadarChart({ scores, className }: RadarChartProps) {
  // Convert scores (0-160) to polygon points (0-80 radius)
  const maxScore = 160;
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 80;

  const points = [
    {
      label: 'Literacy',
      score: scores.literacy,
      angle: -90, // Top
    },
    {
      label: 'Comprehension',
      score: scores.comprehension,
      angle: -30, // Top-right
    },
    {
      label: 'Production',
      score: scores.production,
      angle: 30, // Bottom-right
    },
    {
      label: 'Conversation',
      score: scores.conversation,
      angle: 90, // Bottom
    },
  ];

  const calculatePoint = (score: number, angle: number) => {
    const radius = (score / maxScore) * maxRadius;
    const radians = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
    return { x, y };
  };

  const dataPoints = points.map((p) => calculatePoint(p.score, p.angle));
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid levels (3 concentric polygons)
  const gridLevels = [0.33, 0.66, 1].map((scale) => {
    const pts = points.map((p) => {
      const pt = calculatePoint(p.score * scale, p.angle);
      return `${pt.x},${pt.y}`;
    });
    return pts.join(' ');
  });

  return (
    <div className={className}>
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Grid polygons */}
        {gridLevels.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {points.map((p, i) => {
          const pt = calculatePoint(maxScore, p.angle);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={pt.x}
              y2={pt.y}
              stroke="#E5E5E5"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(33, 150, 243, 0.3)"
          stroke="#2196F3"
          strokeWidth="2"
          className="animate-[radarGrow_1.5s_ease-out]"
        />

        {/* Data points */}
        {dataPoints.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2196F3" />
        ))}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {points.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>
              {p.label}: {p.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
