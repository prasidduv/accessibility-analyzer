import { motion } from "framer-motion";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export function PageTransition({ children }: Props) {
  return (
    <motion.div
      initial={{ x: 70, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -70, opacity: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
