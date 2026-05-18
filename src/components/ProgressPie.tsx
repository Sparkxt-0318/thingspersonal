interface Props {
  progress: number // 0..1
  size?: number
  className?: string
  active?: boolean
}

/** Things-style circular progress indicator for projects. */
export function ProgressPie({ progress, size = 16, className, active }: Props) {
  const r = size / 2
  const stroke = 1.6
  const inner = r - stroke
  const clamped = Math.max(0, Math.min(1, progress))
  const angle = clamped * 360
  const color = active ? '#ffffff' : 'var(--accent)'

  // Pie wedge path
  const cx = r
  const cy = r
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180
  const ex = cx + inner * Math.cos(rad(angle))
  const ey = cy + inner * Math.sin(rad(angle))
  const large = angle > 180 ? 1 : 0
  const wedge =
    clamped >= 0.999
      ? `M ${cx} ${cy} m ${-inner} 0 a ${inner} ${inner} 0 1 0 ${inner * 2} 0 a ${inner} ${inner} 0 1 0 ${-inner * 2} 0`
      : `M ${cx} ${cy} L ${cx} ${cy - inner} A ${inner} ${inner} 0 ${large} 1 ${ex} ${ey} Z`

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r - stroke / 2}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        opacity={active ? 0.55 : 0.45}
      />
      {clamped > 0 && <path d={wedge} fill={color} />}
    </svg>
  )
}
