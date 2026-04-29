"use client";

function getTone(score: number) {
  if (score <= 40) return { color: "#ef4444", label: "Needs Work" };
  if (score <= 70) return { color: "#f59e0b", label: "Fair" };
  if (score <= 85) return { color: "#60a5fa", label: "Good" };
  return { color: "#22c55e", label: "Excellent" };
}

export function ScoreCircle({ score, size = 170 }: { score: number; size?: number }) {
  const safeScore = Math.max(0, Math.min(score, 100));
  const stroke = 10;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;
  const tone = getTone(safeScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tone.color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 900ms ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{safeScore}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium" style={{ color: tone.color }}>
        {tone.label}
      </span>
    </div>
  );
}
