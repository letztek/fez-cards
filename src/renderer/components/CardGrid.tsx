import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types/card';
import { useCardLayout } from '../src/hooks/useCardLayout';

interface CardGridProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  selectedCardId?: string;
  disabledCardIds?: string[];
  showBacks?: boolean;
  maxCardsPerRow?: number;
  cardSize?: 'small' | 'medium' | 'large';
  className?: string;
  title?: string;
}

const CardGridComponent: React.FC<CardGridProps> = ({
  cards,
  onCardClick,
  selectedCardId,
  disabledCardIds = [],
  showBacks = false,
  maxCardsPerRow,
  cardSize = 'medium',
  className = '',
  title
}) => {
  const { t } = useTranslation();
  
  // 計算預設每行卡牌數
  const defaultMaxCardsPerRow = useMemo(() => {
    if (maxCardsPerRow) return maxCardsPerRow;
    
    // Auto-calculate based on card count
    if (cards.length <= 2) return cards.length;
    if (cards.length <= 4) return 2;
    if (cards.length <= 6) return 3;
    if (cards.length <= 9) return 3;
    return 4;
  }, [maxCardsPerRow, cards.length]);

  // 使用動態佈局 hook
  const { containerRef, layout } = useCardLayout({
    cardCount: cards.length,
    maxCardsPerRow: defaultMaxCardsPerRow,
    containerPadding: 12, // 減少 padding
    cardGap: 12, // 減少間距
    minCardWidth: cardSize === 'small' ? 70 : cardSize === 'large' ? 160 : 100, // 調整最小尺寸
    maxCardWidth: cardSize === 'small' ? 100 : cardSize === 'large' ? 200 : 150 // 調整最大尺寸
  });
  
  const getCardState = (card: CardType) => {
    if (disabledCardIds.includes(card.id)) return 'disabled';
    if (selectedCardId === card.id) return 'selected';
    return 'idle';
  };

  const handleCardClick = (card: CardType) => {
    if (onCardClick && !disabledCardIds.includes(card.id)) {
      onCardClick(card);
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      {title && (
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white/90">{title}</h3>
          <div className="text-sm text-white/60">
            {cards.length} {t('cardUnit', { defaultValue: '張卡牌' })}
          </div>
        </div>
      )}

      <motion.div
        className="grid justify-items-center"
        style={{
          gridTemplateColumns: `repeat(${layout.gridCols}, minmax(0, 1fr))`,
          gap: '12px'
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={index}
            >
              <CardComponent
                card={card}
                size={cardSize}
                dynamicSize={layout.cardSize}
                state={getCardState(card)}
                onClick={() => handleCardClick(card)}
                showBack={showBacks}
                className="transform-gpu"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {cards.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-4xl mb-2">🃏</div>
          <div className="text-white/60">
            {title ? `${title}是空的` : '沒有卡牌'}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const CardGrid = memo(CardGridComponent);

// Responsive card grid with auto-sizing
export const ResponsiveCardGrid: React.FC<CardGridProps> = (props) => {
  return (
    <div className="w-full">
      {/* Desktop layout */}
      <div className="hidden lg:block">
        <CardGrid {...props} cardSize="large" />
      </div>
      
      {/* Tablet layout */}
      <div className="hidden md:block lg:hidden">
        <CardGrid {...props} cardSize="medium" maxCardsPerRow={4} />
      </div>
      
      {/* Mobile layout */}
      <div className="block md:hidden">
        <CardGrid {...props} cardSize="small" maxCardsPerRow={2} />
      </div>
    </div>
  );
};