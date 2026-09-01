import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { baht } from "@/lib/razen/format";

export type FlowPoint = { day: number; label: string; inn: number; out: number };

export function FlowChart({ data }: { data: FlowPoint[] }) {
  const gid = useId().replace(/:/g, "");
  const empty = data.every((d) => d.inn === 0 && d.out === 0);
  const max = Math.max(1, ...data.flatMap((d) => [d.inn, d.out]));

  return (
    <div className="relative h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`in-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity={0.55} />
              <stop offset="70%" stopColor="var(--color-in)" stopOpacity={0.08} />
              <stop offset="100%" stopColor="var(--color-in)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`out-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-line)" vertical={false} strokeDasharray="3 10" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={52}
            domain={[0, Math.ceil(max * 1.15)]}
            tick={{ fill: "var(--color-subtle)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              if (!v) return "0";
              if (v >= 100_000) return `${Math.round(v / 1000)}k`;
              if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
              return String(Math.round(v));
            }}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-cyan)", strokeOpacity: 0.35 }}
            contentStyle={{
              background: "#0e1612",
              border: "1px solid rgba(198,161,91,.35)",
              borderRadius: 10,
              fontSize: 12,
              color: "#eef3f2",
            }}
            formatter={(value, name) => [
              baht(Number(value ?? 0)),
              name === "inn" ? "เข้า" : "ออก",
            ]}
            labelFormatter={(label) => `วัน${label}`}
          />
          <Area
            type="natural"
            dataKey="inn"
            name="inn"
            stroke="var(--color-cyan)"
            fill={`url(#in-${gid})`}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "var(--color-cyan)", stroke: "#06090c", strokeWidth: 2 }}
          />
          <Area
            type="natural"
            dataKey="out"
            name="out"
            stroke="var(--color-brand)"
            fill={`url(#out-${gid})`}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "var(--color-brand)", stroke: "#06090c", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {empty && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-subtle">
          ยังไม่มีรายการใน 7 วันนี้ — ซิงก์ประวัติวอลเล็ต
        </p>
      )}
    </div>
  );
}
