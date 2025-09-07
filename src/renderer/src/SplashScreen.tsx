import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/game-store';
import { Settings } from '../components/Settings';
import { Statistics } from '../components/Statistics';
import { KeyboardHelp } from '../components/KeyboardHelp';
import { useFullscreen } from '../hooks/useFullscreen';
import { Button } from '../components/Button';
import { audioManager } from './utils/AudioManager';

interface SplashScreenProps {
  onComplete: () => void;
  onStartGame: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onStartGame,
  onSkip
}) => {
  const { t, i18n } = useTranslation();
  const { settings } = useGameStore();
  const { isFullscreen, isFullscreenSupported, toggleFullscreen } = useFullscreen();

  const [showLogo, setShowLogo] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 同步語言設定
  useEffect(() => {
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  useEffect(() => {
    // 播放視頻
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.volume = 0; // 視頻靜音，音樂從 AudioManager 播放
          await videoRef.current.play();
        } catch (error) {
          console.warn('啟動視頻播放失敗:', error);
        }
      }
    };

    // 延遲啟動以避免自動播放限制
    const startSequence = async () => {
      // 播放啟動音樂
      audioManager.playTrack('splash');
      await playVideo();

      // 3秒後顯示 logo 和按鈕
      timeoutRef.current = setTimeout(() => {
        setShowLogo(true);
      }, 3000);

      // 1秒後允許跳過
      setTimeout(() => {
        setCanSkip(true);
      }, 1000);
    };

    startSequence();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (!canSkip) return;

    if (!showLogo) {
      // 立即顯示 logo 和按鈕
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowLogo(true);
      if (onSkip) onSkip();
    }
  };

  const handleComplete = () => {
    // 停止視頻
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  const handleVideoEnded = () => {
    // 視頻結束後重新播放（8秒循環）
    if (videoRef.current && !showLogo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.warn);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      onClick={handleClick}
      style={{ cursor: canSkip ? 'pointer' : 'default' }}
    >

      {/* 背景視頻 */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        src="/asset/Remove_the_logo_202509032328.mp4"
      />

      {/* 漸層遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Logo 和按鈕 */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Logo - 更大更突出的設計 */}
            <motion.div className="mb-6">
              <motion.img
                src="/asset/processed_image (1).png"
                alt="FEZ Logo"
                className="w-96 md:w-[28rem] lg:w-[32rem] h-auto mx-auto drop-shadow-2xl"
                initial={{ scale: 0.6, opacity: 0, rotateY: -20 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{
                  duration: 1.5,
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100,
                  damping: 12
                }}
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3)) drop-shadow(0 0 60px rgba(139, 69, 193, 0.4))',
                }}
              />
            </motion.div>

            {/* 標題文字 - 縮小並與Logo形成層次 */}
            <motion.h1
              className="text-3xl md:text-5xl font-bold mb-1 text-white drop-shadow-lg"
              style={{
                fontFamily: '"Cinzel", "Trajan Pro", serif',
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              {t('app.title')}
            </motion.h1>

            {/* 副標題 - 調整間距 */}
            <motion.p
              className="text-lg md:text-xl mb-6 text-gray-200 drop-shadow-lg"
              style={{
                fontFamily: '"Cinzel", "Trajan Pro", serif',
                textShadow: '0 0 10px rgba(255,255,255,0.3)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              {t('app.subtitle')}
            </motion.p>

            {/* 職業說明 - 更緊湊的設計 */}
            <motion.div
              className="grid grid-cols-3 gap-3 text-sm mb-6 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              <motion.div
                className="bg-red-900/30 p-2.5 rounded-lg border border-red-500/30 backdrop-blur-sm hover:bg-red-900/40 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-red-300 font-medium text-xs">⚔️ {t('classes.warrior')}</div>
                <div className="text-xs text-slate-400 mt-1 leading-tight">{t('classCounters.warrior')}</div>
              </motion.div>
              <motion.div
                className="bg-blue-900/30 p-2.5 rounded-lg border border-blue-500/30 backdrop-blur-sm hover:bg-blue-900/40 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-blue-300 font-medium text-xs">🔮 {t('classes.sorcerer')}</div>
                <div className="text-xs text-slate-400 mt-1 leading-tight">{t('classCounters.sorcerer')}</div>
              </motion.div>
              <motion.div
                className="bg-green-900/30 p-2.5 rounded-lg border border-green-500/30 backdrop-blur-sm hover:bg-green-900/40 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-green-300 font-medium text-xs">🏹 {t('classes.scout')}</div>
                <div className="text-xs text-slate-400 mt-1 leading-tight">{t('classCounters.scout')}</div>
              </motion.div>
            </motion.div>

            {/* 遊戲設定顯示 - 更簡潔的設計 */}
            <motion.div
              className="text-sm text-slate-300 mb-6 bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6 }}
            >
              <div className="font-medium mb-1 text-center">{t('settings.title')}</div>
              <div className="text-xs text-slate-400 text-center">
                {t('settings.rounds')}: {settings.maxRounds} | {t('settings.aiDifficulty')}: {t(`difficulty.${settings.aiDifficulty}`)}
              </div>
            </motion.div>

            {/* 主選單按鈕 */}
            <motion.div
              className="space-y-3 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.8 }}
            >
              <Button
                onClick={onStartGame}
                variant="primary"
                size="large"
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 
                           hover:from-blue-500 hover:via-purple-500 hover:to-blue-700
                           border border-white/20"
                style={{
                  fontFamily: '"Cinzel", "Trajan Pro", serif',
                  boxShadow: '0 0 30px rgba(139, 69, 193, 0.6), inset 0 0 20px rgba(255,255,255,0.1)'
                }}
              >
                {t('menu.startGame')}
              </Button>

              <Button
                onClick={() => setShowSettings(true)}
                variant="secondary"
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/10"
                style={{ fontFamily: '"Cinzel", "Trajan Pro", serif' }}
              >
                {t('menu.settings')}
              </Button>

              <Button
                onClick={() => setShowStatistics(true)}
                variant="secondary"
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/10"
                style={{ fontFamily: '"Cinzel", "Trajan Pro", serif' }}
              >
                {t('menu.statistics')}
              </Button>

              <Button
                onClick={() => setShowKeyboardHelp(true)}
                variant="secondary"
                className="w-full text-sm bg-slate-800/50 backdrop-blur-sm border border-white/10"
                style={{ fontFamily: '"Cinzel", "Trajan Pro", serif' }}
              >
                ⌨️ {t('menu.keyboardHelp')}
              </Button>

              {/* 全螢幕按鈕 */}
              {isFullscreenSupported && (
                <Button
                  onClick={toggleFullscreen}
                  variant="secondary"
                  className="w-full text-sm bg-slate-800/50 backdrop-blur-sm border border-white/10"
                  style={{ fontFamily: '"Cinzel", "Trajan Pro", serif' }}
                >
                  {isFullscreen ? `📤 ${t('menu.exitFullscreen')}` : `📺 ${t('menu.fullscreen')}`} (F11)
                </Button>
              )}
            </motion.div>


          </motion.div>
        )}
      </AnimatePresence>

      {/* 跳過提示（Logo 顯示前） */}
      {!showLogo && canSkip && (
        <motion.div
          className="absolute bottom-8 right-8 text-white/70 text-sm cursor-pointer
                     hover:text-white transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
          style={{ fontFamily: '"Cinzel", "Trajan Pro", serif' }}
        >
          點擊任意處跳過動畫
        </motion.div>
      )}

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
    </motion.div>
  );
};