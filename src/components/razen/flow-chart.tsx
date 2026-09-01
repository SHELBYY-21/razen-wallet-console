import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { bahtInt } from "@/lib/razen/format";

type Point = { day: number; label: string; inn: number; out: number };

export function FlowChart({ data }: { data: Point[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="inFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-in)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-in)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="outFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-subtle)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v === 0 ? "0" : `${Math.round(v / 1000)}k`)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value, name) => [
              bahtInt(Number(value ?? 0)),
              name === "inn" ? "เงินเข้า" : "เงินออก",
            ]}
          />
          <Area
            type="monotone"
            dataKey="inn"
            stroke="var(--color-in)"
            fill="url(#inFill)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-in)", strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="out"
            stroke="var(--color-brand)"
            fill="url(#outFill)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-brand)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
