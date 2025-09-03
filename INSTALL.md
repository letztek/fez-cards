# Fez Card Game - 安裝指南

## 📋 系統需求

### macOS
- macOS 10.15 (Catalina) 或更高版本
- Intel Mac 或 Apple Silicon Mac

### Windows
- Windows 10 64位元 或更高版本
- x64 處理器

## 📦 下載檔案

構建完成的應用程序位於 `dist-packages/` 目錄中：

### macOS 版本
- **Intel Mac**: `Fez Card Game-1.0.0.dmg` (163MB)
- **Apple Silicon Mac**: `Fez Card Game-1.0.0-arm64.dmg` (158MB)

### Windows 版本
- **Windows x64**: `Fez Card Game 1.0.0.exe` (94MB)

## 🚀 安裝步驟

### macOS 安裝

1. **下載對應版本**
   ```bash
   # 如果是 Intel Mac，使用：
   # Fez Card Game-1.0.0.dmg
   
   # 如果是 Apple Silicon Mac (M1/M2/M3)，使用：
   # Fez Card Game-1.0.0-arm64.dmg
   ```

2. **安裝應用程序**
   - 雙擊下載的 `.dmg` 文件
   - 將 `Fez Card Game.app` 拖拽到 `Applications` 資料夾
   - 彈出 DMG 映像檔

3. **首次啟動**
   - 從 Launchpad 或 Applications 資料夾啟動遊戲
   - 如果出現安全提示：
     - 前往 `系統偏好設定` > `安全性與隱私權`
     - 點擊 `仍要打開` 按鈕
     - 或者在終端機執行：
       ```bash
       sudo xattr -rd com.apple.quarantine "/Applications/Fez Card Game.app"
       ```

### Windows 安裝

1. **下載執行檔**
   - 下載 `Fez Card Game 1.0.0.exe`

2. **執行應用程序**
   - 雙擊 `.exe` 文件直接執行（免安裝）
   - 首次執行可能會出現 Windows Defender 提示：
     - 點擊 `詳細資訊`
     - 點擊 `仍要執行`

3. **建立捷徑**（可選）
   - 右鍵點擊執行檔
   - 選擇 `傳送到` > `桌面 (建立捷徑)`

## 🎮 遊戲功能

### 核心功能
- ⚔️ 三職業相剋卡牌對戰（戰士、法師、遊俠）
- 🤖 三種 AI 難度（簡單、普通、困難）
- 🌍 多語言支援（中文、英文、日文）
- 📊 詳細遊戲統計
- 🎨 精美的 3D 翻卡動畫
- ⌨️ 完整鍵盤快捷鍵支援

### 遊戲規則
- 戰士 ⚔️ 克制 遊俠 🏹
- 遊俠 🏹 克制 法師 🔮  
- 法師 🔮 克制 戰士 ⚔️

### 快捷鍵
- `1-6`: 選擇卡牌
- `Enter/Space`: 確認戰鬥
- `Esc`: 返回/關閉對話框
- `F11`: 全螢幕切換

## 🛠️ 疑難排解

### macOS 常見問題

**問題**: 提示「無法打開，因為它來自未識別的開發者」
**解決**: 
```bash
# 移除隔離屬性
sudo xattr -rd com.apple.quarantine "/Applications/Fez Card Game.app"
```

**問題**: 遊戲無法啟動
**解決**: 檢查 macOS 版本是否為 10.15 或更高

### Windows 常見問題

**問題**: Windows Defender 阻擋執行
**解決**: 
1. 點擊 `詳細資訊`
2. 點擊 `仍要執行`
3. 或將文件加入 Windows Defender 例外清單

**問題**: 應用程序無法執行
**解決**: 確保系統為 Windows 10 64位元或更高版本

### 通用問題

**問題**: 遊戲卡牌圖片無法顯示
**解決**: 確保應用程序有讀取檔案的權限

**問題**: 統計數據遺失
**解決**: 遊戲數據存放在本地，重新安裝會清除數據

## 📝 版本資訊

- **版本**: 1.0.0 (修復版)
- **建置日期**: 2024年9月3日
- **Electron 版本**: 37.4.0
- **支援平台**: macOS (Intel + Apple Silicon), Windows x64

### 🔧 最新修復 (v1.0.0-fix):
- ✅ 修復白畫面問題：調整 Vite 配置使用相對路徑
- ✅ 修復圖片載入問題：調整卡牌資源路徑配置
- ✅ 優化 Electron 安全設定：允許本地資源載入
- ✅ 完善錯誤處理：增加載入失敗提示

## 🐛 回報問題

如果遇到任何問題，請提供以下資訊：
- 作業系統版本
- 處理器架構 (Intel/Apple Silicon/AMD64)
- 錯誤訊息截圖
- 重現步驟

## 🎯 開發者資訊

此應用程序使用以下技術棧：
- **前端**: React + TypeScript + Tailwind CSS
- **動畫**: Framer Motion
- **狀態管理**: Zustand
- **國際化**: React i18next
- **桌面框架**: Electron
- **建置工具**: Electron Builder

---

🎮 **享受 Fez Card Game！** 🎮