// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'
import { AppSettings, IPCResponse } from '../src/types'

// Electron API를 렌더러 프로세스에 안전하게 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 설정 관련
  settings: {
    save: (settings: AppSettings): Promise<IPCResponse> =>
      ipcRenderer.invoke('settings:save', settings),
    load: (): Promise<IPCResponse<AppSettings>> =>
      ipcRenderer.invoke('settings:load')
  },

  // 파일 대화상자
  dialog: {
    openFile: (options: any): Promise<IPCResponse> =>
      ipcRenderer.invoke('dialog:openFile', options),
    openDirectory: (): Promise<IPCResponse> =>
      ipcRenderer.invoke('dialog:openDirectory')
  },

  // Python 백엔드
  python: {
    start: (): Promise<IPCResponse> =>
      ipcRenderer.invoke('python:start'),
    stop: (): Promise<IPCResponse> =>
      ipcRenderer.invoke('python:stop'),
    generateScenario: (data: any): Promise<IPCResponse> =>
      ipcRenderer.invoke('python:generateScenario', data),
    renderVideo: (data: any): Promise<IPCResponse> =>
      ipcRenderer.invoke('python:renderVideo', data)
  },

  // 렌더링 진행률 구독
  onRenderProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('render:progress', (event, progress) => callback(progress))
  },

  // 구독 해제
  removeRenderProgressListener: () => {
    ipcRenderer.removeAllListeners('render:progress')
  }
})

// TypeScript용 타입 선언
declare global {
  interface Window {
    electronAPI: {
      settings: {
        save: (settings: AppSettings) => Promise<IPCResponse>
        load: () => Promise<IPCResponse<AppSettings>>
      }
      dialog: {
        openFile: (options: any) => Promise<IPCResponse>
        openDirectory: () => Promise<IPCResponse>
      }
      python: {
        start: () => Promise<IPCResponse>
        stop: () => Promise<IPCResponse>
        generateScenario: (data: any) => Promise<IPCResponse>
        renderVideo: (data: any) => Promise<IPCResponse>
      }
      onRenderProgress: (callback: (progress: any) => void) => void
      removeRenderProgressListener: () => void
    }
  }
}
