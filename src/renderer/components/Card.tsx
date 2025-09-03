import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, CardClass } from '../types/card';

interface CardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  state?: 'idle' | 'selected' | 'playing' | 'disabled';
  onClick?: () => void;
  showBack?: boolean;
  className?: string;
}

const CARD_SIZES = {
  small: { width: 80, height: 220 },
  medium: { width: 120, height: 334 },
  large: { width: 160, height: 445 }
};

const CARD_CLASSES = {
  [CardClass.WARRIOR]: {
    bg: 'from-red-900/80 to-red-700/80',
    border: 'border-red-500',
    glow: 'shadow-red-500/30'
  },
  [CardClass.MAGE]: {
    bg: 'from-blue-900/80 to-blue-700/80',
    border: 'border-blue-500',
    glow: 'shadow-blue-500/30'
  },
  [CardClass.RANGER]: {
    bg: 'from-green-900/80 to-green-700/80',
    border: 'border-green-500',
    glow: 'shadow-green-500/30'
  }
};

const CardComponent: React.FC<CardProps> = ({
  card,
  size = 'medium',
  state = 'idle',
  onClick,
  showBack = false,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cardSize = CARD_SIZES[size];
  const cardStyle = CARD_CLASSES[card.class];

  const isClickable = onClick && state !== 'disabled';
  const isSelected = state === 'selected';
  const isPlaying = state === 'playing';

  const cardVariants = {
    idle: {
      scale: 1,
      rotateY: showBack ? 180 : 0,
      z: 0
    },
    hover: {
      scale: 1.05,
      rotateY: showBack ? 180 : 0,
      z: 20,
      transition: { duration: 0.2 }
    },
    selected: {
      scale: 1.1,
      rotateY: showBack ? 180 : 0,
      z: 30,
      transition: { duration: 0.3 }
    },
    playing: {
      scale: 1.2,
      rotateY: showBack ? 180 : 0,
      z: 40,
      transition: { duration: 0.5 }
    },
    disabled: {
      scale: 0.9,
      opacity: 0.5,
      rotateY: showBack ? 180 : 0,
      transition: { duration: 0.2 }
    }
  };

  const handleClick = () => {
    if (isClickable) {
      onClick();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load card image: ${card.imageUrl}`);
  };

  return (
    <motion.div
      className={`
        relative cursor-pointer select-none
        ${isClickable ? 'hover:cursor-pointer' : 'cursor-default'}
        ${className}
      `}
      style={{
        width: cardSize.width,
        height: cardSize.height,
        perspective: '1000px'
      }}
      variants={cardVariants}
      initial="idle"
      animate={
        state === 'playing' ? 'playing' :
          state === 'selected' ? 'selected' :
            state === 'disabled' ? 'disabled' : 'idle'
      }
      whileHover={isClickable && state === 'idle' ? 'hover' : undefined}
      onClick={handleClick}
      whileTap={isClickable ? { scale: 0.95 } : undefined}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`${card.name} - ${card.class} card ${isSelected ? '(selected)' : ''}`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="w-full h-full relative">
        {showBack ? (
          /* Card Back */
          <div
            className={`
              absolute inset-0 w-full h-full
              rounded-lg border-2 border-gray-600
              shadow-lg overflow-hidden
            `}
          >
            <img
              src={card.backImageUrl}
              alt="Card Back"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load card back image:', card.backImageUrl);
                // 如果背面圖片載入失敗，顯示預設背面
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* 預設背面 fallback */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 absolute top-0 left-0 -z-10">
              <div className="text-white/80 text-center p-4">
                <div className="text-2xl font-bold mb-2">FEZ</div>
                <div className="text-sm">CARD GAME</div>
              </div>
            </div>
          </div>
        ) : (
          /* Card Front */
          <div
            className={`
              absolute inset-0 w-full h-full
              rounded-lg border-2 ${cardStyle.border}
              bg-gradient-to-b ${cardStyle.bg}
              shadow-lg overflow-hidden
              ${isSelected || isPlaying ? `shadow-xl ${cardStyle.glow}` : ''}
            `}
          >
            {/* Card Image */}
            <div className="relative w-full h-4/5 bg-gray-800/20">
              {!imageError ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className={`
                  w-full h-full object-contain transition-opacity duration-300
                  ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center text-white/70">
                    <div className="text-2xl mb-2">🃏</div>
                    <div className="text-xs">圖片載入失敗</div>
                  </div>
                </div>
              )}

              {/* Loading placeholder */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
                  <div className="text-white/50 text-sm">載入中...</div>
                </div>
              )}
            </div>

            {/* Card Info */}
            <div className="relative h-1/4 p-2 bg-black/30 backdrop-blur-sm">
              <div className="text-white text-center">
                <div className="font-bold text-sm truncate" title={card.name}>
                  {card.name}
                </div>
                <div className="text-xs text-white/80 mt-1">
                  {card.class === CardClass.WARRIOR && '⚔️ 戰士'}
                  {card.class === CardClass.MAGE && '🔮 法師'}
                  {card.class === CardClass.RANGER && '🏹 遊俠'}
                </div>
              </div>
            </div>

            {/* State Indicators */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">✓</span>
              </div>
            )}

            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-yellow-400"
                animate={{
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            )}

            {state === 'disabled' && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <span className="text-white/70 text-xl">🚫</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

CardComponent.displayName = 'Card';

// 使用 React.memo 優化效能，只在 props 真正改變時重新渲染
export const Card = memo(CardComponent, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.size === nextProps.size &&
    prevProps.state === nextProps.state &&
    prevProps.showBack === nextProps.showBack &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick
  );
});