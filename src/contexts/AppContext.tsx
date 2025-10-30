// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppSettings, Scenario, RenderProgress, UploadedFiles } from '../types'

interface AppContextType {
  // 설정
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>
  loadSettings: () => Promise<void>

  // 업로드된 파일
  uploadedFiles: UploadedFiles
  setUploadedFiles: (files: UploadedFiles) => void

  // 시나리오
  scenario: Scenario | null
  setScenario: (scenario: Scenario | null) => void

  // 렌더링 진행률
  renderProgress: RenderProgress | null
  setRenderProgress: (progress: RenderProgress | null) => void

  // 로딩 상태
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // 에러
  error: string | null
  setError: (error: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: '',
    schoolName: '',
    renderPreset: 'high',
    useFlux: false
  })

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    groupPhotos: [],
    videos: [],
    studentExcel: null,
    babyPhotos: [],
    idPhotos: []
  })

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 설정 불러오기
  const loadSettings = async () => {
    try {
      const response = await window.electronAPI.settings.load()
      if (response.success && response.data) {
        setSettings(response.data)
      }
    } catch (err) {
      console.error('설정 불러오기 실패:', err)
      setError('설정을 불러올 수 없습니다.')
    }
  }

  // 설정 업데이트
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      const response = await window.electronAPI.settings.save(updated)
      if (!response.success) {
        throw new Error(response.error || '설정 저장 실패')
      }
    } catch (err) {
      console.error('설정 저장 실패:', err)
      setError('설정을 저장할 수 없습니다.')
    }
  }

  // 컴포넌트 마운트 시 설정 불러오기
  useEffect(() => {
    loadSettings()

    // 렌더링 진행률 구독
    window.electronAPI.onRenderProgress((progress) => {
      setRenderProgress(progress)
    })

    return () => {
      window.electronAPI.removeRenderProgressListener()
    }
  }, [])

  const value: AppContextType = {
    settings,
    updateSettings,
    loadSettings,
    uploadedFiles,
    setUploadedFiles,
    scenario,
    setScenario,
    renderProgress,
    setRenderProgress,
    isLoading,
    setIsLoading,
    error,
    setError
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Context Hook
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
