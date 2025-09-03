import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface KeyboardHelpProps {
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ onClose }) => {
  const { t } = useTranslation();
  
  const shortcuts = [
    { key: '1-6', description: t('keyboard.selectCard') },
    { key: 'Enter / Space', description: t('keyboard.confirm') },
    { key: 'Esc', description: t('keyboard.back') },
    { key: 'F11', description: t('menu.fullscreen') }
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
          <h2 className="text-2xl font-bold text-white">{t('keyboard.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label={t('keyboard.close')}
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

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            {t('keyboard.close')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};