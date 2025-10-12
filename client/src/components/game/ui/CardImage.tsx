import React, { useState } from "react";
import { motion } from "framer-motion";
import { isXR } from "../../../utils/xr";

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  className = "",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const isSpatial = isXR;

  const handleLoadStart = () => {
    setHasStartedLoading(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative w-full h-full">
      {/* Background glow that appears immediately */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 0 : hasStartedLoading ? [0.4, 0.2, 0.4] : 0,
          background: [
            "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.05))",
            "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.2), transparent)",
            "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.05))",
          ],
        }}
        transition={{
          duration: 0.25,
          repeat: isLoaded ? 0 : Infinity,
          ease: "linear",
        }}
        style={{
          boxShadow: "inset 0 0 30px rgba(239, 68, 68, 0.4)",
        }}
      />

      {/* Scanning line effect */}
      {hasStartedLoading && !isLoaded && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: "linear" }}
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(239, 68, 68, 0.7) 1px,
              rgba(239, 68, 68, 0.7) 3px
            )`,
            mixBlendMode: "screen",
          }}
        >
          <motion.div
            className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
            initial={{ y: "0%" }}
            animate={{ y: "100vh" }}
            transition={{
              duration: 2.5,
              ease: "linear",
            }}
            style={{
              filter: "blur(2px)",
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
            }}
          />
        </motion.div>
      )}

      {/* The actual image with reveal animation */}
      <motion.img
        src={src}
        alt={alt}
        className={className}
        loading="eager"
        decoding="async"
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        initial={
          isSpatial
            ? {
                opacity: 0,
              }
            : {
                opacity: 0,
                clipPath: "inset(0 0 100% 0)",
                filter: "brightness(0.3) drop-shadow(0 0 20px #ef4444)",
                scale: 0.98,
              }
        }
        animate={
          isSpatial
            ? isLoaded
              ? { opacity: 1 }
              : { opacity: 0 }
            : isLoaded
            ? {
                opacity: 1,
                clipPath: "inset(0 0 0% 0)",
                filter: "brightness(1) drop-shadow(0 0 0 transparent)",
                scale: 1,
              }
            : {
                opacity: 1,
                clipPath: "inset(0 0 100% 0)",
                filter: "brightness(0.3) drop-shadow(0 0 20px #ef4444)",
                scale: 0.98,
              }
        }
        transition={
          isSpatial
            ? {
                duration: 0.3,
                ease: "linear",
              }
            : {
                duration: 2.5,
                ease: "linear",
                clipPath: { duration: 2.5, ease: "linear" },
                filter: { duration: 2.5, ease: "linear" },
                scale: { duration: 2.5, ease: "easeOut" },
              }
        }
      />
    </div>
  );
};
