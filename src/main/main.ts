import { app, BrowserWindow, shell, ipcMain, protocol, screen } from 'electron';
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

// Display Settings API
ipcMain.handle('display:get-all-displays', () => {
  return screen.getAllDisplays().map(display => ({
    id: display.id,
    label: display.label,
    bounds: display.bounds,
    size: display.size,
    workAreaSize: display.workAreaSize,
    scaleFactor: display.scaleFactor,
    primary: display.internal ?? false
  }));
});

ipcMain.handle('display:get-primary-display', () => {
  const display = screen.getPrimaryDisplay();
  return {
    id: display.id,
    label: display.label,
    bounds: display.bounds,
    size: display.size,
    workAreaSize: display.workAreaSize,
    scaleFactor: display.scaleFactor,
    primary: true
  };
});

ipcMain.handle('window:set-fullscreen', (_, fullscreen: boolean) => {
  if (win) {
    win.setFullScreen(fullscreen);
    return win.isFullScreen();
  }
  return false;
});

ipcMain.handle('window:is-fullscreen', () => {
  return win?.isFullScreen() ?? false;
});

ipcMain.handle('window:set-size', (_, width: number, height: number) => {
  if (win) {
    win.setSize(width, height);
    const [currentWidth, currentHeight] = win.getSize();
    return { width: currentWidth, height: currentHeight };
  }
  return null;
});

ipcMain.handle('window:get-size', () => {
  if (win) {
    const [width, height] = win.getSize();
    return { width, height };
  }
  return null;
});

ipcMain.handle('window:center', () => {
  if (win) {
    win.center();
    return true;
  }
  return false;
});

ipcMain.handle('window:set-resizable', (_, resizable: boolean) => {
  if (win) {
    win.setResizable(resizable);
    return win.isResizable();
  }
  return false;
});

ipcMain.handle('window:maximize', () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    return win.isMaximized();
  }
  return false;
});

ipcMain.handle('window:minimize', () => {
  if (win) {
    win.minimize();
    return true;
  }
  return false;
});

// Settings Sync API
let appSettings: any = {};

ipcMain.handle('settings:sync-from-renderer', (_, settings) => {
  appSettings = settings;
  return true;
});

ipcMain.handle('settings:get-from-main', () => {
  return appSettings;
});

// System Volume API (limited cross-platform support)
ipcMain.handle('system:get-volume', async () => {
  // Note: System volume control requires platform-specific implementation
  // This is a placeholder for future platform-specific modules
  try {
    if (process.platform === 'darwin') {
      // macOS system volume would require osascript or native module
      return { supported: false, volume: 0, reason: 'macOS system volume requires additional implementation' };
    } else if (process.platform === 'win32') {
      // Windows system volume would require Windows API or native module
      return { supported: false, volume: 0, reason: 'Windows system volume requires additional implementation' };
    } else {
      return { supported: false, volume: 0, reason: 'Platform not supported' };
    }
  } catch (error) {
    return { supported: false, volume: 0, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('system:set-volume', async (_, volume: number) => {
  // Note: System volume control requires platform-specific implementation
  try {
    if (process.platform === 'darwin') {
      return { success: false, reason: 'macOS system volume requires additional implementation' };
    } else if (process.platform === 'win32') {
      return { success: false, reason: 'Windows system volume requires additional implementation' };
    } else {
      return { success: false, reason: 'Platform not supported' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});