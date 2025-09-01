import { Card, CardClass, CardSet } from '../types/card';

export class CardManager {
  private allCards: Card[] = [];

  constructor(cardSet: CardSet) {
    this.allCards = [
      ...cardSet.warriors,
      ...cardSet.mages,
      ...cardSet.rangers
    ];
  }

  /**
   * 獲取所有卡牌
   */
  getAllCards(): Card[] {
    return [...this.allCards];
  }

  /**
   * 根據職業篩選卡牌
   */
  getCardsByClass(cardClass: CardClass): Card[] {
    return this.allCards.filter(card => card.class === cardClass);
  }

  /**
   * 根據ID獲取卡牌
   */
  getCardById(id: string): Card | undefined {
    return this.allCards.find(card => card.id === id);
  }

  /**
   * 洗牌演算法 (Fisher-Yates)
   */
  shuffleCards(cards: Card[]): Card[] {
    const shuffled = [...cards];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * 分配卡牌給玩家和電腦
   * 每人6張卡牌，共使用12張卡牌
   */
  dealCards(count: number = 6): { player: Card[], computer: Card[] } {
    if (count * 2 > this.allCards.length) {
      throw new Error('Not enough cards to deal');
    }

    const shuffledCards = this.shuffleCards(this.allCards);
    const totalCards = count * 2;
    const selectedCards = shuffledCards.slice(0, totalCards);

    // 再次洗牌確保隨機性
    const finalShuffled = this.shuffleCards(selectedCards);

    return {
      player: finalShuffled.slice(0, count),
      computer: finalShuffled.slice(count, count * 2)
    };
  }

  /**
   * 驗證卡牌集合是否有效
   */
  validateCardSet(): boolean {
    const expectedCounts = {
      [CardClass.WARRIOR]: 6,
      [CardClass.MAGE]: 6,
      [CardClass.RANGER]: 6
    };

    for (const [cardClass, expectedCount] of Object.entries(expectedCounts)) {
      const actualCount = this.getCardsByClass(cardClass as CardClass).length;
      if (actualCount !== expectedCount) {
        console.error(`Invalid card count for ${cardClass}: expected ${expectedCount}, got ${actualCount}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 獲取卡牌統計資訊
   */
  getCardStats() {
    const stats = {
      total: this.allCards.length,
      warriors: this.getCardsByClass(CardClass.WARRIOR).length,
      mages: this.getCardsByClass(CardClass.MAGE).length,
      rangers: this.getCardsByClass(CardClass.RANGER).length
    };

    return stats;
  }

  /**
   * 搜索卡牌
   */
  searchCards(query: string): Card[] {
    const lowerQuery = query.toLowerCase();
    
    return this.allCards.filter(card =>
      card.name.toLowerCase().includes(lowerQuery) ||
      card.class.toLowerCase().includes(lowerQuery) ||
      card.id.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 隨機選擇一張卡牌
   */
  getRandomCard(): Card {
    const randomIndex = Math.floor(Math.random() * this.allCards.length);
    return this.allCards[randomIndex];
  }

  /**
   * 從指定卡牌數組中隨機選擇一張
   */
  selectRandomFromCards(cards: Card[]): Card {
    if (cards.length === 0) {
      throw new Error('Cannot select from empty card array');
    }
    
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }
}