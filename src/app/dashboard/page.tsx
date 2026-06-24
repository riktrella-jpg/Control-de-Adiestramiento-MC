"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useAppState } from "@/context/app-state-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { StatsRow } from "@/components/dashboard/stats-row";

// Dynamic imports for heavy components
const PlannerCard = dynamic(
  () => import("@/components/dashboard/planner-card").then((mod) => mod.PlannerCard),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }} /> }
);

const DogProfileCard = dynamic(
  () => import("@/components/dashboard/dog-profile-card").then((mod) => mod.DogProfileCard),
  { loading: () => <Skeleton className="h-[260px] w-full rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }} /> }
);

const PerformanceChartsCard = dynamic(
  () => import("@/components/dashboard/performance-charts-card").then((mod) => mod.PerformanceChartsCard),
  {
    loading: () => <Skeleton className="h-[280px] w-full rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }} />,
    ssr: false,
  }
);

const ActiveCoursesCard = dynamic(
  () => import("@/components/dashboard/active-courses-card").then((mod) => mod.ActiveCoursesCard),
  {
    loading: () => <Skeleton className="h-[220px] w-full rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }} />,
    ssr: false,
  }
);

const AchievementsCard = dynamic(
  () => import("@/components/dashboard/achievements-card").then((mod) => mod.AchievementsCard),
  {
    loading: () => <Skeleton className="h-[220px] w-full rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }} />,
    ssr: false,
  }
);

import { QuickActions } from "@/components/dashboard/quick-actions";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function DashboardPage() {
  const { selectedPet, userProfile } = useAppState();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <motion.div
      className="flex flex-col gap-6 px-4 pt-5 pb-8 max-w-2xl mx-auto w-full lg:max-w-none lg:grid lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ═══════════════════════════════════════════════════
          COLUMN 1 — MOBILE: stacked, LG: first 5 cols
          ═══════════════════════════════════════════════════ */}
      <div className="lg:col-span-5 flex flex-col gap-6">

        {/* Welcome text — mobile only */}
        <motion.div variants={fadeUp} className="lg:hidden space-y-0.5">
          <p className="text-white/40 text-sm font-medium">
            {greeting},{" "}
            <span className="text-white font-black">
              {userProfile?.displayName?.split(" ")[0] || "Entrenador"}
            </span>
          </p>
          <p
            className="text-xs font-bold"
            style={{ color: "#10B981" }}
          >
            Hoy es un gran día para entrenar con{" "}
            <span className="font-black">
              {selectedPet?.name || "tu binomio"}
            </span>{" "}
            🐾
          </p>
        </motion.div>

        {/* Hero: Dog Profile Card */}
        <motion.div variants={fadeUp}>
          <DogProfileCard />
        </motion.div>

        {/* Stats KPI Row */}
        <motion.div variants={fadeUp}>
          <StatsRow />
        </motion.div>

        {/* Quick Actions 2×2 */}
        <motion.div variants={fadeUp}>
          <QuickActions />
        </motion.div>

        {/* Performance Charts (desktop: col 1, mobile: after quick actions) */}
        <motion.div variants={fadeUp} className="lg:block">
          <PerformanceChartsCard />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════
          COLUMN 2 — LG: middle 4 cols
          ═══════════════════════════════════════════════════ */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* Active Courses — Netflix Scroll */}
        <motion.div variants={fadeUp}>
          <ActiveCoursesCard />
        </motion.div>

        {/* Planner AI Card */}
        <motion.div variants={fadeUp}>
          <PlannerCard />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════
          COLUMN 3 — LG: last 3 cols
          ═══════════════════════════════════════════════════ */}
      <div className="lg:col-span-3 flex flex-col gap-6">

        {/* Achievements & Medals */}
        <motion.div variants={fadeUp}>
          <AchievementsCard />
        </motion.div>

        {/* Motivational quote */}
        <motion.div
          variants={fadeUp}
          className="rounded-[2rem] p-5 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(212,175,55,0.04) 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="text-2xl mb-3">🐾</div>
          <p
            className="text-xs font-bold leading-relaxed italic"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            "No entrenamos perros. Creamos compañías que sanan y cambian vidas."
          </p>
          <div
            className="mt-3 text-[9px] font-black uppercase tracking-[0.2em]"
            style={{ color: "#10B981" }}
          >
            — Manada Club
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
