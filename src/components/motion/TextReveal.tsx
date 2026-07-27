"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  animate?: boolean;
}

export function TextReveal({
  text,
  className,
  as = "h1",
  delay = 0,
  animate = true,
}: TextRevealProps) {
  const words = text.split(" ");
  const Component = motion[as];

  if (!animate) {
    const Static = as;
    return <Static className={className}>{text}</Static>;
  }

  return (
    <Component
      className={cn(className)}
      variants={staggerContainer(0.06, delay)}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={staggerItem}
          className="mr-[0.28em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
}
