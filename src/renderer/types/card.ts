export enum CardClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  RANGER = 'ranger'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export interface Card {
  id: string;
  class: CardClass;
  gender: Gender;
  imageUrl: string;
  backImageUrl: string;
  name: string;
  description?: string;
}

export interface CardSet {
  warriors: Card[];
  mages: Card[];
  rangers: Card[];
}

export type GamePhase = 'menu' | 'playing' | 'battle' | 'result' | 'settings';

export interface BattleResult {
  round: number;
  playerCard: Card;
  computerCard: Card;
  winner: 'player' | 'computer' | 'tie';
  reason: string;
}

export interface GameState {
  phase: GamePhase;
  currentRound: number;
  maxRounds: number;
  playerHand: Card[];
  computerHand: Card[];
  playerScore: number;
  computerScore: number;
  battleHistory: BattleResult[];
  selectedCard?: Card;
}

export interface GameSettings {
  // 遊戲設定
  maxRounds: number;
  aiDifficulty: 'easy' | 'normal' | 'hard';
  language: 'zh' | 'en' | 'ja';
  theme: 'light' | 'dark';
  
  // 音效設定
  audio: {
    masterVolume: number; // 主音量 (0-1)
    effectsVolume: number; // 音效音量 (0-1)
    musicVolume: number; // 背景音樂音量 (0-1)
    muted: boolean; // 是否靜音
  };
  
  // 顯示設定
  display: {
    fullscreen: boolean; // 全螢幕模式
    resolution: {
      width: number;
      height: number;
    };
    cardSize: 'small' | 'medium' | 'large'; // 卡牌尺寸偏好
    reduceAnimations: boolean; // 減少動畫 (無障礙選項)
  };
  
  // 遊戲體驗設定
  gameplay: {
    autoAdvance: boolean; // 自動進入下一回合
    showHints: boolean; // 顯示提示
    battleSpeed: 'slow' | 'normal' | 'fast'; // 戰鬥動畫速度
  };
}

export interface AIStrategy {
  difficulty: 'easy' | 'normal' | 'hard';
  selectCard: (availableCards: Card[], gameContext: GameContext) => Card;
  getThinkingTime?: () => number;
  getDescription?: () => string;
}

export interface GameContext {
  playerPreviousCards: Card[];
  currentRound: number;
  playerScore: number;
  computerScore: number;
}