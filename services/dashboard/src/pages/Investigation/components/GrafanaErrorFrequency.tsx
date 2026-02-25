import {
  ChartTooltipContent,
  selectEvenlySpacedItems,
} from "@/components/application/charts/charts-base";
import Typography from "@/components/common/Typography";
import { IGrafanaLogsStats } from "@/types/Investigtion";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Transforms sparse Grafana log stats into a fixed-length 24-point time series
 * suitable for rendering a bar chart.
 *
 * Grafana returns log counts as sparse `[unixSeconds, countString]` tuples — only
 * timestamps with actual data are included, so there can be far fewer than 24 entries.
 * The chart, however, needs a consistent 24-bar series covering the last 24 hours so
 * that the visual spacing is uniform and gaps in activity are clearly visible.
 *
 * How it works:
 * 1. Converts the raw tuples into `{ timestamp (ms), value (number) }` objects,
 *    preserving the original timestamps exactly as returned by Grafana.
 * 2. Computes the total occurrence count across all data points.
 * 3. Pads the series with zero-value entries at hourly intervals — starting 23 hours
 *    before the latest data point — until the series contains exactly 24 entries.
 *    Existing timestamps are never overwritten or shifted.
 * 4. Sorts the combined series chronologically.
 *
 * @returns `{ chartData, count }` — the 24-point series and the total occurrence count.
 */
function generateChartSeriesData(stats: IGrafanaLogsStats) {
  // 1 hour in milliseconds, used as the interval between chart data points
  const hourMs = 60 * 60 * 1000;

  // Convert raw Grafana tuples [unixSeconds, countString] into chart-friendly objects.
  // - Multiply timestamp by 1000 to convert from Unix seconds to JS milliseconds.
  // - Parse the string count into a number.
  let count = 0;
  const dataPoints = stats.values.map(([ts, val]) => {
    const value = Number(val);
    count += value;
    return {
      timestamp: ts * 1000,
      value: value,
    };
  });

  // Collect timestamps that already have data so we don't create duplicate entries
  const occupied = new Set(dataPoints.map((d) => d.timestamp));

  // Find the latest data point — the 24-hour window ends here
  const latest = Math.max(...dataPoints.map((d) => d.timestamp));

  // The window starts 23 hours before the latest point (24 slots inclusive)
  const startMs = latest - 23 * hourMs;

  // Generate zero-value filler entries at hourly intervals, skipping any
  // timestamps that already exist in the real data, until we reach 24 total entries
  const fillers: { timestamp: number; value: number }[] = [];
  for (let i = 0; fillers.length + dataPoints.length < 24; i++) {
    const ts = startMs + i * hourMs;
    if (!occupied.has(ts)) {
      fillers.push({ timestamp: ts, value: 0 });
    }
  }

  // Merge real data points with fillers and sort chronologically for the chart
  const chartData = [...dataPoints, ...fillers].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  return { chartData, count };
}

export function GrafanaErrorFrequency({ stats }: { stats: IGrafanaLogsStats }) {
  const { chartData, count } = generateChartSeriesData(stats);

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="md/normal" className="text-black">
        {count} occurrences in the last 24 hours
      </Typography>
      <div className="border border-secondary rounded-lg p-3">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart
            data={chartData}
            margin={{
              left: 4,
              right: 0,
              top: 12,
              bottom: 18,
            }}
            className="text-tertiary [&_.recharts-text]:text-xs"
          >
            <CartesianGrid
              vertical={false}
              stroke="currentColor"
              className="text-utility-gray-100"
            />
            <XAxis
              fill="currentColor"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              interval="preserveStartEnd"
              dataKey="timestamp"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })
              }
              ticks={selectEvenlySpacedItems(chartData, 3).map(
                (item) => item.timestamp,
              )}
            />

            <YAxis
              fill="currentColor"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              dataKey="value"
              tickFormatter={(value) => Number(value).toLocaleString()}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              formatter={(value) => Number(value).toLocaleString()}
              labelFormatter={(value) => {
                const date = new Date(value);

                return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", year: "numeric" })}`;
              }}
              cursor={{
                className: "fill-utility-gray-200/20",
              }}
            />
            <Bar
              isAnimationActive={false}
              className="fill-fg-brand-primary"
              name="Count"
              dataKey="value"
              type="monotone"
              stackId="a"
              fill="currentColor"
              maxBarSize={12}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
