"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@havenly/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@havenly/ui/components/chart";
import { Badge } from "@havenly/ui/components/badge";
import { TrendingUp, CheckCircle2, Home } from "lucide-react";

interface MonthlyData {
  month: string;
  collected: number;
  invoiced: number;
}

interface OverviewChartsProps {
  monthlyData: MonthlyData[];
  occupiedCount: number;
  vacantCount: number;
  totalHomes: number;
  totalCollected: number;
}

const revenueChartConfig = {
  collected: {
    label: "Collected (KES)",
    color: "var(--primary)",
  },
  invoiced: {
    label: "Invoiced (KES)",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

const occupancyChartConfig = {
  occupied: {
    label: "Occupied",
    color: "var(--primary)",
  },
  vacant: {
    label: "Vacant",
    color: "var(--muted)",
  },
} satisfies ChartConfig;

export function OverviewCharts({
  monthlyData,
  occupiedCount,
  vacantCount,
  totalHomes,
  totalCollected,
}: OverviewChartsProps) {
  const occupancyRate = totalHomes > 0 ? Math.round((occupiedCount / totalHomes) * 100) : 0;

  const occupancyPieData = [
    { name: "Occupied", value: occupiedCount, fill: "hsl(var(--primary))" },
    { name: "Vacant", value: vacantCount, fill: "hsl(var(--muted-foreground) / 0.3)" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-7">
      {/* Revenue & Collections Trend Chart */}
      <Card className="border-border shadow-xs lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Collection & Revenue Flow
            </CardTitle>
            <CardDescription className="text-sm">
              Monthly rent billed vs. collected across your portfolio
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 text-xs font-medium">
            <TrendingUp className="size-3 text-emerald-500" />
            Live data
          </Badge>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartContainer config={revenueChartConfig} className="aspect-auto h-[260px] w-full">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `KSh ${(val / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#fillCollected)"
              />
              <Area
                type="monotone"
                dataKey="invoiced"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ChartContainer>
          <div className="border-border/50 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-primary size-2.5 rounded-full" />
              <span>Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="border-muted-foreground size-2.5 rounded-full border border-dashed" />
              <span>Invoiced</span>
            </div>
            <span className="text-foreground font-medium">
              Total: KSh {totalCollected.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Distribution Donut Chart */}
      <Card className="border-border flex flex-col shadow-xs lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold tracking-tight">Occupancy Rate</CardTitle>
          <CardDescription className="text-sm">
            Current occupancy status across all {totalHomes} units
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between pt-2">
          <div className="relative flex items-center justify-center">
            <ChartContainer
              config={occupancyChartConfig}
              className="mx-auto aspect-square max-h-[200px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={occupancyPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {occupancyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Centered Donut Stat */}
            <div className="pointer-events-none absolute flex flex-col items-center justify-center">
              <span className="text-foreground text-3xl font-bold tracking-tight">
                {occupancyRate}%
              </span>
              <span className="text-muted-foreground text-xs font-medium">Occupied</span>
            </div>
          </div>

          <div className="border-border/50 mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-center">
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <CheckCircle2 className="text-primary size-3" /> Occupied
              </p>
              <p className="text-foreground mt-1 text-lg font-semibold">{occupiedCount}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <Home className="text-muted-foreground size-3" /> Vacant
              </p>
              <p className="text-foreground mt-1 text-lg font-semibold">{vacantCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
