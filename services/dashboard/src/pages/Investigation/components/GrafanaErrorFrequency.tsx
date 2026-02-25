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

function generateChartSeriesData(stats: IGrafanaLogsStats) {
  // Convert raw Grafana tuples [unixSeconds, countString] into chart-friendly objects.
  // - Multiply timestamp by 1000 to convert from Unix seconds to JS milliseconds.
  // - Parse the string count into a number.
  let count = 0;
  const chartData = stats.values.map(([ts, val]) => {
    const value = Number(val);
    count += value;
    return {
      timestamp: ts * 1000,
      value: value,
    };
  });

  return { chartData, count };
}

export function GrafanaErrorFrequency({ stats }: { stats: IGrafanaLogsStats }) {
  const { chartData: _chartData, count } = generateChartSeriesData(stats);

  // Sometime we get uncomplete hour data, so we slice the last 24 hours
  const chartData = _chartData.slice(-24);

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
