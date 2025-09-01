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
  maxRounds: number;
  aiDifficulty: 'easy' | 'normal' | 'hard';
  language: 'zh' | 'en' | 'ja';
  theme: 'light' | 'dark';
}

export interface AIStrategy {
  difficulty: 'easy' | 'normal' | 'hard';
  selectCard: (availableCards: Card[], gameContext: GameContext) => Card;
}

export interface GameContext {
  playerPreviousCards: Card[];
  currentRound: number;
  playerScore: number;
  computerScore: number;
}