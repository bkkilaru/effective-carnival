import React from "react";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

interface SequentialAnimationProps {
  children: React.ReactNode;
}

const SequentialAnimation: React.FC<SequentialAnimationProps> = ({
  children,
}) => {
  return (
    <motion.div className="flex flex-wrap justify-center gap-4">
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SequentialAnimation;
