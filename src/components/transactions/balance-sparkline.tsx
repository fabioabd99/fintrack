// Plain SVG sparkline. preserveAspectRatio="none" stretches it to the card, so
// the stroke is non-scaling.
export function BalanceSparkline({
  points,
  className,
}: {
  points: { day: string; balanceCents: number }[];
  className?: string;
}) {
  if (points.length < 2) return null;

  const width = 320;
  const height = 64;
  const values = points.map((point) => point.balanceCents);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // avoid dividing by zero on a flat line
  const range = max - min || Math.max(1, Math.abs(max) * 0.1);

  const padX = 6;
  const padY = 8;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padY * 2;

  const coords = values.map((value, index) => {
    const x = padX + (index / (values.length - 1)) * plotWidth;
    const y = padY + plotHeight - ((value - min) / range) * plotHeight;
    return [x, y] as const;
  });

  // light smoothing
  const line = coords
    .map(([x, y], index) => {
      if (index === 0) return `M ${x} ${y}`;
      const [px, py] = coords[index - 1];
      const cx = (px + x) / 2;
      return `C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
    })
    .join(" ");

  const area = `${line} L ${width - padX} ${height} L ${padX} ${height} Z`;
  const rising = values.at(-1)! >= values[0];
  const stroke = rising ? "var(--positive)" : "var(--negative)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="balance-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={area} fill="url(#balance-fade)" />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
