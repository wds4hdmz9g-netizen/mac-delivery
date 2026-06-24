/**
 * 矩阵内容工厂 — Electron 主进程
 * 
 * 启动时自动加载 server.js 启 Express 服务，然后打开桌面窗口。
 */
const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 3460;

// ===== 标记 Electron 环境 =====
process.env.ELECTRON_RUN = 'true';

// ===== 确保 FFmpeg 路径 =====
const ffmpegPath = path.join(__dirname, '.ffmpeg', 'ffmpeg.exe');
if (fs.existsSync(ffmpegPath) && !process.env.FFMPEG_PATH) {
  process.env.FFMPEG_PATH = ffmpegPath;
}

// ===== 启动后端 Express 服务 =====
let server = null;

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const srvModule = require('./server.js');
      server = srvModule.server;
      
      console.log('[Electron] 服务器模块已加载，轮询等待就绪...');
      
      let attempts = 0;
      const maxAttempts = 30;
      const check = setInterval(() => {
        attempts++;
        const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
          clearInterval(check);
          console.log('[Electron] ✓ 服务已就绪');
          resolve();
        });
        req.on('error', () => {
          if (attempts >= maxAttempts) {
            clearInterval(check);
            console.log('[Electron] 轮询超时，跳过健康检查直接启动');
            resolve();
          }
        });
        req.setTimeout(1000, () => {
          req.destroy();
          if (attempts >= maxAttempts) {
            clearInterval(check);
            resolve();
          }
        });
      }, 500);
      
    } catch (err) {
      reject(err);
    }
  });
}

function stopServer() {
  if (server) {
    try { server.close(); } catch {}
    server = null;
  }
}

// ===== 创建主窗口 =====
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '矩阵内容工厂',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.setMenuBarVisibility(false);
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  mainWindow.loadURL(`http://localhost:${PORT}`);
}

// ===== 应用生命周期 =====
app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
    
    console.log('[Electron] ✓ 矩阵内容工厂启动完成');
  } catch (err) {
    console.error('[Electron] ✗ 启动失败:', err.message);
    dialog.showErrorBox(
      '启动失败',
      '无法启动服务：' + err.message + '\n\n请确认：\n1. 没有其他程序占用 3460 端口\n2. .ffmpeg 文件夹完整'
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  stopServer();
  app.quit();
});

app.on('before-quit', () => {
  stopServer();
});

// 防止多实例
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
