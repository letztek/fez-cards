import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  message?: string;
}

const SPINNER_SIZES = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  message
}) => {
  const sizeClass = SPINNER_SIZES[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`
          ${sizeClass}
          border-3 border-blue-500 border-t-transparent rounded-full
        `}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {message && (
        <motion.p
          className="mt-2 text-white/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};