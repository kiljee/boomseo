import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
type GSCRow = {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
};

type Props = {
  gsc?: GSCRow[];
};

export function PerformanceCard({ gsc = [] }: Props) {
  const chartData = [...gsc]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8)
    .map((row) => ({
      query:
        row.query.length > 18
          ? `${row.query.slice(0, 18)}...`
          : row.query,
      clicks: row.clicks,
      impressions: row.impressions,
    }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
      <h2 className="font-semibold">
        Organic Performance
      </h2>

      <p className="mt-1 text-xs text-muted-foreground">
        Top search queries by clicks.
      </p>

      {chartData.length === 0 ? (
        <div className="mt-8 flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
          <div className="text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/50" />

            <p className="mt-3 text-sm font-medium">
              No performance data yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Import Google Search Console data to see performance.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="query"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11 
                }}
                axisLine={{
                  stroke: "hsl(var(--border))",
                }}
                tickLine={false}
                interval={0}
              />

              <YAxis
                tick={{ 
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))"
                }}
               />

              <Bar
                dataKey="clicks"
                name="Clicks"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="impressions"
                name="Impressions"
                fill="hsl(var(--muted-foreground))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}