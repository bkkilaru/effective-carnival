import cn from "@/lib/cn";
import { motion, useInView } from "framer-motion";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export default function AnimatingTitle({
  word,
  className,
}: {
  word: string;
  className?: string;
}) {
  const allLetters = word.split("");
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const staggerChildren = 0.08;
  const ref = useRef(null);
  const isInView = useInView(ref);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0,
      },
    },
  };

  const handleNextLetter = useCallback(() => {
    const nextLetter = allLetters[currentLetters.length];
    if (nextLetter) {
      setCurrentLetters([...currentLetters, nextLetter]);
    }
  }, [allLetters, currentLetters]);

  useEffect(() => {
    if (isInView) {
      const nextTimeout = _.random(60, 200);
      const timeout = setTimeout(() => {
        handleNextLetter();
      }, nextTimeout);

      return () => clearTimeout(timeout);
    }
  }, [handleNextLetter, isInView]);

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate="show"
      className={cn("flex text-3xl font-black", className)}
    >
      {currentLetters.map((letter, i) => (
        <motion.div key={i} variants={item}>
          {letter}
        </motion.div>
      ))}
      <motion.div
        className="h-[32px] w-[20px] bg-slate-300"
        animate={{ opacity: [null, 1, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          times: [0, 0.5, 0.5],
          ease: () => 1,
        }}
      />
    </motion.div>
  );
}
