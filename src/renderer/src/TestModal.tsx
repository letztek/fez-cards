import React from 'react';
import { motion } from 'framer-motion';

interface TestModalProps {
  onClose: () => void;
  title: string;
}

export const TestModal: React.FC<TestModalProps> = ({ onClose, title }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        // 點擊背景關閉
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="text-white space-y-4">
          <p>這是一個測試模態窗口。</p>
          <p>如果你能看到這個訊息，說明模態窗口可以正常顯示。</p>
          <p>原本的組件可能有以下問題：</p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>組件內部 JavaScript 錯誤</li>
            <li>依賴的數據或方法不存在</li>
            <li>CSS 樣式問題</li>
            <li>渲染邏輯錯誤</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            關閉
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};