import React, { useState } from 'react';

export const ButtonTest: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
//     console.log('按鈕被點擊了！', clickCount);
    setClickCount(prev => prev + 1);
    alert(`按鈕被點擊了 ${clickCount + 1} 次！`);
  };

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1>按鈕測試頁面</h1>
      <p>點擊次數: {clickCount}</p>
      
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '20px auto' }}>
        <button
          onClick={handleClick}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          簡單按鈕測試
        </button>

        <button
          onClick={() => {
//             console.log('設定按鈕被點擊');
            alert('這是模擬的設定按鈕');
          }}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          模擬設定按鈕
        </button>

        <button
          onClick={() => {
//             console.log('統計按鈕被點擊');
            alert('這是模擬的統計按鈕');
          }}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          模擬統計按鈕
        </button>
      </div>
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#888' }}>
        <p>如果這些按鈕能正常工作，說明基本的點擊事件沒問題</p>
        <p>請檢查瀏覽器控制台是否有 JavaScript 錯誤</p>
      </div>
    </div>
  );
};