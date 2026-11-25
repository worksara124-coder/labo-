"use client";
import { motion, type HTMLMotionProps } from "framer-motion";

/** Apparition au défilement : fondu + montée. */
export function Reveal({ delay = 0, y = 32, children, ...rest }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Conteneur dont les enfants <RevealItem> apparaissent les uns après les autres. */
export function Stagger({ children, gap = 0.1, ...rest }: HTMLMotionProps<"div"> & { gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
