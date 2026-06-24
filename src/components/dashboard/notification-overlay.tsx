
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Flame,
  MessageSquare,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

import { createClient } from "@/supabase/client";
import { useUser } from "@/hooks/use-user";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: "feedback" | "engagement" | "achievement" | "info";
  created_at: string;
  metadata?: {
    suggestedTasks?: string[];
    level?: "3_days" | "15_days";
  };
}

export function NotificationOverlay() {
  const { user } = useUser();

  const supabase = useMemo(() => createClient(), []);

  const [activeToast, setActiveToast] =
    useState<Notification | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-overlay")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          setActiveToast(newNotification);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            setActiveToast(null);
          }, 6000);
        }
      )
      .subscribe();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const closeNotification = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setActiveToast(null);
  };

  const getOverlayIcon = (
    type: Notification["type"]
  ) => {
    switch (type) {
      case "engagement":
        return (
          <Flame className="h-5 w-5 text-orange-400" />
        );

      case "feedback":
        return (
          <MessageSquare className="h-5 w-5 text-emerald-400" />
        );

      case "achievement":
        return (
          <CheckCircle2 className="h-5 w-5 text-amber-400" />
        );

      default:
        return (
          <Info className="h-5 w-5 text-cyan-400" />
        );
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">

      <AnimatePresence>

        {activeToast && (

          <motion.div
            key={activeToast.id}
            initial={{
              opacity: 0,
              y: -40,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 24,
            }}
            className="
            pointer-events-auto
            relative
            overflow-hidden
            w-full
            rounded-2xl
            border
            border-emerald-500/30
            bg-black/90
            backdrop-blur-xl
            shadow-2xl
            p-4
            flex
            items-start
            gap-3
            "
          >

            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/10 rounded-full blur-3xl" />

            <div className="shrink-0 p-2 rounded-xl border border-white/10 bg-white/5">

              {getOverlayIcon(activeToast.type)}

            </div>

            <div className="flex-1 pr-8">

              <h5 className="text-xs font-black uppercase tracking-widest text-white">

                {activeToast.title}

              </h5>

              <p className="mt-1 text-xs text-gray-300 leading-relaxed">

                {activeToast.message}

              </p>

            </div>

            <button
              type="button"
              onClick={closeNotification}
              aria-label="Cerrar notificación"
              title="Cerrar notificación"
              className="
              absolute
              top-3
              right-3
              p-1.5
              rounded-full
              hover:bg-white/10
              transition-all
              "
            >

              <X className="h-4 w-4 text-white/70 hover:text-white" />

            </button>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}