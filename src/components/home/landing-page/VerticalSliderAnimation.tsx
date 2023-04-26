import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import mysqlLogoPng from "@/public/logos/mysql.png";
import planetscaleLogoPng from "@/public/logos/planetscale.png";
import postgresLogoPng from "@/public/logos/postgres.png";
import supabaseLogoPng from "@/public/logos/supabase.png";

const slideVariants = {
  enter: {
    y: "100%",
    opacity: 0,
  },
  center: {
    y: "0%",
    opacity: 1,
  },
  exit: {
    y: "-100%",
    opacity: 0,
  },
};

interface SlideProps {
  children: React.ReactNode;
}

const Slide: React.FC<SlideProps> = ({ children }) => {
  return (
    <motion.div
      className="absolute flex h-full w-full items-center"
      initial="enter"
      animate="center"
      exit="exit"
      variants={slideVariants}
      custom={1}
      transition={{
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
};

const CONTENT = [
  { image: planetscaleLogoPng, text: "planetscale" },
  { image: postgresLogoPng, text: "postgres" },
  { image: supabaseLogoPng, text: "supabase" },
  { image: mysqlLogoPng, text: "mysql" },
];

const VerticalSliderAnimation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CONTENT.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const slide = CONTENT[currentSlide];

  if (!slide) return null;

  return (
    <div className="relative h-[40px] min-w-[130px] overflow-hidden md:min-w-[160px]">
      <AnimatePresence initial={false} custom={1}>
        <Slide key={currentSlide}>
          <div className="flex items-center space-x-2">
            <Image src={slide.image} alt={slide.text} width={20} />
            <p className="font-medium text-gray-900">{slide.text}</p>
          </div>
        </Slide>
      </AnimatePresence>
    </div>
  );
};

export default VerticalSliderAnimation;
