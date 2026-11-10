"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, scaleIn, slideInLeft, slideInRight, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealVariant = "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight";

const variantMap = {
  fadeUp,
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.55 } } },
  scaleIn,
  slideLeft: slideInLeft,
  slideRight: slideInRight,
};

interface RevealProps extends HTMLMotionProps<"div"> {
  variant?: RevealVariant;
  delay?: number;
}

export function Reveal({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  ...props
}: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variantMap[variant]}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
