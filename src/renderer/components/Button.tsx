import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/30',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/30'
};

const BUTTON_SIZES = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const buttonClass = BUTTON_VARIANTS[variant];
  const sizeClass = BUTTON_SIZES[size];

  const isDisabled = disabled || loading;

  const buttonVariants = {
    idle: { scale: 1, opacity: 1 },
    hover: { 
      scale: 1.02, 
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 },
    disabled: { 
      opacity: 0.5, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.button
      className={`
        ${buttonClass} ${sizeClass}
        font-semibold rounded-lg shadow-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
        disabled:cursor-not-allowed
        ${variant === 'primary' && 'focus:ring-blue-500'}
        ${variant === 'secondary' && 'focus:ring-gray-500'}
        ${variant === 'danger' && 'focus:ring-red-500'}
        ${variant === 'success' && 'focus:ring-green-500'}
        ${className}
      `}
      variants={buttonVariants}
      initial="idle"
      animate={isDisabled ? 'disabled' : 'idle'}
      whileHover={!isDisabled ? 'hover' : undefined}
      whileTap={!isDisabled ? 'tap' : undefined}
      onClick={onClick}
      disabled={isDisabled}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        <span>{children}</span>
      </div>
    </motion.button>
  );
};