import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

let mainWindow;

const startServer = async () => {
    // In production (bundled), we should ignore the port from execute.bat (5000)
    // and rely on server.js default (3000).
    // Ensure the PORT env var isn't set to 5000 from npm run if we are in production build?
    // Actually, process.env.PORT might be set if we run via npm scripts.
    // But for the packaged app (exe), it won't be set.
    
    const serverPath = path.join(__dirname, 'server.js');
    console.log('Starting server in-process from:', serverPath);

    try {
        // Dynamic import to execute the server module
        // We use string concatenation to ensure webpack/vite doesn't try to bundle it weirdly if it were a static import?
        // Actually Electron doesn't bundle with Webpack here, it runs native V8.
        await import('./server.js');
        console.log('Server started successfully.');
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    title: "Quiz Live",
  });
  
  if (isDev) {
      // In dev mode via execute.bat, frontend is 5000
      mainWindow.loadURL('http://localhost:5000');
      mainWindow.webContents.openDevTools();
  } else {
      // In production, load the built index.html
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
};

app.whenReady().then(() => {
    startServer();
    
    setTimeout(createWindow, 500); 

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


