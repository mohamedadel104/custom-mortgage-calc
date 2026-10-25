import { useEffect, useRef, useState } from 'react';
import { compactEuro, euro, type Month } from '../lib/mortgage';

function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(650);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(Math.max(280, element.clientWidth)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

function scale(values: number[], startAtZero = false) {
  const min = startAtZero ? 0 : Math.min(...values),
    max = Math.max(...values);
  const span = Math.max(Math.abs(max) * 0.02, max - min, 0.01);
  const raw = span / 4,
    power = Math.pow(10, Math.floor(Math.log10(raw))),
    ratio = raw / power;
  const step = (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10) * power;
  const low = startAtZero ? 0 : Math.floor((min - span * 0.05) / step) * step;
  const high = Math.max(low + step, Math.ceil((max + span * 0.05) / step) * step);
  return {
    low,
    high,
    ticks: Array.from({ length: Math.round((high - low) / step) + 1 }, (_, i) => low + i * step),
  };
}

export function DebtChart({
  rows,
  loan,
  fixedYears,
}: {
  rows: Month[];
  loan: number;
  fixedYears: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const { ref, width } = useChartWidth();
  const w = width - 28,
    h = 220,
    left = 55,
    right = 24,
    top = 18,
    bottom = 28;
  const axis = scale([Math.max(1000, loan)], true);
  const last = Math.max(12, rows.at(-1)?.month ?? 12);
  const x = (month: number) => left + (month / last) * (w - left - right);
  const y = (value: number) => top + (1 - value / axis.high) * (h - top - bottom);
  const points = [
    { month: 0, balance: loan },
    ...rows.filter((r) => r.month % 3 === 0 || r.month === last),
  ];
  const path = points
    .map((r, i) => `${i === 0 ? 'M' : 'L'}${x(r.month)},${y(r.balance)}`)
    .join(' ');
  const selected = hover !== null ? rows[Math.max(0, Math.min(rows.length - 1, hover - 1))] : null;
  return (
    <div className="debt-chart" ref={ref}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Projected debt falls from ${euro(loan)} over ${Math.ceil(last / 12)} years. The fixed rate ends after ${fixedYears} years.`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHover(
            Math.max(
              1,
              Math.round(
                ((((e.clientX - rect.left) / rect.width) * w - left) / (w - left - right)) * last,
              ),
            ),
          );
        }}
      >
        {axis.ticks.map((v) => (
          <g key={v}>
            <line
              x1={left}
              x2={w - right}
              y1={y(v)}
              y2={y(v)}
              stroke="#e5e8eb"
              strokeDasharray="3 5"
            />
            <text x={left - 10} y={y(v) + 4} textAnchor="end">
              {compactEuro(v)}
            </text>
          </g>
        ))}
        <path
          d={`${path} L${x(last)},${y(0)} L${x(0)},${y(0)} Z`}
          fill="#1d5fbf"
          fillOpacity=".04"
        />
        <path
          d={points
            .filter((p) => p.month <= fixedYears * 12)
            .map((p, i) => `${i ? 'L' : 'M'}${x(p.month)},${y(p.balance)}`)
            .join(' ')}
          fill="none"
          stroke="#1d5fbf"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d={points
            .filter((p) => p.month >= fixedYears * 12)
            .map((p, i) => `${i ? 'L' : 'M'}${x(p.month)},${y(p.balance)}`)
            .join(' ')}
          fill="none"
          stroke="#8a919b"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        {fixedYears * 12 < last && (
          <g>
            <line
              x1={x(fixedYears * 12)}
              x2={x(fixedYears * 12)}
              y1={top + 16}
              y2={y(0)}
              stroke="#8a919b"
              strokeDasharray="4 4"
            />
            <text x={Math.min(w - 110, x(fixedYears * 12) + 7)} y={top + 8}>
              {w < 450 ? 'Rate fix ends' : 'Refinancing assumption'}
            </text>
          </g>
        )}
        {[
          ...new Set(
            Array.from({ length: w < 450 ? 4 : 7 }, (_, i) =>
              Math.round((last / 12 / (w < 450 ? 3 : 6)) * i),
            ),
          ),
        ].map((year, i) => (
          <text key={i} x={x(year * 12)} y={h - 6} textAnchor="middle">
            {year === 0 ? 'Today' : `Year ${year}`}
          </text>
        ))}
        {selected && (
          <g>
            <line
              x1={x(selected.month)}
              x2={x(selected.month)}
              y1={top}
              y2={y(0)}
              stroke="#1d5fbf"
              opacity=".3"
            />
            <circle cx={x(selected.month)} cy={y(selected.balance)} r="4" fill="#1d5fbf" />
          </g>
        )}
      </svg>
      <div className="chart-caption">
        {selected
          ? `Month ${selected.month} · Remaining ${euro(selected.balance)} · Interest paid ${euro(selected.totalInterest)}`
          : 'Hover to explore · The line after refinancing uses your future-rate assumption.'}
      </div>
    </div>
  );
}

export function LineChart({
  points,
  valueLabel,
  label,
}: {
  points: { label: string; value: number }[];
  valueLabel: (n: number) => string;
  label: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const { ref, width } = useChartWidth();
  if (!points.length) return <p>No observations available.</p>;
  const height = 230,
    l = 75,
    t = 20,
    b = 35,
    r = 30;
  const { low, high, ticks } = scale(points.map((p) => p.value));
  const x = (i: number) => l + (i / Math.max(1, points.length - 1)) * (width - l - r);
  const y = (v: number) => t + (1 - (v - low) / Math.max(0.01, high - low)) * (height - t - b);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ');
  const selected = points[Math.min(index ?? points.length - 1, points.length - 1)];
  return (
    <div ref={ref}>
      <div className="chart-readout">
        <b>{valueLabel(selected.value)}</b>
        <span>{selected.label}</span>
      </div>
      <svg
        className="line-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        onMouseLeave={() => setIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setIndex(
            Math.min(
              points.length - 1,
              Math.max(
                0,
                Math.round(
                  ((((e.clientX - rect.left) / rect.width) * width - l) / (width - l - r)) *
                    (points.length - 1),
                ),
              ),
            ),
          );
        }}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={l}
              x2={width - r}
              y1={y(v)}
              y2={y(v)}
              stroke="#e5e8eb"
              strokeDasharray="3 5"
            />
            <text x={l - 10} y={y(v) + 4} textAnchor="end">
              {valueLabel(v)}
            </text>
          </g>
        ))}
        <path d={line} stroke="#1d5fbf" strokeWidth="2" fill="none" />
        {[
          ...new Set(
            Array.from({ length: width < 450 ? 3 : 4 }, (_, i) =>
              Math.round(((points.length - 1) * i) / (width < 450 ? 2 : 3)),
            ),
          ),
        ].map((n, i) => (
          <text
            key={i}
            x={x(n)}
            y={height - 8}
            textAnchor={i === 0 ? 'start' : n === points.length - 1 ? 'end' : 'middle'}
          >
            {points[n].label}
          </text>
        ))}
        {index !== null && <circle cx={x(index)} cy={y(selected.value)} r="4" fill="#1d5fbf" />}
      </svg>
    </div>
  );
}
