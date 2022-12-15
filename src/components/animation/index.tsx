import { motion } from "framer-motion";
import { FC, PropsWithChildren, useId } from "react";

export const TabAnimation: FC<PropsWithChildren> = ({ children }) => {
  const id = useId();
  return <motion.div
    key={id}
    initial={{ x: -20, opacity: 0 }}
    transition={{ ease: "anticipate", duration: 0.3 }}
    exit={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="absolute inset-0">
      {children}
  </motion.div>
}