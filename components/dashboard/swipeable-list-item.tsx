"use client";

import React, { useState } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onClick?: () => void;
  className?: string;
}

export function SwipeableListItem({
  children,
  onDelete,
  onClick,
  className,
}: SwipeableListItemProps) {
  const controls = useAnimation();
  const [isDeleting, setIsDeleting] = useState(false);
  const swipeThreshold = -80; // Distance to trigger action

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < swipeThreshold) {
      // Swiped far enough to delete
      setIsDeleting(true);
      await controls.start({ x: -1000, transition: { duration: 0.3 } });
      onDelete();
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
    }
  };

  return (
    <div className={cn("relative w-full overflow-hidden rounded-[16px] mb-4 bg-[var(--destructive)]", className)}>
      {/* Background Actions (Delete Zone) */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end px-6 w-full">
        <div className="flex flex-col items-center text-white">
          <Trash className="size-6 mb-1" />
          <span className="text-xs font-semibold uppercase tracking-wider">Delete</span>
        </div>
      </div>

      {/* Foreground Content */}
      <motion.div
        className="relative z-10 w-full bg-card cursor-pointer border border-border rounded-[16px] shadow-[var(--shadow-subtle)] active:bg-muted transition-colors"
        drag="x"
        dragConstraints={{ left: -1000, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    </div>
  );
}
