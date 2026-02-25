import {
  ChartTooltipContent,
  selectEvenlySpacedItems,
} from "@/components/application/charts/charts-base";
import {
  ButtonGroup,
  ButtonGroupItem,
} from "@/components/base/button-group/button-group";
import Typography from "@/components/common/Typography";
import { ISentryIssue, ISentryStats } from "@/types/Investigtion";
import { useState } from "react";
import type { Key } from "react-aria-components";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EVENT_COUNT_KEY = "count()";
const USER_COUNT_KEY = "count_unique(user)";

export function SentryErrorFrequency({
  issue,
  stats,
}: {
  issue: ISentryIssue;
  stats: ISentryStats;
}) {
  const [selectedKey, setSelectedKey] = useState<Set<Key>>(
    new Set([EVENT_COUNT_KEY]),
  );

  const { count, chartData: _chartData } = (() => {
    if (selectedKey.has(EVENT_COUNT_KEY)) {
      return {
        count: issue?.count ?? 0,
        chartData: (stats?.timeSeries?.[0]?.values ?? []),
      };
    }

    return {
      count: issue?.userCount ?? 0,
      chartData: (stats?.timeSeries?.[1]?.values ?? []),
    };
  })();

  // Sometime we get uncomplete hour data, so we slice the last 24 hours
  const chartData = _chartData.slice(-24);

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="md/normal" className="text-black">
        {count} occurrences in the last 24 hours
      </Typography>
      <div className="border border-secondary rounded-lg p-3">
        <ButtonGroup
          selectedKeys={selectedKey}
          defaultSelectedKeys={selectedKey}
          className="mb-3"
          onSelectionChange={setSelectedKey}
        >
          <ButtonGroupItem id={EVENT_COUNT_KEY}>Events</ButtonGroupItem>
          <ButtonGroupItem id={USER_COUNT_KEY}>Users</ButtonGroupItem>
        </ButtonGroup>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart
            data={chartData ?? []}
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
              ticks={selectEvenlySpacedItems(chartData ?? [], 3).map(
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
