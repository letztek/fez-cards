import React, { useState, useEffect } from 'react';
import { Card as CardType, CardClass } from '../types/card';

interface FlipCardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  isFlipped?: boolean;
  onFlipComplete?: () => void;
  className?: string;
  autoFlip?: boolean;
  flipDelay?: number; // 延遲翻轉時間 (ms)
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

export const FlipCard: React.FC<FlipCardProps> = ({
  card,
  size = 'medium',
  isFlipped = false,
  onFlipComplete,
  className = '',
  autoFlip = false,
  flipDelay = 0
}) => {
  const [isFlippedState, setIsFlippedState] = useState(isFlipped);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cardSize = CARD_SIZES[size];
  const cardStyle = CARD_CLASSES[card.class];

  // 自動翻轉邏輯
  useEffect(() => {
    if (autoFlip && !isFlippedState) {
      const timer = setTimeout(() => {
        // console.log(`🎴 電腦卡牌開始翻轉: ${card.name}`);
        setIsFlippedState(true);
        
        // 翻轉動畫完成後的回調
        const completeTimer = setTimeout(() => {
          // console.log(`✨ 電腦卡牌翻轉完成: ${card.name}`);
          onFlipComplete?.();
        }, 1000); // CSS transition 時間

        return () => clearTimeout(completeTimer);
      }, flipDelay);

      return () => clearTimeout(timer);
    }
  }, [autoFlip, isFlippedState, flipDelay, onFlipComplete, card.name]);

  // 外部控制翻轉
  useEffect(() => {
    setIsFlippedState(isFlipped);
  }, [isFlipped]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    // console.error(`Failed to load card image: ${card.imageUrl}`);
  };

  return (
    <div
      className={`flip-card-container ${className}`}
      style={{
        width: cardSize.width,
        height: cardSize.height,
        perspective: '1000px'
      }}
    >
      {/* 3D 翻轉容器 */}
      <div
        className="flip-card-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 1s ease-in-out',
          transform: isFlippedState ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 卡牌背面 */}
        <div
          className="flip-card-back"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <img
            src={card.backImageUrl}
            alt="Card Back"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // console.error('Failed to load card back image:', card.backImageUrl);
              // 如果背面圖片載入失敗，顯示預設背面
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* 預設背面 fallback */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, #374151, #1f2937)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: -1,
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
              <div style={{ fontSize: size === 'large' ? '24px' : size === 'medium' ? '16px' : '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                FEZ
              </div>
              <div style={{ fontSize: size === 'large' ? '10px' : size === 'medium' ? '8px' : '6px' }}>
                CARD GAME
              </div>
            </div>
          </div>
        </div>

        {/* 卡牌正面 */}
        <div
          className="flip-card-front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <div
            className={`
              w-full h-full
              rounded-lg border-2 ${cardStyle.border}
              bg-gradient-to-b ${cardStyle.bg}
              shadow-lg
            `}
          >
            {/* 卡牌圖片 */}
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

            {/* 卡牌信息 */}
            <div className="relative h-1/5 p-2 bg-black/30 backdrop-blur-sm">
              <div className="text-white text-center">
                <div 
                  className="font-bold text-sm truncate" 
                  title={card.name}
                  style={{ fontSize: size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px' }}
                >
                  {card.name}
                </div>
                <div 
                  className="text-xs text-white/80 mt-1"
                  style={{ fontSize: size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px' }}
                >
                  {card.class === CardClass.WARRIOR && '⚔️ 戰士'}
                  {card.class === CardClass.MAGE && '🔮 法師'}
                  {card.class === CardClass.RANGER && '🏹 遊俠'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};