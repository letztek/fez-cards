import React, { useState } from 'react';
import { FlipCard } from '../components/FlipCard';
import { CardClass, Gender } from '../types/card';

export const FlipCardTest: React.FC = () => {
  const [flipStates, setFlipStates] = useState({
    card1: false,
    card2: false,
    card3: false
  });

  const [autoFlipDemo, setAutoFlipDemo] = useState(false);

  // 測試卡牌數據
  const testCards = [
    {
      id: 'test_warrior',
      class: CardClass.WARRIOR,
      gender: Gender.MALE,
      imageUrl: '/cards/warriors/w_m_1.jpg',
      backImageUrl: '/cards/back.jpg',
      name: '勇敢戰士',
      description: '戰士 - 男性'
    },
    {
      id: 'test_mage',
      class: CardClass.MAGE,
      gender: Gender.FEMALE,
      imageUrl: '/cards/mages/m_w_1.jpg',
      backImageUrl: '/cards/back.jpg',
      name: '魔法少女',
      description: '法師 - 女性'
    },
    {
      id: 'test_ranger',
      class: CardClass.RANGER,
      gender: Gender.MALE,
      imageUrl: '/cards/ranger/r_m_1.jpg',
      backImageUrl: '/cards/back.jpg',
      name: '弓箭手',
      description: '遊俠 - 男性'
    }
  ];

  const handleFlip = (cardKey: keyof typeof flipStates) => {
    setFlipStates(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const handleAutoFlipDemo = () => {
    console.log('🎬 開始自動翻轉演示');
    setAutoFlipDemo(true);
    
    // 重置狀態
    setFlipStates({
      card1: false,
      card2: false,
      card3: false
    });

    // 5秒後重置演示
    setTimeout(() => {
      setAutoFlipDemo(false);
      setFlipStates({
        card1: false,
        card2: false,
        card3: false
      });
    }, 8000);
  };

  const handleResetAll = () => {
    setFlipStates({
      card1: false,
      card2: false,
      card3: false
    });
    setAutoFlipDemo(false);
  };

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🎴 3D 卡牌翻轉動畫測試
      </h1>

      {/* 控制按鈕 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => handleFlip('card1')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          翻轉戰士卡
        </button>
        
        <button
          onClick={() => handleFlip('card2')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          翻轉法師卡
        </button>

        <button
          onClick={() => handleFlip('card3')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          翻轉遊俠卡
        </button>

        <button
          onClick={handleAutoFlipDemo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          自動翻轉演示
        </button>

        <button
          onClick={handleResetAll}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          重置全部
        </button>
      </div>

      {/* 卡牌展示區 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '60px',
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px', color: '#ef4444' }}>戰士卡</h3>
          <FlipCard
            card={testCards[0]}
            size="large"
            isFlipped={flipStates.card1}
            autoFlip={autoFlipDemo}
            flipDelay={500}
            onFlipComplete={() => console.log('戰士卡翻轉完成')}
          />
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af' }}>
            {flipStates.card1 ? '正面' : '背面'}
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px', color: '#3b82f6' }}>法師卡</h3>
          <FlipCard
            card={testCards[1]}
            size="large"
            isFlipped={flipStates.card2}
            autoFlip={autoFlipDemo}
            flipDelay={1000}
            onFlipComplete={() => console.log('法師卡翻轉完成')}
          />
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af' }}>
            {flipStates.card2 ? '正面' : '背面'}
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px', color: '#10b981' }}>遊俠卡</h3>
          <FlipCard
            card={testCards[2]}
            size="large"
            isFlipped={flipStates.card3}
            autoFlip={autoFlipDemo}
            flipDelay={1500}
            onFlipComplete={() => console.log('遊俠卡翻轉完成')}
          />
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af' }}>
            {flipStates.card3 ? '正面' : '背面'}
          </p>
        </div>
      </div>

      {/* 說明文字 */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#374151',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <h3 style={{ marginBottom: '15px' }}>🎯 測試功能說明：</h3>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li><strong>手動翻轉</strong>：點擊對應按鈕手動控制卡牌翻轉</li>
          <li><strong>自動翻轉演示</strong>：模擬遊戲中電腦卡牌依序翻轉的效果</li>
          <li><strong>3D 效果</strong>：使用 CSS 3D transform 實現流暢的翻轉動畫</li>
          <li><strong>背面/正面</strong>：自動載入卡牌背面和正面圖片</li>
          <li><strong>響應式尺寸</strong>：支援 small/medium/large 三種尺寸</li>
        </ul>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#4b5563', borderRadius: '4px' }}>
          <strong>💡 注意：</strong>請開啟瀏覽器開發者工具的 Console 標籤，查看翻轉動畫的詳細日誌輸出。
        </div>
      </div>
    </div>
  );
};