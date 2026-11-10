import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from 'recharts';

import type { ChartTerm } from '../types';

type ChartOrientation = 'vertical' | 'horizontal';

type WdfIdfChartProps = {
  data: ChartTerm[];
  orientation: ChartOrientation;
};

const BAR_COLORS = [
  '#38bdf8',
  '#8b5cf6',
  '#f472b6',
  '#34d399',
  '#fbbf24',
];

function formatScore(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(5)
    : '—';
}

type TooltipEntry = {
  value?: number;
  payload?: ChartTerm & {
    averageTotal: number;
  };
};

type ScoreTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
};

function ScoreTooltip({
  active,
  payload,
}: ScoreTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const term = payload[0]?.payload;

  if (!term) {
    return null;
  }

  return (
    <div className="min-w-52 rounded-xl border border-border bg-background p-4 shadow-lg">
      <p className="mb-3 font-semibold">{term.term}</p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">
            Average WDF-IDF(total)
          </span>
          <span className="font-medium tabular-nums">
            {formatScore(term.averageTotal)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">
            Average WDF-IDF(used)
          </span>
          <span className="font-medium tabular-nums">
            {formatScore(term.averageUsed)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">
            Recommended maximum
          </span>
          <span className="font-medium tabular-nums">
            {formatScore(term.maximum)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">
            Minimum WDF-IDF
          </span>
          <span className="tabular-nums">
            {formatScore(term.minimum)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">
            URL WDF-IDF
          </span>
          <span className="font-medium tabular-nums">
            {formatScore(term.urlScore)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WdfIdfChart({
  data,
  orientation,
}: WdfIdfChartProps) {
  const isHorizontal = orientation === 'horizontal';

  const chartHeight = isHorizontal
    ? Math.max(500, data.length * 32)
    : 460;

  if (!data.length) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No terms are available to display.
      </div>
    );
  }


  const chartRows = data.map((term) => ({
    ...term,
    averageUnused: Math.max(0, term.averageUsed - term.averageTotal),
    errorRange: [
      Math.max(0, term.averageTotal - term.minimum),
      Math.max(0, term.maximum - term.averageTotal),
    ],
  }));

  return (
    <div className="w-full">
      {/* Legend */}

      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" />
          Average total
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-400 opacity-40" />
          Average used
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-emerald-500" />
          Recommended term WDF-IDF
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 bg-muted-foreground" />
          Minimum–maximum range
        </div>
      </div>

      <div
        className={`w-full overflow-auto ${
          isHorizontal ? 'max-h-[650px]' : ''
        }`}
      >
        <div
          style={{
            width: isHorizontal
              ? '100%'
              : `${Math.max(850, data.length * 55)}px`,
            minWidth: isHorizontal ? '850px' : undefined,
            height: isHorizontal
              ? `${chartHeight}px`
              : '460px',
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <ComposedChart
              data={chartRows}
              layout={isHorizontal ? 'vertical' : 'horizontal'}
              margin={
                isHorizontal
                  ? {
                      top: 12,
                      right: 45,
                      bottom: 32,
                      left: 12,
                    }
                  : {
                      top: 20,
                      right: 24,
                      bottom: 16,
                      left: 12,
                    }
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={!isHorizontal}
                horizontal={isHorizontal}
                className="stroke-border"
              />

              {isHorizontal ? (
                <>
                  <XAxis
                    type="number"
                    domain={[0, 'auto']}
                    tickFormatter={formatScore}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="term"
                    width={170}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <ReferenceLine
                    x={0}
                    stroke="currentColor"
                    opacity={0.2}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    type="category"
                    dataKey="term"
                    interval={0}
                    height={110}
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    type="number"
                    domain={[0, 'auto']}
                    tickFormatter={formatScore}
                    width={72}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <ReferenceLine
                    y={0}
                    stroke="currentColor"
                    opacity={0.2}
                  />
                </>
              )}

              <Tooltip
                content={<ScoreTooltip />}
                cursor={{
                  fill: 'currentColor',
                  opacity: 0.04,
                }}
              />

              {/* Recommended maximum line */}

              {isHorizontal ? (
                <Line
                  dataKey="maximum"
                  name="Recommended term WDF-IDF"
                  type="linear"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  dataKey="maximum"
                  name="Recommended term WDF-IDF"
                  type="monotone"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              )}

<Bar
  dataKey="averageTotal"
  stackId="average"
  name="Average total"
  radius={isHorizontal ? [0, 0, 0, 0] : [0, 0, 0, 0]}
>
  {chartRows.map((entry, index) => (
    <Cell
      key={`total-${index}`}
      fill={BAR_COLORS[index % BAR_COLORS.length]}
      fillOpacity={1}
    />
  ))}
</Bar>

<Bar
  dataKey="averageUnused"
  stackId="average"
  name="Average used"
  radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
>
  {chartRows.map((entry, index) => (
    <Cell
      key={`used-${index}`}
      fill={BAR_COLORS[index % BAR_COLORS.length]}
      fillOpacity={0.3}
    />
  ))}
</Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Showing {data.length} terms. Solid bars represent average total
        WDF-IDF, translucent sections represent average used, and the
        dashed line indicates the maximum observed competitor score.
      </p>
    </div>
  );
}