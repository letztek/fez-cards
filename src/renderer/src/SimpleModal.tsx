import React from 'react';

interface SimpleModalProps {
  onClose: () => void;
  title: string;
}

export const SimpleModal: React.FC<SimpleModalProps> = ({ onClose, title }) => {
  console.log('SimpleModal 正在渲染，title:', title);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontSize: '16px'
      }}
      onClick={(e) => {
        console.log('背景被點擊');
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: '#374151',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          color: 'white',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => {
          console.log('模態內容被點擊');
          e.stopPropagation();
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px',
          borderBottom: '1px solid #4B5563',
          paddingBottom: '12px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: 0,
            color: '#F3F4F6'
          }}>
            {title}
          </h2>
          <button
            onClick={() => {
              console.log('關閉按鈕被點擊');
              onClose();
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.color = '#F3F4F6';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.color = '#9CA3AF';
            }}
          >
            ×
          </button>
        </div>

        <div style={{ lineHeight: '1.6', color: '#E5E7EB' }}>
          <p style={{ marginBottom: '16px' }}>
            <strong>🎯 簡單模態窗口測試</strong>
          </p>
          <p style={{ marginBottom: '12px' }}>
            如果你能看到這個訊息，說明基本的模態窗口可以工作。
          </p>
          <p style={{ marginBottom: '12px' }}>
            這個模態窗口：
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>沒有使用 Framer Motion</li>
            <li>使用最高的 z-index (9999)</li>
            <li>使用純 CSS 樣式</li>
            <li>有詳細的控制台日誌</li>
          </ul>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
            請檢查瀏覽器控制台的日誌輸出。
          </p>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={() => {
              console.log('確定按鈕被點擊');
              onClose();
            }}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3B82F6';
            }}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
};