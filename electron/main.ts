// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import Store from 'electron-store'
import { AppSettings } from '../src/types'

// Electron Store 초기화
const store = new Store<AppSettings>({
  defaults: {
    geminiApiKey: '',
    schoolName: '',
    renderPreset: 'high',
    useFlux: false
  }
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: '졸업영상 자동 제작 프로그램',
    icon: path.join(__dirname, '../resources/icon.png')
  })

  // 개발 모드
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // 프로덕션 모드
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 앱 준비 완료
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 모든 창이 닫혔을 때
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ============================================
// IPC 핸들러
// ============================================

// 설정 저장
ipcMain.handle('settings:save', async (event, settings: AppSettings) => {
  try {
    store.set(settings)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '설정 저장 실패'
    }
  }
})

// 설정 불러오기
ipcMain.handle('settings:load', async () => {
  try {
    const settings = store.store
    return { success: true, data: settings }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '설정 불러오기 실패'
    }
  }
})

// 파일 선택 대화상자
ipcMain.handle('dialog:openFile', async (event, options) => {
  const { dialog } = require('electron')
  try {
    const result = await dialog.showOpenDialog(mainWindow!, options)
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '파일 선택 실패'
    }
  }
})

// 폴더 선택 대화상자
ipcMain.handle('dialog:openDirectory', async () => {
  const { dialog } = require('electron')
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory']
    })
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '폴더 선택 실패'
    }
  }
})

// Python 프로세스 관리 (추후 구현)
ipcMain.handle('python:start', async () => {
  // TODO: Python 프로세스 시작
  return { success: true, data: 'Python 프로세스 시작됨' }
})

ipcMain.handle('python:stop', async () => {
  // TODO: Python 프로세스 종료
  return { success: true, data: 'Python 프로세스 종료됨' }
})

// Gemini 시나리오 생성 (추후 구현)
ipcMain.handle('python:generateScenario', async (event, data) => {
  // TODO: Python 백엔드로 전달
  return {
    success: false,
    error: '아직 구현되지 않음'
  }
})

// 영상 렌더링 (추후 구현)
ipcMain.handle('python:renderVideo', async (event, data) => {
  // TODO: Python 백엔드로 전달
  return {
    success: false,
    error: '아직 구현되지 않음'
  }
})

console.log('Electron 메인 프로세스 시작됨')
