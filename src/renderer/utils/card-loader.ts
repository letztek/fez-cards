import { Card, CardClass, Gender, CardSet } from '../types/card';

export class CardLoader {
  private static readonly CARD_NAMES = {
    [CardClass.WARRIOR]: {
      [Gender.MALE]: ['勇敢戰士', '鋼鐵騎士', '守護者'],
      [Gender.FEMALE]: ['女戰士', '盾牌少女', '戰場玫瑰']
    },
    [CardClass.MAGE]: {
      [Gender.MALE]: ['火焰法師', '冰霜術士', '雷電巫師'],
      [Gender.FEMALE]: ['魔法少女', '星辰女巫', '治療師']
    },
    [CardClass.RANGER]: {
      [Gender.MALE]: ['弓箭手', '獵人', '遊俠'],
      [Gender.FEMALE]: ['精靈弓手', '女獵人', '森林守護者']
    }
  };

  /**
   * 載入所有卡牌資料
   */
  static async loadAllCards(): Promise<CardSet> {
    try {
      const cardPaths = await this.getCardImagePaths();
      const cards = cardPaths.map(path => this.parseCardFromPath(path));
      
      return {
        warriors: cards.filter(card => card.class === CardClass.WARRIOR),
        mages: cards.filter(card => card.class === CardClass.MAGE),
        rangers: cards.filter(card => card.class === CardClass.RANGER)
      };
    } catch (error) {
      console.error('Failed to load cards:', error);
      throw new Error('無法載入卡牌資料');
    }
  }

  /**
   * 從卡牌目錄獲取所有圖片路徑
   */
  private static async getCardImagePaths(): Promise<string[]> {
    const cardPaths: string[] = [];
    
    // 使用相對於 public 目錄的路徑
    const cardDefinitions = [
      // Warriors
      '/cards/warriors/w_m_1.jpg',
      '/cards/warriors/w_m_2.jpg', 
      '/cards/warriors/w_m_3.jpg',
      '/cards/warriors/w_w_1.jpg',
      '/cards/warriors/w_w_2.jpg',
      '/cards/warriors/w_w_3.jpg',
      // Mages
      '/cards/mages/m_m_1.jpg',
      '/cards/mages/m_m_2.jpg',
      '/cards/mages/m_m_3.jpg', 
      '/cards/mages/m_w_1.jpg',
      '/cards/mages/m_w_2.jpg',
      '/cards/mages/m_w_3.jpg',
      // Rangers
      '/cards/ranger/r_m_1.jpg',
      '/cards/ranger/r_m_2.jpg',
      '/cards/ranger/r_m_3.jpg',
      '/cards/ranger/r_w_1.jpg',
      '/cards/ranger/r_w_2.jpg',
      '/cards/ranger/r_w_3.jpg'
    ];

    return cardDefinitions;
  }

  /**
   * 從檔案路徑解析卡牌屬性
   * 檔案命名格式: {class}_{gender}_{number}.jpg
   * 例如: w_m_1.jpg -> warrior, male, #1
   * 例如: m_w_2.jpg -> mage, female, #2
   */
  static parseCardFromPath(filePath: string): Card {
    const filename = filePath.split('/').pop() || '';
    const [classCode, genderCode, numberStr] = filename.replace(/\.[^/.]+$/, '').split('_');
    
    const cardClass = this.parseCardClass(classCode);
    const gender = this.parseGender(genderCode);
    const number = parseInt(numberStr) - 1; // Convert to 0-based index
    
    const id = `${classCode}_${genderCode}_${numberStr}`;
    const name = this.getCardName(cardClass, gender, number);
    
    return {
      id,
      class: cardClass,
      gender,
      imageUrl: filePath,
      backImageUrl: '/cards/back.jpg',
      name,
      description: `${cardClass === CardClass.WARRIOR ? '戰士' : 
                     cardClass === CardClass.MAGE ? '法師' : '遊俠'} - ${
                     gender === Gender.MALE ? '男性' : '女性'}`
    };
  }

  /**
   * 解析職業代碼
   */
  private static parseCardClass(classCode: string): CardClass {
    switch (classCode.toLowerCase()) {
      case 'w':
        return CardClass.WARRIOR;
      case 'm':
        return CardClass.MAGE;
      case 'r':
        return CardClass.RANGER;
      default:
        throw new Error(`Unknown card class: ${classCode}`);
    }
  }

  /**
   * 解析性別代碼
   */
  private static parseGender(genderCode: string): Gender {
    switch (genderCode.toLowerCase()) {
      case 'm':
        return Gender.MALE;
      case 'w':
        return Gender.FEMALE;
      default:
        throw new Error(`Unknown gender code: ${genderCode}`);
    }
  }

  /**
   * 獲取卡牌名稱
   */
  private static getCardName(cardClass: CardClass, gender: Gender, index: number): string {
    const names = this.CARD_NAMES[cardClass][gender];
    return names[index] || `${cardClass} ${gender} ${index + 1}`;
  }

  /**
   * 預載入所有卡牌圖片
   */
  static async preloadCardImages(cards: Card[]): Promise<void> {
    console.log(`Starting to preload ${cards.length} card images...`);
    
    const imagePromises = cards.map((card, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`✅ Loaded (${index + 1}/${cards.length}): ${card.imageUrl}`);
          resolve();
        };
        img.onerror = (error) => {
          console.warn(`⚠️ Failed to load image (${index + 1}/${cards.length}): ${card.imageUrl}`, error);
          // Don't reject, just resolve to continue loading other images
          resolve();
        };
        console.log(`📥 Loading: ${card.imageUrl}`);
        img.src = card.imageUrl;
      });
    });

    try {
      await Promise.all(imagePromises);
      console.log(`🎉 Finished preloading ${cards.length} card images`);
    } catch (error) {
      console.error('Error during image preloading:', error);
      // Don't throw error, allow game to continue with missing images
    }
  }
}