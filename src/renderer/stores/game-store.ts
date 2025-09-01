import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Card, GameState, GameSettings, BattleResult, CardSet, GamePhase } from '../types/card';
import { CardLoader } from '../utils/card-loader';
import { CardManager } from '../utils/card-manager';
import { BattleEngine } from '../utils/battle-engine';

interface GameStore {
  // State
  gameState: GameState;
  settings: GameSettings;
  cardSet: CardSet | null;
  cardManager: CardManager | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeGame: () => Promise<void>;
  startNewGame: () => void;
  selectCard: (cardId: string) => void;
  playRound: (playerCardId: string, computerCard?: Card) => Promise<BattleResult>;
  completeRound: (battleResult: BattleResult) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetGame: () => void;
  setGamePhase: (phase: GamePhase) => void;
  clearError: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  maxRounds: 6,
  aiDifficulty: 'normal',
  language: 'zh',
  theme: 'dark'
};

const INITIAL_GAME_STATE: GameState = {
  phase: 'menu',
  currentRound: 1,
  maxRounds: 6,
  playerHand: [],
  computerHand: [],
  playerScore: 0,
  computerScore: 0,
  battleHistory: [],
  selectedCard: undefined
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    // Initial state
    gameState: INITIAL_GAME_STATE,
    settings: DEFAULT_SETTINGS,
    cardSet: null,
    cardManager: null,
    isLoading: false,
    error: null,

    // Initialize game with card loading
    initializeGame: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const cardSet = await CardLoader.loadAllCards();
        const cardManager = new CardManager(cardSet);

        // Validate card set
        if (!cardManager.validateCardSet()) {
          throw new Error('Invalid card set configuration');
        }

        // Preload card images
        await CardLoader.preloadCardImages(cardManager.getAllCards());

        set((state) => {
          state.cardSet = cardSet;
          state.cardManager = cardManager;
          state.isLoading = false;
          state.error = null;
        });

        console.log('Game initialized successfully', cardManager.getCardStats());
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Unknown error occurred';
        });
        console.error('Failed to initialize game:', error);
      }
    },

    // Start a new game
    startNewGame: () => {
      const { cardManager, settings } = get();
      
      if (!cardManager) {
        set((state) => {
          state.error = 'Card manager not initialized';
        });
        return;
      }

      try {
        const { player, computer } = cardManager.dealCards(6);

        set((state) => {
          state.gameState = {
            ...INITIAL_GAME_STATE,
            phase: 'playing',
            maxRounds: settings.maxRounds,
            playerHand: player,
            computerHand: computer
          };
          state.error = null;
        });

        console.log('New game started', { playerCards: player.length, computerCards: computer.length });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to start new game';
        });
      }
    },

    // Select a card for battle
    selectCard: (cardId: string) => {
      const { gameState } = get();
      const selectedCard = gameState.playerHand.find(card => card.id === cardId);

      if (!selectedCard) {
        set((state) => {
          state.error = 'Selected card not found in player hand';
        });
        return;
      }

      set((state) => {
        state.gameState.selectedCard = selectedCard;
        state.error = null;
      });
    },

    // Play a round of battle
    playRound: async (playerCardId: string, computerCard?: Card): Promise<BattleResult> => {
      const { gameState, cardManager } = get();

      if (!cardManager) {
        throw new Error('Card manager not initialized');
      }

      const playerCard = gameState.playerHand.find(card => card.id === playerCardId);
      if (!playerCard) {
        throw new Error('Player card not found');
      }

      // AI selects a card if not provided
      const aiCard = computerCard || cardManager.selectRandomFromCards(gameState.computerHand);

      // Resolve battle
      const battleResult = BattleEngine.resolveBattle(playerCard, aiCard, gameState.currentRound);

      set((state) => {
        // Update scores
        if (battleResult.winner === 'player') {
          state.gameState.playerScore++;
        } else if (battleResult.winner === 'computer') {
          state.gameState.computerScore++;
        }

        // Add to battle history
        state.gameState.battleHistory.push(battleResult);

        // Set phase to battle to show result
        state.gameState.phase = 'battle';
        state.error = null;
      });

      return battleResult;
    },

    // Complete current round and prepare for next
    completeRound: (battleResult: BattleResult) => {
      set((state) => {
        // Remove used cards from hands
        state.gameState.playerHand = state.gameState.playerHand.filter(
          card => card.id !== battleResult.playerCard.id
        );
        state.gameState.computerHand = state.gameState.computerHand.filter(
          card => card.id !== battleResult.computerCard.id
        );

        // Advance round
        state.gameState.currentRound++;
        state.gameState.selectedCard = undefined;

        // Check if game is over
        const isGameOver = state.gameState.currentRound > state.gameState.maxRounds ||
                          (state.gameState.playerHand.length === 0 && state.gameState.computerHand.length === 0);

        if (isGameOver) {
          state.gameState.phase = 'result';
        } else {
          state.gameState.phase = 'playing';
        }

        state.error = null;
      });
    },

    // Update game settings
    updateSettings: (newSettings: Partial<GameSettings>) => {
      set((state) => {
        state.settings = { ...state.settings, ...newSettings };
      });
    },

    // Reset game to initial state
    resetGame: () => {
      set((state) => {
        state.gameState = INITIAL_GAME_STATE;
        state.error = null;
      });
    },

    // Set game phase
    setGamePhase: (phase: GamePhase) => {
      set((state) => {
        state.gameState.phase = phase;
      });
    },

    // Clear error message
    clearError: () => {
      set((state) => {
        state.error = null;
      });
    }
  }))
);

// Selectors for computed values
export const useGameStats = () => {
  const { gameState } = useGameStore();
  return BattleEngine.calculateBattleStats(gameState.battleHistory);
};

export const useIsGameOver = () => {
  const { gameState } = useGameStore();
  return gameState.phase === 'result' || 
         gameState.currentRound > gameState.maxRounds ||
         (gameState.playerHand.length === 0 && gameState.computerHand.length === 0);
};

export const useGameWinner = () => {
  const { gameState } = useGameStore();
  const stats = BattleEngine.calculateBattleStats(gameState.battleHistory);
  
  if (stats.playerWins > stats.computerWins) {
    return 'player';
  } else if (stats.computerWins > stats.playerWins) {
    return 'computer';
  } else {
    return 'tie';
  }
};