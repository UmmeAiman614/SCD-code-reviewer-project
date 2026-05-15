export function ScoreRing({ score = 0, size = 80, stroke = 7, label = '' }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const fill  = circ - (Math.min(score, 10) / 10) * circ
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : score >= 4 ? '#E44A28' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="currentColor" strokeWidth={stroke}
            className="text-slate-200 dark:text-dark-border2" />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={fill}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-slate-900 dark:text-white"
            style={{ fontSize: size * 0.22 }}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-light-text dark:text-dark-text">{label}</span>}
    </div>
  )
}
