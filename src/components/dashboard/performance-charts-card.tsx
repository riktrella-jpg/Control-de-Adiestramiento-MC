"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { useAppState } from "@/context/app-state-provider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const weekData = [
  { day: "Lun", value: 45 },
  { day: "Mar", value: 52 },
  { day: "Mié", value: 48 },
  { day: "Jue", value: 61 },
  { day: "Vie", value: 55 },
  { day: "Sáb", value: 67 },
  { day: "Dom", value: 60 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs font-bold"
        style={{
          background: "rgba(8,8,8,0.95)",
          border: "1px solid rgba(16,185,129,0.2)",
          color: "#10B981",
        }}
      >
        {label}: {payload[0].value}%
      </div>
    );
  }
  return null;
};

export function PerformanceChartsCard({ className }: { className?: string }) {
  const { progress } = useAppState();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
      className={cn("rounded-[2rem] overflow-hidden", className)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4" style={{ color: "#10B981" }} />
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              Pulso de Entrenamiento
            </h3>
          </div>
          <p className="text-[10px] font-medium text-white/30">
            Compromiso semanal con tu manada
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase"
          style={{
            background: "rgba(16,185,129,0.1)",
            color: "#10B981",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <TrendingUp className="h-2.5 w-2.5" />
          +12%
        </div>
      </div>

      {/* Progress + Stats row */}
      <div className="px-5 pb-4 flex items-center gap-4">
        {/* Big progress number */}
        <div
          className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl shrink-0"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <span className="text-xl font-black" style={{ color: "#10B981" }}>
            {progress}%
          </span>
          <span className="text-[8px] font-black text-white/30 uppercase tracking-wider">Global</span>
        </div>

        {/* Mini stats */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {[
            { label: "Engagement", value: "Excelente", color: "#D4AF37" },
            { label: "Consistencia", value: "L-M-J-V", color: "#10B981" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <p className="text-[8px] font-black uppercase tracking-wider text-white/30 mb-0.5">
                {stat.label}
              </p>
              <p className="text-[10px] font-black" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-5 h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weekData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)", fontWeight: 700 }}
              dy={8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#emeraldGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
