import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onSkip
}) => {
  const [showLogo, setShowLogo] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 啟動音樂（如果可用）
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.6; // 設置音量為60%
          await audioRef.current.play();
        } catch (error) {
          console.warn('背景音樂播放失敗:', error);
        }
      }
    };

    // 播放視頻
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.volume = 0; // 視頻靜音，音樂從 audio 元素播放
          await videoRef.current.play();
        } catch (error) {
          console.warn('啟動視頻播放失敗:', error);
        }
      }
    };

    // 延遲啟動以避免自動播放限制
    const startSequence = async () => {
      await Promise.all([playAudio(), playVideo()]);
      
      // 10秒後顯示 logo 和按鈕
      timeoutRef.current = setTimeout(() => {
        setShowLogo(true);
      }, 10000);

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
      // 清理音頻
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleClick = () => {
    if (!canSkip) return;
    
    if (showLogo) {
      // Logo 已顯示，可以進入遊戲
      handleComplete();
    } else {
      // 立即顯示 logo 和按鈕
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowLogo(true);
      if (onSkip) onSkip();
    }
  };

  const handleComplete = () => {
    // 停止音樂和視頻
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
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
      {/* 背景音樂 */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="/asset/Fantasy Earth Zero Soundtrack/m01.mp3"
      />

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
            {/* Logo */}
            <motion.img
              src="/asset/processed_image (1).png"
              alt="FEZ Logo"
              className="w-64 h-auto mx-auto mb-8 drop-shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />

            {/* 標題文字 */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-8 text-white drop-shadow-lg"
              style={{
                fontFamily: '"Cinzel", "Trajan Pro", serif',
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Fantasy Earth Zero
            </motion.h1>

            {/* 副標題 */}
            <motion.p
              className="text-xl md:text-2xl mb-12 text-gray-200 drop-shadow-lg"
              style={{
                fontFamily: '"Cinzel", "Trajan Pro", serif',
                textShadow: '0 0 10px rgba(255,255,255,0.3)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              Card Battle Arena
            </motion.p>

            {/* 開始按鈕 */}
            <motion.button
              onClick={handleComplete}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 
                         text-white font-bold text-xl rounded-lg shadow-2xl
                         hover:from-blue-500 hover:via-purple-500 hover:to-blue-700
                         transform hover:scale-105 transition-all duration-300
                         border border-white/20"
              style={{
                fontFamily: '"Cinzel", "Trajan Pro", serif',
                boxShadow: '0 0 30px rgba(139, 69, 193, 0.6), inset 0 0 20px rgba(255,255,255,0.1)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 1.6,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.08,
                boxShadow: "0 0 40px rgba(139, 69, 193, 0.8)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              進入遊戲
            </motion.button>

            {/* 跳過提示 */}
            {!showLogo && canSkip && (
              <motion.div
                className="absolute bottom-8 right-8 text-white/70 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ fontFamily: '"Cinzel", "Trajan Pro", serif' }}
              >
                點擊任意處跳過
              </motion.div>
            )}
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
    </motion.div>
  );
};