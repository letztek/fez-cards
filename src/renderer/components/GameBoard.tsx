import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const canBattle = selectedCard && !battleResult && !isProcessing;
  const canContinue = battleResult && !isProcessing;

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Game Header */}
      <motion.div
        className="relative flex justify-between items-center p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg mb-6"
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
          >
            ×
          </button>
        )}
        <div className="text-center">
          <div className="text-sm text-blue-400">{t('game.playerScore', { score: '' }).split(':')[0]}</div>
          <div className="text-2xl font-bold text-white">{playerScore}</div>
          <div className="text-xs text-white/60">{playerHand.length} {t('cards', { count: playerHand.length, defaultValue: '張卡牌' })}</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">
            {t('game.round', { current: currentRound, total: maxRounds })}
          </div>
          <div className="text-sm text-white/70">
            {battleResult ? t('battle.battleEnd', { defaultValue: '戰鬥結束' }) : selectedCard ? t('battle.cardSelected', { defaultValue: '已選擇卡牌' }) : t('game.selectCard')}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-red-400">{t('game.computerScore', { score: '' }).split(':')[0]}</div>
          <div className="text-2xl font-bold text-white">{computerScore}</div>
          <div className="text-xs text-white/60">{computerHand.length} {t('cards', { count: computerHand.length, defaultValue: '張卡牌' })}</div>
        </div>
      </motion.div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:gap-6 lg:h-[calc(100vh-200px)]">
        {/* Player Hand - Left */}
        <motion.div
          className="lg:w-1/3 flex flex-col"
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
            cardSize="medium"
            maxCardsPerRow={2}
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
                disabled={!canBattle}
              >
                {t('game.confirmBattle')}
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
          className="lg:w-1/3 flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardGrid
            title={t('game.computerScore', { score: '' }).split(':')[0]}
            cards={computerHand}
            showBacks={true}
            cardSize="medium"
            maxCardsPerRow={2}
            className="flex-1"
          />
        </motion.div>
      </div>

      {/* Mobile/Tablet Layout - Vertical Stack */}
      <div className="lg:hidden space-y-6">
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
            maxCardsPerRow={3}
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
                disabled={!canBattle}
                size="large"
              >
                {t('game.confirmBattle')}
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
            maxCardsPerRow={3}
          />
        </motion.div>
      </div>
    </div>
  );
};