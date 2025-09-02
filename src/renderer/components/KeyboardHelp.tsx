import React from 'react';
import { motion } from 'framer-motion';

interface KeyboardHelpProps {
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ onClose }) => {
  const shortcuts = [
    { key: '1-6', description: '選擇對應位置的卡牌' },
    { key: 'Enter / Space', description: '確認戰鬥 / 下一回合' },
    { key: 'Esc', description: '返回上一頁 / 關閉對話框' },
    { key: '↑↓←→', description: '導航選單項目' }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">快捷鍵說明</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-slate-700 rounded text-sm font-mono text-gray-300">
                  {shortcut.key}
                </kbd>
              </div>
              <div className="text-gray-300 text-sm">
                {shortcut.description}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">遊戲提示</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <div>• 使用數字鍵 1-6 快速選擇卡牌</div>
            <div>• 按 Enter 或空白鍵確認操作</div>
            <div>• 按 Esc 鍵可以快速返回或關閉對話框</div>
            <div>• 在遊戲中按 Esc 可以返回主選單</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            知道了
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};