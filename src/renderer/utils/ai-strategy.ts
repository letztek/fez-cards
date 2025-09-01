import { Card, CardClass, AIStrategy, GameContext } from '../types/card';
import { BattleEngine } from './battle-engine';

/**
 * 簡單 AI 策略 - 隨機選擇
 */
export class EasyAI implements AIStrategy {
  difficulty: 'easy' = 'easy';

  selectCard(availableCards: Card[], gameContext: GameContext): Card {
    // 完全隨機選擇
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[randomIndex];
  }
}

/**
 * 普通 AI 策略 - 基礎策略選擇
 */
export class NormalAI implements AIStrategy {
  difficulty: 'normal' = 'normal';

  selectCard(availableCards: Card[], gameContext: GameContext): Card {
    // 如果玩家已經出過牌，嘗試分析模式
    if (gameContext.playerPreviousCards.length > 0) {
      const preferredCard = this.analyzePlayerPattern(availableCards, gameContext);
      if (preferredCard) {
        return preferredCard;
      }
    }

    // 否則選擇平衡的策略
    return this.selectBalancedCard(availableCards);
  }

  private analyzePlayerPattern(availableCards: Card[], gameContext: GameContext): Card | null {
    const recentCards = gameContext.playerPreviousCards.slice(-2); // 看最近兩張牌
    
    if (recentCards.length === 0) return null;

    // 計算玩家最常使用的職業
    const classCount: Record<CardClass, number> = {
      [CardClass.WARRIOR]: 0,
      [CardClass.MAGE]: 0,
      [CardClass.RANGER]: 0
    };

    recentCards.forEach(card => {
      classCount[card.class]++;
    });

    // 找到玩家最常用的職業
    const mostUsedClass = Object.entries(classCount)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as CardClass;

    // 如果玩家有明顯偏好，選擇克制該職業的卡牌
    const counterClass = BattleEngine.getWeakAgainst(mostUsedClass);
    if (counterClass) {
      const counterCard = availableCards.find(card => card.class === counterClass);
      if (counterCard) {
        console.log(`AI Normal: 選擇 ${counterCard.class} 克制玩家常用的 ${mostUsedClass}`);
        return counterCard;
      }
    }

    return null;
  }

  private selectBalancedCard(availableCards: Card[]): Card {
    // 保持職業平衡，避免過度依賴某種職業
    const classCount: Record<CardClass, number> = {
      [CardClass.WARRIOR]: 0,
      [CardClass.MAGE]: 0,
      [CardClass.RANGER]: 0
    };

    availableCards.forEach(card => {
      classCount[card.class]++;
    });

    // 選擇數量最多的職業（保持多樣性）
    const mostAvailableClass = Object.entries(classCount)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as CardClass;

    const cardsOfPreferredClass = availableCards.filter(card => card.class === mostAvailableClass);
    
    return cardsOfPreferredClass[Math.floor(Math.random() * cardsOfPreferredClass.length)];
  }
}

/**
 * 困難 AI 策略 - 進階策略選擇
 */
export class HardAI implements AIStrategy {
  difficulty: 'hard' = 'hard';

  selectCard(availableCards: Card[], gameContext: GameContext): Card {
    // 進階策略：結合多種因素決策
    const strategicCard = this.advancedStrategy(availableCards, gameContext);
    if (strategicCard) {
      return strategicCard;
    }

    // 後備策略
    return this.selectOptimalCard(availableCards, gameContext);
  }

  private advancedStrategy(availableCards: Card[], gameContext: GameContext): Card | null {
    // 如果接近遊戲結束，使用保守策略
    if (gameContext.currentRound >= 5) {
      return this.endgameStrategy(availableCards, gameContext);
    }

    // 如果落後，使用激進策略
    if (gameContext.playerScore > gameContext.computerScore + 1) {
      return this.aggressiveStrategy(availableCards, gameContext);
    }

    // 如果領先，使用防守策略
    if (gameContext.computerScore > gameContext.playerScore) {
      return this.defensiveStrategy(availableCards, gameContext);
    }

    return null;
  }

  private endgameStrategy(availableCards: Card[], gameContext: GameContext): Card | null {
    // 終盤策略：選擇最有可能獲勝的卡牌
    if (gameContext.playerPreviousCards.length > 0) {
      const lastPlayerCard = gameContext.playerPreviousCards[gameContext.playerPreviousCards.length - 1];
      
      // 預測玩家可能的下一步
      const predictedClasses = this.predictPlayerNextMove(gameContext.playerPreviousCards);
      
      // 選擇最能克制預測職業的卡牌
      for (const predictedClass of predictedClasses) {
        const counterClass = BattleEngine.getWeakAgainst(predictedClass);
        if (counterClass) {
          const counterCard = availableCards.find(card => card.class === counterClass);
          if (counterCard) {
            console.log(`AI Hard (Endgame): 預測玩家出 ${predictedClass}，選擇 ${counterCard.class} 克制`);
            return counterCard;
          }
        }
      }
    }

    return null;
  }

  private aggressiveStrategy(availableCards: Card[], gameContext: GameContext): Card | null {
    // 激進策略：主動選擇克制對手的卡牌
    const playerClassFrequency = this.analyzePlayerClassFrequency(gameContext.playerPreviousCards);
    
    // 選擇克制玩家最常用職業的卡牌
    for (const [playerClass, frequency] of playerClassFrequency) {
      const counterClass = BattleEngine.getWeakAgainst(playerClass as CardClass);
      if (counterClass) {
        const counterCards = availableCards.filter(card => card.class === counterClass);
        if (counterCards.length > 0) {
          console.log(`AI Hard (Aggressive): 選擇 ${counterClass} 克制玩家常用的 ${playerClass}`);
          return counterCards[0];
        }
      }
    }

    return null;
  }

  private defensiveStrategy(availableCards: Card[], gameContext: GameContext): Card | null {
    // 防守策略：避免被玩家克制
    const playerRecentCards = gameContext.playerPreviousCards.slice(-3);
    
    if (playerRecentCards.length > 0) {
      // 分析玩家最近的選牌模式，選擇不容易被克制的卡牌
      const dangerousClasses = playerRecentCards.map(card => BattleEngine.getStrongAgainst(card.class))
        .filter(c => c !== null) as CardClass[];

      // 選擇不在危險列表中的卡牌
      const safeCards = availableCards.filter(card => !dangerousClasses.includes(card.class));
      
      if (safeCards.length > 0) {
        console.log(`AI Hard (Defensive): 避免被克制，選擇安全卡牌`);
        return safeCards[Math.floor(Math.random() * safeCards.length)];
      }
    }

    return null;
  }

  private predictPlayerNextMove(playerHistory: Card[]): CardClass[] {
    if (playerHistory.length < 2) {
      return [CardClass.WARRIOR, CardClass.MAGE, CardClass.RANGER]; // 所有可能
    }

    // 簡單的模式識別：檢查玩家是否有重複模式
    const recentClasses = playerHistory.slice(-3).map(card => card.class);
    
    // 檢查是否有循環模式
    if (recentClasses.length >= 2) {
      const pattern = recentClasses.slice(-2);
      // 如果檢測到模式，預測下一個
      if (pattern[0] === CardClass.WARRIOR && pattern[1] === CardClass.MAGE) {
        return [CardClass.RANGER]; // 預測玩家會出遊俠完成循環
      }
      if (pattern[0] === CardClass.MAGE && pattern[1] === CardClass.RANGER) {
        return [CardClass.WARRIOR];
      }
      if (pattern[0] === CardClass.RANGER && pattern[1] === CardClass.WARRIOR) {
        return [CardClass.MAGE];
      }
    }

    // 預測玩家最不可能重複最近使用的職業
    const lastClass = recentClasses[recentClasses.length - 1];
    return [CardClass.WARRIOR, CardClass.MAGE, CardClass.RANGER].filter(c => c !== lastClass);
  }

  private analyzePlayerClassFrequency(playerHistory: Card[]): [string, number][] {
    const classCount: Record<string, number> = {};
    
    playerHistory.forEach(card => {
      classCount[card.class] = (classCount[card.class] || 0) + 1;
    });

    return Object.entries(classCount)
      .sort(([,a], [,b]) => b - a); // 按頻率排序
  }

  private selectOptimalCard(availableCards: Card[], gameContext: GameContext): Card {
    // 後備選擇：平衡策略
    const classBalance: Record<CardClass, number> = {
      [CardClass.WARRIOR]: 0,
      [CardClass.MAGE]: 0,
      [CardClass.RANGER]: 0
    };

    availableCards.forEach(card => {
      classBalance[card.class]++;
    });

    // 選擇最平衡的職業
    const balancedClass = Object.entries(classBalance)
      .reduce((a, b) => Math.abs(a[1] - 2) < Math.abs(b[1] - 2) ? a : b)[0] as CardClass;

    const balancedCards = availableCards.filter(card => card.class === balancedClass);
    return balancedCards[Math.floor(Math.random() * balancedCards.length)];
  }
}

/**
 * AI 工廠類
 */
export class AIFactory {
  static createAI(difficulty: 'easy' | 'normal' | 'hard'): AIStrategy {
    switch (difficulty) {
      case 'easy':
        return new EasyAI();
      case 'normal':
        return new NormalAI();
      case 'hard':
        return new HardAI();
      default:
        return new NormalAI();
    }
  }

  static getAIDifficultyDescription(difficulty: 'easy' | 'normal' | 'hard'): string {
    switch (difficulty) {
      case 'easy':
        return '簡單 - AI 隨機出牌，適合新手練習';
      case 'normal':
        return '普通 - AI 會分析你的出牌模式，有一定策略性';
      case 'hard':
        return '困難 - AI 使用進階策略，會根據局面調整戰術';
      default:
        return '未知難度';
    }
  }
}