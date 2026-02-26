import {
  ChartTooltipContent,
  selectEvenlySpacedItems,
} from "@/components/application/charts/charts-base";
import Typography from "@/components/common/Typography";
import { IDatadogLogsStats } from "@/types/Investigtion";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DatadogErrorFrequency({
  stats,
}: {
  stats: IDatadogLogsStats[];
}) {
  // Sometime we get uncomplete hour data, so we slice the last 24 hours
  // and add the overflow to the first hour
  const overflow = stats.slice(0, -24);
  const overflowSum = overflow.reduce((sum, item) => sum + item.value, 0);
  const chartData = stats
    .slice(-24)
    .map((item, i) =>
      i === 0 ? { ...item, value: item.value + overflowSum } : item,
    );
  const count = chartData.reduce((acc, curr) => acc + curr.value, 0);

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
