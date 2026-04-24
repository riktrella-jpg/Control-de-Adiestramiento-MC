"use client";

import dynamic from "next/dynamic";
import { useAppState } from "@/context/app-state-provider";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";

// Dynamic imports for heavy components to improve initial load
const PlannerCard = dynamic(() => import("@/components/dashboard/planner-card").then(mod => mod.PlannerCard), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
});

const ProgressCard = dynamic(() => import("@/components/dashboard/progress-card").then(mod => mod.ProgressCard), {
  loading: () => <Skeleton className="h-[200px] w-full rounded-xl" />,
});

const DogProfileCard = dynamic(() => import("@/components/dashboard/dog-profile-card").then(mod => mod.DogProfileCard), {
  loading: () => <Skeleton className="h-[200px] w-full rounded-xl" />,
});

const PerformanceChartsCard = dynamic(() => import("@/components/dashboard/performance-charts-card").then(mod => mod.PerformanceChartsCard), {
  loading: () => <Skeleton className="h-[350px] w-full rounded-xl" />,
  ssr: false
});

const ActiveCoursesCard = dynamic(() => import("@/components/dashboard/active-courses-card").then(mod => mod.ActiveCoursesCard), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  ssr: false
});

const AchievementsCard = dynamic(() => import("@/components/dashboard/achievements-card").then(mod => mod.AchievementsCard), {
  loading: () => <Skeleton className="h-[250px] w-full rounded-xl" />,
  ssr: false
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
  const { selectedPet } = useAppState();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full transition-all duration-500">
      {/* Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <p className="text-muted-foreground text-lg">
          Es un gran día para entrenar con <span className="text-primary font-semibold">{selectedPet?.name || 'tu binomio'}</span>.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FIRST COLUMN: Profile, Actions & Tasks */}
        <div className="lg:col-span-3 space-y-8">
           <motion.div variants={item}>
              <DogProfileCard />
           </motion.div>
           <motion.div variants={item}>
              <QuickActions />
           </motion.div>
           <motion.div variants={item}>
              <TasksCard />
           </motion.div>
        </div>

        {/* SECOND COLUMN: Main Centerpieces */}
        <div className="lg:col-span-6 space-y-8">
           <motion.div variants={item}>
              <PlannerCard />
           </motion.div>
           <motion.div variants={item}>
              <PerformanceChartsCard />
           </motion.div>
        </div>

        {/* THIRD COLUMN: Progress & Achievements */}
        <div className="lg:col-span-3 space-y-8">
           <motion.div variants={item}>
              <ActiveCoursesCard />
           </motion.div>
           <motion.div variants={item}>
              <AchievementsCard />
           </motion.div>
        </div>
      </div>
    </div>
  );
}
