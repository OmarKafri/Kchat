"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function SendMessage() {

  return (
    <div className="h-full flex justify-center items-center bg-gray-800">
      <motion.div
        initial={{ y: 300, scale: 0.1, opacity: 0 }} 
        animate={{ y: 0, scale: 1, opacity: 1 }}     
        transition={{
          duration: 2.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="h-fit w-fit"
      >
        <Image
          src="/images/robot.gif"
          alt="Robot animation"
          width={500}
          height={20}
        />
      </motion.div>
    </div>
  );
}
