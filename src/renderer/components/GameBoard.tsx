import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  isProcessing = false,
  className = '',
  battlePhase = 'waiting',
  onComputerRevealComplete,
  pendingComputerCard
}) => {
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
        className="flex justify-between items-center p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="text-sm text-blue-400">玩家</div>
          <div className="text-2xl font-bold text-white">{playerScore}</div>
          <div className="text-xs text-white/60">{playerHand.length} 張卡牌</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">
            第 {currentRound} / {maxRounds} 回合
          </div>
          <div className="text-sm text-white/70">
            {battleResult ? '戰鬥結束' : selectedCard ? '已選擇卡牌' : '選擇卡牌出戰'}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-red-400">電腦</div>
          <div className="text-2xl font-bold text-white">{computerScore}</div>
          <div className="text-xs text-white/60">{computerHand.length} 張卡牌</div>
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
            title="你的手牌"
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
                確認出牌
              </Button>
            )}

            {canContinue && (
              <Button
                onClick={handleNextRound}
                variant="success"
                disabled={!canContinue}
              >
                下一回合
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
            title="電腦手牌"
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
            title="電腦手牌"
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
                確認出牌
              </Button>
            )}

            {canContinue && (
              <Button
                onClick={handleNextRound}
                variant="success"
                disabled={!canContinue}
                size="large"
              >
                下一回合
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
            title="你的手牌"
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