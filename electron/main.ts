// electron/main.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'
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
let pythonProcess: ChildProcess | null = null

// Python 프로세스 관리
class PythonBridge {
  private process: ChildProcess | null = null
  private messageQueue: Map<number, { resolve: Function; reject: Function }> = new Map()
  private messageId = 0

  start() {
    if (this.process) {
      console.log('[Python] 이미 실행 중입니다')
      return
    }

    const pythonPath = 'python' // 시스템 Python 사용
    const scriptPath = path.join(__dirname, '../python/main.py')

    console.log('[Python] 프로세스 시작:', scriptPath)

    this.process = spawn(pythonPath, [scriptPath], {
      cwd: path.join(__dirname, '../python'),
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    })

    // stdout 처리 (JSON 응답)
    this.process.stdout?.on('data', (data) => {
      const lines = data.toString().split('\n').filter((line: string) => line.trim())

      for (const line of lines) {
        try {
          const response = JSON.parse(line)

          // 진행률 업데이트
          if (response.type === 'progress') {
            mainWindow?.webContents.send('render:progress', response.data)
            continue
          }

          // 일반 응답 처리 (TODO: messageId 매칭 로직 추가 필요)
          const callbacks = Array.from(this.messageQueue.values())
          if (callbacks.length > 0) {
            const { resolve } = callbacks[0]
            this.messageQueue.clear()
            resolve(response)
          }
        } catch (e) {
          console.error('[Python] JSON 파싱 오류:', line)
        }
      }
    })

    // stderr 처리 (로그)
    this.process.stderr?.on('data', (data) => {
      console.log('[Python stderr]', data.toString())
    })

    // 프로세스 종료
    this.process.on('close', (code) => {
      console.log(`[Python] 프로세스 종료됨 (코드: ${code})`)
      this.process = null

      // 대기 중인 프로미스 모두 거부
      this.messageQueue.forEach(({ reject }) => {
        reject(new Error('Python 프로세스가 종료되었습니다'))
      })
      this.messageQueue.clear()
    })
  }

  stop() {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }

  async call(command: string, data: any): Promise<any> {
    if (!this.process) {
      this.start()
      // 프로세스 시작 대기
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return new Promise((resolve, reject) => {
      const msgId = this.messageId++
      this.messageQueue.set(msgId, { resolve, reject })

      const message = JSON.stringify({ command, data })
      this.process?.stdin?.write(message + '\n')

      // 타임아웃 (60초)
      setTimeout(() => {
        if (this.messageQueue.has(msgId)) {
          this.messageQueue.delete(msgId)
          reject(new Error('Python 응답 타임아웃'))
        }
      }, 60000)
    })
  }
}

const pythonBridge = new PythonBridge()

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
    pythonBridge.stop()
  })
}

// 앱 준비 완료
app.whenReady().then(() => {
  createWindow()
  pythonBridge.start()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 모든 창이 닫혔을 때
app.on('window-all-closed', () => {
  pythonBridge.stop()
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

// Gemini 시나리오 생성
ipcMain.handle('python:generateScenario', async (event, data) => {
  try {
    const response = await pythonBridge.call('generate_scenario', data)
    return response
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '시나리오 생성 실패'
    }
  }
})

// 영상 렌더링
ipcMain.handle('python:renderVideo', async (event, data) => {
  try {
    const response = await pythonBridge.call('render_video', data)
    return response
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '렌더링 실패'
    }
  }
})

// Python 프로세스 상태 확인
ipcMain.handle('python:ping', async () => {
  try {
    const response = await pythonBridge.call('ping', {})
    return response
  } catch (error) {
    return {
      success: false,
      error: 'Python 프로세스 응답 없음'
    }
  }
})

console.log('[Electron] 메인 프로세스 시작됨')
