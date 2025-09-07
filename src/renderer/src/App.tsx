import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/game-store';
import { GameBoard } from '../components/GameBoard';
import { Button } from '../components/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SplashScreen } from './SplashScreen';
import { AIFactory } from '../utils/ai-strategy';
import { audioManager } from '../utils/AudioManager';
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
import { useFullscreen } from '../hooks/useFullscreen';


function App() {
  const { t, i18n } = useTranslation();
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
  const [showSplash, setShowSplash] = useState(true);
  
  // 全螢幕功能
  const { isFullscreen, isFullscreenSupported, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    // console.log('App mounted, initializing game...');
    initializeGame();
  }, [initializeGame]);

  // 同步語言設定
  useEffect(() => {
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  const handleStartGame = () => {
    clearError();
    setShowSplash(false); // 關閉啟動畫面
    // 切換到對戰音樂
    audioManager.playTrack('battle');
    startNewGame();
  };

  const handleCardSelect = (card: any) => {
    // console.log('🃏 玩家選擇卡牌:', card.name);
    selectCard(card.id);
    setBattlePhase('player-selected');
    // 清除之前的對戰結果和電腦卡牌
    setCurrentBattleResult(undefined);
    setComputerCard(null);
  };

  const handleBattleConfirm = async () => {
    if (!gameState.selectedCard) return;

    // console.log('⚔️ 開始對戰流程');
    setIsProcessing(true);
    setBattlePhase('computer-thinking');

    try {
      // 階段 1: 電腦思考 (動態思考時間)
      // console.log('🤖 電腦思考中...');
      const ai = AIFactory.createAI(settings.aiDifficulty);
      const thinkingTime = ai.getThinkingTime?.() || 1000;
      // console.log(`⏱️ 電腦思考時間: ${thinkingTime}ms`);
      await new Promise(resolve => setTimeout(resolve, thinkingTime));

      // 階段 2: 電腦選擇卡牌 (重用同一個 AI 實例)
      const aiCard = ai.selectCard(gameState.computerHand, {
        playerPreviousCards: gameState.battleHistory.map(b => b.playerCard),
        currentRound: gameState.currentRound,
        playerScore: gameState.playerScore,
        computerScore: gameState.computerScore
      });

      // console.log('🎴 電腦選擇卡牌:', aiCard.name);
      setComputerCard(aiCard);
      
      // 階段 3: 開始電腦翻牌動畫
      setBattlePhase('computer-reveal');
      
    } catch (err) {
      // console.error('Battle error:', err);
      setIsProcessing(false);
      setBattlePhase('waiting');
    }
  };

  // 處理電腦翻牌完成
  const handleComputerRevealComplete = async () => {
    // console.log('✨ 電腦翻牌動畫完成，開始計算結果');
    
    try {
      // 計算對戰結果
      const result = await playRound(gameState.selectedCard!.id, computerCard);
      setCurrentBattleResult(result);
      
      // 進入結果階段
      setBattlePhase('result');
      
    } catch (err) {
      // console.error('Battle calculation error:', err);
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
    setShowSplash(true); // 返回到啟動畫面
    // 返回啟動畫面時切換回啟動音樂
    audioManager.playTrack('splash');
    resetGame();
  };

  const handleCardSelectByIndex = (index: number) => {
    if (gameState.playerHand[index]) {
      handleCardSelect(gameState.playerHand[index]);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
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

  // 設定快捷鍵
  useGameKeyboard(
    handleCardSelectByIndex,
    handleBattleConfirm,
    handleNextRound,
    handleEscape,
    gameState.phase,
    !showSettings && !showStatistics && !showImageTest && !showGameDebug && !showKeyboardHelp && !showButtonTest
  );

  // Debug info
  // console.log('App render - isLoading:', isLoading, 'error:', error, 'gameState.phase:', gameState.phase);

  // 顯示啟動畫面
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} onStartGame={handleStartGame} />;
  }

  // 顯示圖片測試頁面
  if (showImageTest) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowImageTest(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {t('game.backToMenu')}
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
            {t('game.backToMenu')}
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
            {t('game.backToMenu')}
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
            {t('game.backToMenu')}
          </button>
        </div>
        <FlipCardTest />
      </div>
    );
  }

  // 除錯按鈕 (生產環境已隱藏)
  const debugButton = false && (
    <div className="fixed top-4 left-4 z-50 space-y-2">
      <button
        onClick={() => setShowImageTest(true)}
        className="block bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
      >
        {t('debug.imageTest')}
      </button>
      <button
        onClick={() => setShowGameDebug(true)}
        className="block bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
      >
        {t('debug.gameDebug')}
      </button>
      <button
        onClick={() => setShowButtonTest(true)}
        className="block bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
      >
        {t('debug.buttonTest')}
      </button>
      <button
        onClick={() => setShowFlipCardTest(true)}
        className="block bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
      >
        {t('debug.flipAnimation')}
      </button>
      <button
        onClick={() => {
          // console.log('顯示簡單模態窗口');
          setShowSimpleModal('調試');
        }}
        className="block bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
      >
        {t('debug.simpleModal')}
      </button>
      <button
        onClick={() => {
          // console.log('=== 遊戲狀態除錯 ===');
          // console.log('gameState:', gameState);
          // console.log('playerHand:', gameState.playerHand);
          // console.log('computerHand:', gameState.computerHand);
          // console.log('isLoading:', isLoading);
          // console.log('error:', error);
        }}
        className="block bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
      >
        {t('debug.debugInfo')}
      </button>
      
      {/* 全螢幕按鈕 */}
      {isFullscreenSupported && (
        <button
          onClick={toggleFullscreen}
          className="block bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
        >
          {isFullscreen ? `${t('menu.exitFullscreen')} (F11)` : `${t('menu.fullscreen')} (F11)`}
        </button>
      )}
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
            <h2 className="text-2xl font-bold mb-2">{t('app.title')}</h2>
            <p className="text-slate-400">{t('loading.title')}</p>
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
            {t('loading.pleaseWait')}
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
          <h2 className="text-xl font-bold text-red-400 mb-2">{t('error.title')}</h2>
          <p className="text-gray-300 mb-4 max-w-md">{error}</p>
          <Button onClick={() => { clearError(); initializeGame(); }} variant="primary">
            {t('error.reload')}
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
              {t('app.title')}
            </h1>
            <p className="text-slate-400 text-lg">
              {t('app.subtitle')}
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
                <h2 className="text-2xl font-semibold mb-6">{t('menu.ready')}</h2>

                <div className="grid grid-cols-3 gap-4 text-sm mb-8">
                  <motion.div
                    className="bg-red-900/30 p-3 rounded border border-red-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-red-300 font-medium">⚔️ {t('classes.warrior')}</div>
                    <div className="text-xs text-slate-400 mt-1">{t('classCounters.warrior')}</div>
                  </motion.div>
                  <motion.div
                    className="bg-blue-900/30 p-3 rounded border border-blue-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-blue-300 font-medium">🔮 {t('classes.sorcerer')}</div>
                    <div className="text-xs text-slate-400 mt-1">{t('classCounters.sorcerer')}</div>
                  </motion.div>
                  <motion.div
                    className="bg-green-900/30 p-3 rounded border border-green-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-green-300 font-medium">🏹 {t('classes.scout')}</div>
                    <div className="text-xs text-slate-400 mt-1">{t('classCounters.scout')}</div>
                  </motion.div>
                </div>

                <div className="text-sm text-slate-300 mb-6">
                  <div className="mb-2">{t('settings.title')}</div>
                  <div className="text-xs text-slate-400">
                    {t('settings.rounds')}: {settings.maxRounds} | {t('settings.aiDifficulty')}: {t(`difficulty.${settings.aiDifficulty}`)}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleStartGame}
                    variant="primary"
                    size="large"
                    className="w-full"
                  >
                    {t('menu.startGame')}
                  </Button>
                  <Button
                    onClick={() => {
                      // console.log('設定按鈕被點擊了！');
                      setShowSettings(true);
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    {t('menu.settings')}
                  </Button>
                  <Button
                    onClick={() => {
                      // console.log('統計按鈕被點擊了！');
                      setShowStatistics(true);
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    {t('menu.statistics')}
                  </Button>
                  <Button
                    onClick={() => {
                      // console.log('快捷鍵按鈕被點擊了！');
                      setShowKeyboardHelp(true);
                    }}
                    variant="secondary"
                    className="w-full text-sm"
                  >
                    ⌨️ {t('menu.keyboardHelp')}
                  </Button>
                  
                  {/* 全螢幕按鈕 */}
                  {isFullscreenSupported && (
                    <Button
                      onClick={toggleFullscreen}
                      variant="secondary"
                      className="w-full text-sm"
                    >
                      {isFullscreen ? `📤 ${t('menu.exitFullscreen')}` : `📺 ${t('menu.fullscreen')}`} (F11)
                    </Button>
                  )}
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
              {finalWinner === 'player' ? t('result.congratulations') :
                finalWinner === 'computer' ? t('result.defeat') : t('result.tie')}
            </h2>

            <div className="text-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span>{t('game.playerScore', { score: '' }).split(':')[0]}</span>
                <span className="font-bold text-blue-400">{t('result.playerWins', { wins: playerWins })}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>{t('game.computerScore', { score: '' }).split(':')[0]}</span>
                <span className="font-bold text-red-400">{t('result.computerWins', { wins: computerWins })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('statistics.ties')}</span>
                <span className="font-bold text-yellow-400">{t('result.ties', { ties })}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStartGame}
                variant="primary"
                size="large"
                className="w-full"
              >
                {t('result.playAgain')}
              </Button>
              <Button
                onClick={() => {
                  setCurrentBattleResult(undefined);
                  setBattlePhase('waiting');
                  setComputerCard(null);
                  setShowSplash(true); // 返回到啟動畫面
                  // 返回啟動畫面時切換回啟動音樂
                  audioManager.playTrack('splash');
                  resetGame();
                }}
                variant="secondary"
                className="w-full"
              >
                {t('result.backToMenu')}
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
            onExitGame={handleResetGame}
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