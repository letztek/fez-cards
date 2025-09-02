import { useEffect } from 'react';

export interface KeyboardShortcuts {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onNumber?: (num: number) => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
}

/**
 * 鍵盤快捷鍵 Hook
 */
export const useKeyboard = (shortcuts: KeyboardShortcuts, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 防止在輸入框中觸發快捷鍵
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          shortcuts.onEscape?.();
          break;
        
        case 'Enter':
          event.preventDefault();
          shortcuts.onEnter?.();
          break;
        
        case ' ':
          event.preventDefault();
          shortcuts.onSpace?.();
          break;
        
        case 'ArrowLeft':
          event.preventDefault();
          shortcuts.onArrowLeft?.();
          break;
        
        case 'ArrowRight':
          event.preventDefault();
          shortcuts.onArrowRight?.();
          break;
        
        case 'ArrowUp':
          event.preventDefault();
          shortcuts.onArrowUp?.();
          break;
        
        case 'ArrowDown':
          event.preventDefault();
          shortcuts.onArrowDown?.();
          break;
        
        default:
          // 數字鍵 1-9
          if (event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            const num = parseInt(event.key);
            shortcuts.onNumber?.(num);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
};

/**
 * 遊戲專用快捷鍵 Hook
 */
export const useGameKeyboard = (
  onCardSelect: (index: number) => void,
  onConfirmBattle: () => void,
  onNextRound: () => void,
  onEscape: () => void,
  gamePhase: string,
  enabled: boolean = true
) => {
  useKeyboard({
    onNumber: (num) => {
      if (gamePhase === 'playing' && num >= 1 && num <= 6) {
        onCardSelect(num - 1); // 轉換為 0-based index
      }
    },
    onEnter: () => {
      if (gamePhase === 'playing') {
        onConfirmBattle();
      } else if (gamePhase === 'battle') {
        onNextRound();
      }
    },
    onSpace: () => {
      if (gamePhase === 'playing') {
        onConfirmBattle();
      } else if (gamePhase === 'battle') {
        onNextRound();
      }
    },
    onEscape: onEscape
  }, enabled);
};