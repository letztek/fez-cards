import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CardGrid } from './CardGrid';
import { BattleAreaNew } from './BattleAreaNew';
import { Button } from './Button';
import { Card as CardType, BattleResult } from '../types/card';

interface GameBoardProps {
  playerHand: CardType[];
  computerHand: CardType[];
  playerScore: number;
  computerScore: number;
  currentRound: number;
  maxRounds: number;
  selectedCard?: CardType;
  battleResult?: BattleResult;
  onCardSelect: (card: CardType) => void;
  onBattleConfirm: () => void;
  onNextRound: () => void;
  onExitGame?: () => void;
  isProcessing?: boolean;
  className?: string;
  battlePhase?: 'waiting' | 'player-selected' | 'computer-thinking' | 'computer-reveal' | 'result';
  onComputerRevealComplete?: () => void;
  pendingComputerCard?: CardType;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  playerHand,
  computerHand,
  playerScore,
  computerScore,
  currentRound,
  maxRounds,
  selectedCard,
  battleResult,
  onCardSelect,
  onBattleConfirm,
  onNextRound,
  onExitGame,
  isProcessing = false,
  className = '',
  battlePhase = 'waiting',
  onComputerRevealComplete,
  pendingComputerCard
}) => {
  const { t } = useTranslation();
  const [isBattleAnimating, setIsBattleAnimating] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 監聽視窗大小變化，使用更精確的偵測
  useEffect(() => {
    const handleResize = () => {
      const newSize = { width: window.innerWidth, height: window.innerHeight };
      setScreenSize(newSize);
      
      // 更細緻的響應式邏輯
      // 針對13吋MacBook (1440x900 或 1280x800) 特別優化
      // 考慮可用高度確保卡牌完整顯示 (6張卡牌 2x3 佈局)
      const minHeightFor2x3Layout = 900; // 提高最小高度要求
      const minWidthFor3Cols = 1200; // 調整寬度閾值
      
      // 特別處理 MacBook 13吋的常見解析度
      const isMacBook13 = (newSize.width === 1440 && newSize.height === 900) || 
                          (newSize.width === 1280 && newSize.height === 800) ||
                          (newSize.width < 1440 && newSize.height < 900);
      
      const shouldCompact = newSize.width < minWidthFor3Cols || newSize.height < minHeightFor2x3Layout || isMacBook13;
      setIsCompact(shouldCompact);
    };

    // 使用 ResizeObserver 如果可用，否則回退到 window resize
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(document.body);
      return () => resizeObserver.disconnect();
    } else {
      window.addEventListener('resize', handleResize);
      handleResize(); // 初始檢查
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleBattleConfirm = async () => {
    if (!selectedCard || isProcessing) return;
    
    setIsBattleAnimating(true);
    try {
      await onBattleConfirm();
    } finally {
      // Animation will be handled by battle result display
      setTimeout(() => setIsBattleAnimating(false), 1000);
    }
  };

  const handleNextRound = () => {
    setIsBattleAnimating(false);
    onNextRound();
  };

  // 修復按鈕顯示邏輯：處理過程中也要顯示按鈕
  const canBattle = selectedCard && !battleResult;
  const canContinue = battleResult && !isProcessing;

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Game Header */}
      <motion.div
        className={`relative flex justify-between items-center ${isCompact ? 'p-2 mb-3' : 'p-4 mb-6'} bg-slate-800/50 backdrop-blur-sm rounded-lg`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Exit Button */}
        {onExitGame && (
          <button
            onClick={onExitGame}
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl transition-colors z-10"
            title={t('game.backToMenu')}
            aria-label={t('game.backToMenu')}
          >
            ×
          </button>
        )}
        
        {/* Compact Mode Toggle */}
        <button
          onClick={() => setIsCompact(!isCompact)}
          className="absolute top-2 right-10 text-gray-400 hover:text-white text-lg transition-colors z-10"
          title={isCompact ? '展開視圖' : '精簡視圖'}
          aria-label={isCompact ? '展開視圖' : '精簡視圖'}
        >
          {isCompact ? '📖' : '📑'}
        </button>
        <div className="text-center">
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-blue-400`}>{t('game.playerScore', { score: '' }).split(':')[0]}</div>
          <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold text-white`}>{playerScore}</div>
          <div className="text-xs text-white/60">{playerHand.length} {t('cards', { count: playerHand.length, defaultValue: '張卡牌' })}</div>
        </div>

        <div className="text-center">
          <div className={`${isCompact ? 'text-sm mb-0' : 'text-lg mb-1'} font-semibold text-white`}>
            {t('game.round', { current: currentRound, total: maxRounds })}
          </div>
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-white/70`}>
            {battleResult ? t('battle.battleEnd', { defaultValue: '戰鬥結束' }) : selectedCard ? t('battle.cardSelected', { defaultValue: '已選擇卡牌' }) : t('game.selectCard')}
          </div>
        </div>

        <div className="text-center">
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-red-400`}>{t('game.computerScore', { score: '' }).split(':')[0]}</div>
          <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold text-white`}>{computerScore}</div>
          <div className="text-xs text-white/60">{computerHand.length} {t('cards', { count: computerHand.length, defaultValue: '張卡牌' })}</div>
        </div>
      </motion.div>

      {/* Desktop Layout - 確保卡牌有足夠空間 */}
      <div className={`hidden lg:flex ${isCompact ? 'lg:gap-2 lg:h-[calc(100vh-100px)]' : 'lg:gap-4 lg:h-[calc(100vh-200px)]'}`}>
        {/* Player Hand - Left */}
        <motion.div
          className="lg:w-1/3 flex flex-col min-h-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardGrid
            title={t('game.selectCard')}
            cards={playerHand}
            onCardClick={onCardSelect}
            selectedCardId={selectedCard?.id}
            disabledCardIds={battleResult ? playerHand.map(card => card.id) : []}
            cardSize={isCompact ? "small" : "medium"}
            maxCardsPerRow={isCompact ? 3 : 2}
            className="flex-1"
          />
        </motion.div>

        {/* Battle Area - Center */}
        <motion.div
          className="lg:w-1/3 flex flex-col justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BattleAreaNew
            playerCard={selectedCard}
            computerCard={battleResult?.computerCard}
            result={battleResult}
            isAnimating={isBattleAnimating}
            onAnimationComplete={() => setIsBattleAnimating(false)}
            battlePhase={battlePhase}
            onComputerRevealComplete={onComputerRevealComplete}
            pendingComputerCard={pendingComputerCard}
            className="mb-4"
          />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            {canBattle && (
              <Button
                onClick={handleBattleConfirm}
                variant="primary"
                loading={isProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? t('game.processing') : t('game.confirmBattle')}
              </Button>
            )}

            {canContinue && (
              <Button
                onClick={handleNextRound}
                variant="success"
                disabled={!canContinue}
              >
                {t('game.nextRound')}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Computer Hand - Right */}
        <motion.div
          className="lg:w-1/3 flex flex-col min-h-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardGrid
            title={t('game.computerScore', { score: '' }).split(':')[0]}
            cards={computerHand}
            showBacks={true}
            cardSize={isCompact ? "small" : "medium"}
            maxCardsPerRow={isCompact ? 3 : 2}
            className="flex-1"
          />
        </motion.div>
      </div>

      {/* Mobile/Tablet Layout - Vertical Stack */}
      <div className="lg:hidden space-y-4">
        {/* Computer Hand - Top */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardGrid
            title={t('game.computerScore', { score: '' }).split(':')[0]}
            cards={computerHand}
            showBacks={true}
            cardSize="small"
            maxCardsPerRow={screenSize.width < 640 ? 2 : 3}
          />
        </motion.div>

        {/* Battle Area - Middle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BattleAreaNew
            playerCard={selectedCard}
            computerCard={battleResult?.computerCard}
            result={battleResult}
            isAnimating={isBattleAnimating}
            onAnimationComplete={() => setIsBattleAnimating(false)}
            battlePhase={battlePhase}
            onComputerRevealComplete={onComputerRevealComplete}
            pendingComputerCard={pendingComputerCard}
            className="mb-4"
          />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            {canBattle && (
              <Button
                onClick={handleBattleConfirm}
                variant="primary"
                loading={isProcessing}
                disabled={isProcessing}
                size="large"
              >
                {isProcessing ? t('game.processing') : t('game.confirmBattle')}
              </Button>
            )}

            {canContinue && (
              <Button
                onClick={handleNextRound}
                variant="success"
                disabled={!canContinue}
                size="large"
              >
                {t('game.nextRound')}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Player Hand - Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardGrid
            title={t('game.selectCard')}
            cards={playerHand}
            onCardClick={onCardSelect}
            selectedCardId={selectedCard?.id}
            disabledCardIds={battleResult ? playerHand.map(card => card.id) : []}
            cardSize="small"
            maxCardsPerRow={screenSize.width < 640 ? 2 : 3}
          />
        </motion.div>
      </div>
    </div>
  );
};