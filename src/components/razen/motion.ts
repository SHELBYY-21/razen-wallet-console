import type { Transition, Variants } from "motion/react";

/** Matches --ease-enter in styles.css */
export const enterEase: Transition = {
  duration: 0.42,
  ease: [0.16, 1, 0.3, 1],
};

export const exitEase: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 1, 1],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: enterEase },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
