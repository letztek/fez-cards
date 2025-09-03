# Fez Card Game 🃏

一個基於 Electron + React + TypeScript 的桌面卡牌對戰遊戲，採用三職業相剋機制的回合制策略玩法。

![Game Screenshot](docs/screenshot.png)

## 🎮 遊戲特色

- **三職業相剋系統**：戰士 ⚔️ 克制遊俠，法師 🔮 克制戰士，遊俠 🏹 克制法師
- **精美卡牌設計**：18張獨特角色卡牌，每個職業包含3張男性和3張女性角色
- **智能AI對手**：提供簡單、普通、困難三種難度，從隨機策略到進階分析
- **流暢動畫效果**：使用 Framer Motion 打造的卡牌翻轉和戰鬥動畫
- **遊戲設定系統**：可調整回合數、AI 難度、語言和主題偏好
- **統計追蹤功能**：詳細的戰績統計、職業使用分析和戰鬥歷史
- **快捷鍵支援**：完整的鍵盤操作，數字鍵選牌、Enter確認、Esc返回
- **本地資料儲存**：設定和統計資料自動保存，重啟後保持
- **響應式設計**：支援不同螢幕尺寸，完美適配桌面環境
- **跨平台支援**：支援 Windows、macOS、Linux 三大作業系統

## 🎯 遊戲規則

### 基本玩法
1. 遊戲開始時，玩家和電腦各獲得6張隨機卡牌
2. 每回合玩家選擇一張卡牌與電腦卡牌對戰
3. 根據職業相剋關係決定勝負：
   - 戰士 ⚔️ > 遊俠 🏹
   - 法師 🔮 > 戰士 ⚔️  
   - 遊俠 🏹 > 法師 🔮
   - 相同職業 = 平手
4. 6回合後統計勝場數決定最終勝負

### 職業介紹
- **戰士 (Warrior)**：近戰專家，擅長物理攻擊
- **法師 (Mage)**：魔法使用者，掌握元素力量
- **遊俠 (Ranger)**：遠程射手，靈活且精準

## 🚀 快速開始

### 系統需求
- Node.js 16.0 或更高版本
- npm 或 yarn 套件管理器
- 支援的作業系統：Windows 10+、macOS 10.14+、Ubuntu 18.04+

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/letztek/fez-cards.git
cd fez-cards
```

2. **安裝依賴**
```bash
npm install
```

3. **啟動開發模式**
```bash
npm run dev
```

4. **建置應用程式**
```bash
# 建置所有平台
npm run build

# 打包為可執行檔
npm run dist
```

## 🛠️ 技術架構

### 前端技術棧
- **Electron**: 跨平台桌面應用框架
- **React 19**: 使用者介面函式庫
- **TypeScript**: 型別安全的 JavaScript
- **Tailwind CSS**: 實用優先的 CSS 框架
- **Framer Motion**: 動畫和手勢函式庫
- **Zustand**: 輕量級狀態管理

### 專案結構
```
fez-cards/
├── src/
│   ├── main/                 # Electron 主程序
│   ├── preload/             # 預載腳本
│   └── renderer/            # React 渲染程序
│       ├── components/      # React 組件
│       ├── stores/          # 狀態管理
│       ├── types/           # TypeScript 型別定義
│       ├── utils/           # 工具函數
│       └── public/          # 靜態資源
│           └── cards/       # 卡牌圖片資源
├── dist/                    # 建置輸出
└── docs/                    # 文檔資料
```

## 🎨 開發指南

### 可用腳本

```bash
# 開發模式（熱重載）
npm run dev

# 建置渲染程序
npm run build:renderer

# 建置主程序
npm run build:main

# 完整建置
npm run build

# 程式碼檢查
npm run lint

# 程式碼格式化
npm run format

# 打包應用程式
npm run pack

# 建置發布版本
npm run dist
```

### 新增卡牌

1. 將卡牌圖片放入對應職業資料夾：
   ```
   src/renderer/public/cards/
   ├── warrior/     # 戰士卡牌
   ├── mage/        # 法師卡牌
   └── ranger/      # 遊俠卡牌
   ```

2. 更新卡牌配置檔案：
   ```typescript
   // src/renderer/utils/card-loader.ts
   ```

### 自訂遊戲規則

遊戲規則可在 `src/renderer/stores/game-store.ts` 中調整：

```typescript
const DEFAULT_SETTINGS: GameSettings = {
  maxRounds: 6,        // 最大回合數
  aiDifficulty: 'normal', // AI 難度
  language: 'zh',      // 介面語言
  theme: 'dark'        // 主題樣式
};
```

## 🐛 除錯功能

遊戲內建除錯工具，可在開發模式下使用：

- **圖片測試**：檢查卡牌圖片載入狀況
- **遊戲除錯**：監控遊戲狀態變化
- **控制台輸出**：詳細的狀態日誌

## 📦 建置和發布

### 開發建置
```bash
npm run build
```

### 生產建置
```bash
npm run dist
```

建置完成後，可執行檔案將位於 `dist/` 資料夾中。

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 ISC 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- 卡牌圖片素材來源：[來源說明]
- 特別感謝所有貢獻者和測試者

## 📞 聯絡資訊

- 專案維護者：HollyPai
- Email：haochunpai@gmail.com]
- 專案首頁：https://github.com/letztek/fez-cards

---

⭐ 如果這個專案對你有幫助，請給我們一個星星！