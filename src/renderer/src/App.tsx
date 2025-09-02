import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/game-store';
import { GameBoard } from '../components/GameBoard';
import { Button } from '../components/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AIFactory } from '../utils/ai-strategy';
import { BattleResult } from '../types/card';
import { SimpleImageTest } from './SimpleImageTest';
import { GameDebug } from './GameDebug';
import { ButtonTest } from './ButtonTest';
import { TestModal } from './TestModal';
import { SimpleModal } from './SimpleModal';
import { FlipCardTest } from './FlipCardTest';
import { Settings } from '../components/Settings';
import { Statistics } from '../components/Statistics';
import { KeyboardHelp } from '../components/KeyboardHelp';
import { useGameKeyboard } from '../hooks/useKeyboard';


function App() {
  const {
    gameState,
    settings,
    isLoading,
    error,
    initializeGame,
    startNewGame,
    selectCard,
    playRound,
    completeRound,
    clearError,
    resetGame
  } = useGameStore();

  const [currentBattleResult, setCurrentBattleResult] = useState<BattleResult | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'waiting' | 'player-selected' | 'computer-thinking' | 'computer-reveal' | 'result'>('waiting');
  const [computerCard, setComputerCard] = useState<any>(null);
  const [showImageTest, setShowImageTest] = useState(false);
  const [showGameDebug, setShowGameDebug] = useState(false);
  const [showButtonTest, setShowButtonTest] = useState(false);
  const [showFlipCardTest, setShowFlipCardTest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showTestModal, setShowTestModal] = useState('');
  const [showSimpleModal, setShowSimpleModal] = useState('');

  useEffect(() => {
    console.log('App mounted, initializing game...');
    initializeGame();
  }, [initializeGame]);

  const handleStartGame = () => {
    clearError();
    startNewGame();
  };

  const handleCardSelect = (card: any) => {
    console.log('🃏 玩家選擇卡牌:', card.name);
    selectCard(card.id);
    setBattlePhase('player-selected');
    // 清除之前的對戰結果和電腦卡牌
    setCurrentBattleResult(undefined);
    setComputerCard(null);
  };

  const handleBattleConfirm = async () => {
    if (!gameState.selectedCard) return;

    console.log('⚔️ 開始對戰流程');
    setIsProcessing(true);
    setBattlePhase('computer-thinking');

    try {
      // 階段 1: 電腦思考 (模擬思考時間)
      console.log('🤖 電腦思考中...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 階段 2: 電腦選擇卡牌
      const ai = AIFactory.createAI(settings.aiDifficulty);
      const aiCard = ai.selectCard(gameState.computerHand, {
        playerPreviousCards: gameState.battleHistory.map(b => b.playerCard),
        currentRound: gameState.currentRound,
        playerScore: gameState.playerScore,
        computerScore: gameState.computerScore
      });

      console.log('🎴 電腦選擇卡牌:', aiCard.name);
      setComputerCard(aiCard);
      
      // 階段 3: 開始電腦翻牌動畫
      setBattlePhase('computer-reveal');
      
    } catch (err) {
      console.error('Battle error:', err);
      setIsProcessing(false);
      setBattlePhase('waiting');
    }
  };

  // 處理電腦翻牌完成
  const handleComputerRevealComplete = async () => {
    console.log('✨ 電腦翻牌動畫完成，開始計算結果');
    
    try {
      // 計算對戰結果
      const result = await playRound(gameState.selectedCard!.id, computerCard);
      setCurrentBattleResult(result);
      
      // 進入結果階段
      setBattlePhase('result');
      
    } catch (err) {
      console.error('Battle calculation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextRound = () => {
    if (currentBattleResult) {
      completeRound(currentBattleResult);
      setCurrentBattleResult(undefined);
      setComputerCard(null);
      setBattlePhase('waiting');
    }
  };

  const handleResetGame = () => {
    setCurrentBattleResult(undefined);
    setBattlePhase('waiting');
    setComputerCard(null);
    resetGame();
  };

  const handleCardSelectByIndex = (index: number) => {
    if (gameState.playerHand[index]) {
      handleCardSelect(gameState.playerHand[index]);
    }
  };

  const handleEscape = () => {
    if (showSettings) {
      setShowSettings(false);
    } else if (showStatistics) {
      setShowStatistics(false);
    } else if (showImageTest) {
      setShowImageTest(false);
    } else if (showGameDebug) {
      setShowGameDebug(false);
    } else if (showButtonTest) {
      setShowButtonTest(false);
    } else if (showKeyboardHelp) {
      setShowKeyboardHelp(false);
    } else if (gameState.phase === 'playing' || gameState.phase === 'battle') {
      // 返回主選單
      handleResetGame();
    }
  };

  // 設定快捷鍵（暫時關閉以測試按鈕問題）
  // useGameKeyboard(
  //   handleCardSelectByIndex,
  //   handleBattleConfirm,
  //   handleNextRound,
  //   handleEscape,
  //   gameState.phase,
  //   !showSettings && !showStatistics && !showImageTest && !showGameDebug && !showKeyboardHelp && !showButtonTest
  // );

  // Debug info
  console.log('App render - isLoading:', isLoading, 'error:', error, 'gameState.phase:', gameState.phase);

  // 顯示圖片測試頁面
  if (showImageTest) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowImageTest(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            返回遊戲
          </button>
        </div>
        <SimpleImageTest />
      </div>
    );
  }

  // 顯示遊戲除錯頁面
  if (showGameDebug) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowGameDebug(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            返回遊戲
          </button>
        </div>
        <GameDebug />
      </div>
    );
  }

  // 顯示按鈕測試頁面
  if (showButtonTest) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowButtonTest(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            返回遊戲
          </button>
        </div>
        <ButtonTest />
      </div>
    );
  }

  // 顯示翻轉卡片測試頁面
  if (showFlipCardTest) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowFlipCardTest(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            返回遊戲
          </button>
        </div>
        <FlipCardTest />
      </div>
    );
  }

  // 除錯按鈕
  const debugButton = (
    <div className="fixed top-4 left-4 z-50 space-y-2">
      <button
        onClick={() => setShowImageTest(true)}
        className="block bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
      >
        圖片測試
      </button>
      <button
        onClick={() => setShowGameDebug(true)}
        className="block bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
      >
        遊戲除錯
      </button>
      <button
        onClick={() => setShowButtonTest(true)}
        className="block bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
      >
        按鈕測試
      </button>
      <button
        onClick={() => setShowFlipCardTest(true)}
        className="block bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
      >
        翻轉動畫
      </button>
      <button
        onClick={() => {
          console.log('顯示簡單模態窗口');
          setShowSimpleModal('調試');
        }}
        className="block bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
      >
        簡單模態
      </button>
      <button
        onClick={() => {
          console.log('=== 遊戲狀態除錯 ===');
          console.log('gameState:', gameState);
          console.log('playerHand:', gameState.playerHand);
          console.log('computerHand:', gameState.computerHand);
          console.log('isLoading:', isLoading);
          console.log('error:', error);
        }}
        className="block bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
      >
        除錯資訊
      </button>
    </div>
  );

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🎴
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Fez Card Game</h2>
            <p className="text-slate-400">正在載入卡牌資料...</p>
          </div>
          
          <div className="w-64 bg-slate-700 rounded-full h-2 mx-auto">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
          
          <div className="mt-4 text-sm text-slate-500">
            載入中，請稍候...
          </div>
        </motion.div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">載入錯誤</h2>
          <p className="text-gray-300 mb-4 max-w-md">{error}</p>
          <Button onClick={() => { clearError(); initializeGame(); }} variant="primary">
            重新載入
          </Button>
        </div>
      </div>
    );
  }

  // Menu screen
  if (gameState.phase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        {debugButton}
        <div className="container mx-auto px-4 py-8">
          <motion.header
            className="text-center mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Fez Card Game
            </h1>
            <p className="text-slate-400 text-lg">
              三職業相剋的回合制卡牌對戰遊戲
            </p>
          </motion.header>

          <motion.main
            className="flex items-center justify-center min-h-[60vh]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 shadow-xl max-w-md">
                <h2 className="text-2xl font-semibold mb-6">準備開始遊戲</h2>

                <div className="grid grid-cols-3 gap-4 text-sm mb-8">
                  <motion.div
                    className="bg-red-900/30 p-3 rounded border border-red-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-red-300 font-medium">⚔️ 戰士</div>
                    <div className="text-xs text-slate-400 mt-1">克制遊俠</div>
                  </motion.div>
                  <motion.div
                    className="bg-blue-900/30 p-3 rounded border border-blue-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-blue-300 font-medium">🔮 法師</div>
                    <div className="text-xs text-slate-400 mt-1">克制戰士</div>
                  </motion.div>
                  <motion.div
                    className="bg-green-900/30 p-3 rounded border border-green-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-green-300 font-medium">🏹 遊俠</div>
                    <div className="text-xs text-slate-400 mt-1">克制法師</div>
                  </motion.div>
                </div>

                <div className="text-sm text-slate-300 mb-6">
                  <div className="mb-2">遊戲設定</div>
                  <div className="text-xs text-slate-400">
                    回合數: {settings.maxRounds} | 難度: {settings.aiDifficulty}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleStartGame}
                    variant="primary"
                    size="large"
                    className="w-full"
                  >
                    開始遊戲
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('設定按鈕被點擊了！');
                      setShowSettings(true);
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    遊戲設定 (簡單測試)
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('統計按鈕被點擊了！');
                      setShowStatistics(true);
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    遊戲統計 (簡單測試)
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('快捷鍵按鈕被點擊了！');
                      setShowKeyboardHelp(true);
                    }}
                    variant="secondary"
                    className="w-full text-sm"
                  >
                    ⌨️ 快捷鍵說明 (簡單測試)
                  </Button>
                </div>
              </div>
            </div>
          </motion.main>
        </div>
        
        {/* Settings Modal - 在 menu 階段也要顯示 */}
        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} />
        )}
        
        {/* Statistics Modal - 在 menu 階段也要顯示 */}
        {showStatistics && (
          <Statistics onClose={() => setShowStatistics(false)} />
        )}
        
        {/* Keyboard Help Modal - 在 menu 階段也要顯示 */}
        {showKeyboardHelp && (
          <KeyboardHelp onClose={() => setShowKeyboardHelp(false)} />
        )}
        
        {/* Simple Modal - 保留用於調試 */}
        {showSimpleModal && (
          <SimpleModal 
            title={`簡單模態窗口 - ${showSimpleModal}`}
            onClose={() => setShowSimpleModal('')} 
          />
        )}
      </div>
    );
  }

  // Result screen
  if (gameState.phase === 'result') {
    const playerWins = gameState.battleHistory.filter(b => b.winner === 'player').length;
    const computerWins = gameState.battleHistory.filter(b => b.winner === 'computer').length;
    const ties = gameState.battleHistory.filter(b => b.winner === 'tie').length;

    const finalWinner = playerWins > computerWins ? 'player' :
      computerWins > playerWins ? 'computer' : 'tie';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 shadow-xl">
            <div className="text-6xl mb-4">
              {finalWinner === 'player' ? '🎉' : finalWinner === 'computer' ? '😔' : '🤝'}
            </div>

            <h2 className="text-2xl font-bold mb-4">
              {finalWinner === 'player' ? '恭喜獲勝！' :
                finalWinner === 'computer' ? '很遺憾敗北' : '平手！'}
            </h2>

            <div className="text-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span>玩家</span>
                <span className="font-bold text-blue-400">{playerWins} 勝</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>電腦</span>
                <span className="font-bold text-red-400">{computerWins} 勝</span>
              </div>
              <div className="flex justify-between items-center">
                <span>平手</span>
                <span className="font-bold text-yellow-400">{ties} 場</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStartGame}
                variant="primary"
                size="large"
                className="w-full"
              >
                再玩一局
              </Button>
              <Button
                onClick={handleResetGame}
                variant="secondary"
                className="w-full"
              >
                返回主選單
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Game screen
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        {debugButton}
        <div className="container mx-auto px-4 py-6">
          <GameBoard
            playerHand={gameState.playerHand}
            computerHand={gameState.computerHand}
            playerScore={gameState.playerScore}
            computerScore={gameState.computerScore}
            currentRound={gameState.currentRound}
            maxRounds={gameState.maxRounds}
            selectedCard={gameState.selectedCard}
            battleResult={currentBattleResult}
            onCardSelect={handleCardSelect}
            onBattleConfirm={handleBattleConfirm}
            onNextRound={handleNextRound}
            isProcessing={isProcessing}
            battlePhase={battlePhase}
            onComputerRevealComplete={handleComputerRevealComplete}
            pendingComputerCard={computerCard}
          />
        </div>
        
        {/* Settings Modal */}
        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} />
        )}
        
        {/* Statistics Modal */}
        {showStatistics && (
          <Statistics onClose={() => setShowStatistics(false)} />
        )}
        
        {/* Keyboard Help Modal */}
        {showKeyboardHelp && (
          <KeyboardHelp onClose={() => setShowKeyboardHelp(false)} />
        )}
        
        {/* Test Modal */}
        {showTestModal && (
          <TestModal 
            title={`測試模態窗口 - ${showTestModal}`}
            onClose={() => setShowTestModal('')} 
          />
        )}
        
        {/* Simple Modal */}
        {showSimpleModal && (
          <SimpleModal 
            title={`簡單模態窗口 - ${showSimpleModal}`}
            onClose={() => setShowSimpleModal('')} 
          />
        )}
        
        {/* Debug: Always visible modal test */}
        {gameState.phase === 'menu' && (
          <div 
            id="debug-modal-test"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              zIndex: 10000,
              fontSize: '12px',
              maxWidth: '200px'
            }}
          >
            <div>🔍 模態窗口調試測試</div>
            <div style={{ marginTop: '4px', fontSize: '10px' }}>
              如果你能看到這個紅色方塊，說明固定定位和高 z-index 可以工作
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;