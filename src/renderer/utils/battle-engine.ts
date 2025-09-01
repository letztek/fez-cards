import { Card, CardClass, BattleResult } from '../types/card';

export class BattleEngine {
  /**
   * 職業相剋規則
   * 戰士克遊俠，法師克戰士，遊俠克法師
   */
  static readonly BATTLE_RULES = {
    [CardClass.WARRIOR]: CardClass.RANGER,  // 戰士克遊俠
    [CardClass.MAGE]: CardClass.WARRIOR,    // 法師克戰士
    [CardClass.RANGER]: CardClass.MAGE      // 遊俠克法師
  };

  /**
   * 相剋關係說明
   */
  static readonly BATTLE_EXPLANATIONS = {
    [`${CardClass.WARRIOR}_${CardClass.RANGER}`]: '重裝戰士的護甲可以抵擋遊俠的箭矢攻擊',
    [`${CardClass.MAGE}_${CardClass.WARRIOR}`]: '法師的魔法可以穿透戰士的護甲',
    [`${CardClass.RANGER}_${CardClass.MAGE}`]: '遊俠敏捷的身手可以避開法師的法術',
    [`${CardClass.WARRIOR}_${CardClass.WARRIOR}`]: '同樣的戰鬥技巧，勢均力敵',
    [`${CardClass.MAGE}_${CardClass.MAGE}`]: '魔法力量相當，難分高下',
    [`${CardClass.RANGER}_${CardClass.RANGER}`]: '弓術水準相似，平分秋色'
  };

  /**
   * 解決戰鬥並返回結果
   * @param playerCard 玩家的卡牌
   * @param computerCard 電腦的卡牌
   * @param round 當前回合數
   */
  static resolveBattle(playerCard: Card, computerCard: Card, round: number): BattleResult {
    const winner = this.determineWinner(playerCard.class, computerCard.class);
    const reason = this.explainResult(playerCard.class, computerCard.class, winner);

    return {
      round,
      playerCard,
      computerCard,
      winner,
      reason
    };
  }

  /**
   * 判定勝負
   * @param playerClass 玩家卡牌職業
   * @param computerClass 電腦卡牌職業
   */
  private static determineWinner(playerClass: CardClass, computerClass: CardClass): 'player' | 'computer' | 'tie' {
    // 相同職業平手
    if (playerClass === computerClass) {
      return 'tie';
    }

    // 檢查玩家是否克制電腦
    if (this.BATTLE_RULES[playerClass] === computerClass) {
      return 'player';
    }

    // 檢查電腦是否克制玩家
    if (this.BATTLE_RULES[computerClass] === playerClass) {
      return 'computer';
    }

    // 理論上不應該到達這裡
    return 'tie';
  }

  /**
   * 生成戰鬥結果說明
   */
  static explainResult(playerClass: CardClass, computerClass: CardClass, winner: 'player' | 'computer' | 'tie'): string {
    const key = `${playerClass}_${computerClass}`;
    const baseExplanation = this.BATTLE_EXPLANATIONS[key];

    if (baseExplanation) {
      return baseExplanation;
    }

    // 反向查找（電腦對玩家）
    const reverseKey = `${computerClass}_${playerClass}`;
    const reverseExplanation = this.BATTLE_EXPLANATIONS[reverseKey];

    if (reverseExplanation) {
      return reverseExplanation;
    }

    // 預設說明
    switch (winner) {
      case 'player':
        return `${this.getClassNameChinese(playerClass)}克制${this.getClassNameChinese(computerClass)}，玩家獲勝！`;
      case 'computer':
        return `${this.getClassNameChinese(computerClass)}克制${this.getClassNameChinese(playerClass)}，電腦獲勝！`;
      case 'tie':
        return `相同職業，平手！`;
      default:
        return '未知結果';
    }
  }

  /**
   * 獲取職業中文名稱
   */
  private static getClassNameChinese(cardClass: CardClass): string {
    switch (cardClass) {
      case CardClass.WARRIOR:
        return '戰士';
      case CardClass.MAGE:
        return '法師';
      case CardClass.RANGER:
        return '遊俠';
      default:
        return '未知職業';
    }
  }

  /**
   * 獲取所有可能的相剋關係
   */
  static getAllBattleRules(): Record<string, string> {
    return {
      '戰士 vs 遊俠': '戰士獲勝 - 重裝護甲抵擋箭矢',
      '法師 vs 戰士': '法師獲勝 - 魔法穿透護甲',
      '遊俠 vs 法師': '遊俠獲勝 - 敏捷閃避法術',
      '戰士 vs 戰士': '平手 - 勢均力敵',
      '法師 vs 法師': '平手 - 魔力相當',
      '遊俠 vs 遊俠': '平手 - 技藝相同'
    };
  }

  /**
   * 檢查某個職業是否克制另一個職業
   */
  static canDefeat(attackerClass: CardClass, defenderClass: CardClass): boolean {
    return this.BATTLE_RULES[attackerClass] === defenderClass;
  }

  /**
   * 獲取被某個職業克制的職業
   */
  static getWeakAgainst(cardClass: CardClass): CardClass | null {
    for (const [attacker, defender] of Object.entries(this.BATTLE_RULES)) {
      if (defender === cardClass) {
        return attacker as CardClass;
      }
    }
    return null;
  }

  /**
   * 獲取某個職業克制的職業
   */
  static getStrongAgainst(cardClass: CardClass): CardClass | null {
    return this.BATTLE_RULES[cardClass] || null;
  }

  /**
   * 計算戰鬥統計
   */
  static calculateBattleStats(battleHistory: BattleResult[]): {
    playerWins: number;
    computerWins: number;
    ties: number;
    totalBattles: number;
  } {
    const stats = {
      playerWins: 0,
      computerWins: 0,
      ties: 0,
      totalBattles: battleHistory.length
    };

    battleHistory.forEach(battle => {
      switch (battle.winner) {
        case 'player':
          stats.playerWins++;
          break;
        case 'computer':
          stats.computerWins++;
          break;
        case 'tie':
          stats.ties++;
          break;
      }
    });

    return stats;
  }
}