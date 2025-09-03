import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import * as path from 'path';
import * as os from 'os';

// __dirname is available globally in CommonJS, no need to define it

// The built directory structure
//
// ├─┬ dist
// │ ├─┬ main
// │ │ └── main.js    > Electron-Main
// │ ├─┬ preload
// │ │ └── preload.js > Preload-Scripts
// │ └─┬ renderer
// │   └── index.html > Electron-Renderer
//
// 根據是否為開發環境設置路徑
const isDev = process.env.VITE_DEV_SERVER_URL;
process.env.DIST_ELECTRON = __dirname;

if (isDev) {
  // 開發環境路徑
  process.env.DIST = path.join(__dirname, '../../dist/renderer');
  process.env.VITE_PUBLIC = path.join(__dirname, '../../src/renderer/public');
} else {
  // 打包環境路徑
  process.env.DIST = path.join(__dirname, '../renderer');
  process.env.VITE_PUBLIC = path.join(process.resourcesPath || __dirname, 'public');
}

// Disable GPU Acceleration for Windows 7
if (process.platform === 'win32' && os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This is only for development, for production builds the CSP will prevent this
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/preload.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST || '', 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'Fez Card Game',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload,
      // 使用安全的配置
      nodeIntegration: false,
      contextIsolation: true,
      // 允許載入本地文件（為了載入遊戲資源）
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url!);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    // 添加錯誤處理
    console.log('Loading index.html from:', indexHtml);
    win.loadFile(indexHtml).catch((err) => {
      console.error('Failed to load index.html:', err);
    });
  }
  
  // 添加載入失敗處理
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', { errorCode, errorDescription, validatedURL });
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Auto-hide menu bar
  win.setMenuBarVisibility(false);
}

// 註冊自定義協議必須在 app.ready 之前
app.setAsDefaultProtocolClient('fez-card');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});