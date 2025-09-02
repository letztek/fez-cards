import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { imagePreloader } from '../utils/image-preloader';

interface PerformanceStats {
  imagesCached: number;
  memoryUsage: string;
  renderTime: number;
  fps: number;
}

interface PerformanceMonitorProps {
  show?: boolean;
  onClose?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  show = false, 
  onClose 
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    imagesCached: 0,
    memoryUsage: '0 MB',
    renderTime: 0,
    fps: 0
  });

  const [renderStart, setRenderStart] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(Date.now());

  useEffect(() => {
    if (!show) return;

    const updateStats = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      
      // 更新 FPS 計算
      setFrameCount(prev => prev + 1);
      
      if (deltaTime >= 1000) { // 每秒更新一次
        const currentFPS = Math.round((frameCount * 1000) / deltaTime);
        
        const memoryBytes = imagePreloader.getMemoryUsageEstimate();
        const memoryMB = (memoryBytes / (1024 * 1024)).toFixed(2);
        
        const currentRenderTime = performance.now() - renderStart;
        
        setStats({
          imagesCached: imagePreloader.getCacheSize(),
          memoryUsage: `${memoryMB} MB`,
          renderTime: Math.round(currentRenderTime * 100) / 100,
          fps: currentFPS
        });
        
        setFrameCount(0);
        setLastTime(now);
      }
      
      requestAnimationFrame(updateStats);
    };

    setRenderStart(performance.now());
    updateStats();
    
  }, [show, frameCount, lastTime, renderStart]);

  const getMemoryUsageColor = () => {
    const memoryMB = parseFloat(stats.memoryUsage);
    if (memoryMB > 100) return 'text-red-400';
    if (memoryMB > 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getFPSColor = () => {
    if (stats.fps < 30) return 'text-red-400';
    if (stats.fps < 45) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (!show) return null;

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-sm"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold">效能監控</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>快取圖片:</span>
          <span className="text-blue-400">{stats.imagesCached}</span>
        </div>
        
        <div className="flex justify-between">
          <span>記憶體使用:</span>
          <span className={getMemoryUsageColor()}>{stats.memoryUsage}</span>
        </div>
        
        <div className="flex justify-between">
          <span>渲染時間:</span>
          <span className="text-purple-400">{stats.renderTime}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={getFPSColor()}>{stats.fps}</span>
        </div>
      </div>
      
      {/* 記憶體使用進度條 */}
      <div className="mt-3">
        <div className="text-xs text-gray-400 mb-1">記憶體使用量</div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              parseFloat(stats.memoryUsage) > 100 ? 'bg-red-500' :
              parseFloat(stats.memoryUsage) > 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min(100, (parseFloat(stats.memoryUsage) / 200) * 100)}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      {/* 效能建議 */}
      {parseFloat(stats.memoryUsage) > 100 && (
        <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-xs">
          <span className="text-red-400">⚠️ 記憶體使用量偏高</span>
        </div>
      )}
      
      {stats.fps < 30 && (
        <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-500/50 rounded text-xs">
          <span className="text-yellow-400">⚠️ FPS 偏低，可能影響使用體驗</span>
        </div>
      )}
    </motion.div>
  );
};