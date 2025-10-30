// src/App.tsx
import React, { useState } from 'react'
import { AppProvider } from './contexts/AppContext'
import { Settings } from './components/Settings'
import { Upload } from './components/Upload'
import { Scenario } from './components/Scenario'
import { Render } from './components/Render'
import './App.css'

type Tab = 'settings' | 'upload' | 'scenario' | 'render'

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('settings')

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="app-header">
        <div className="app-title">
          <h1>🎓 졸업영상 자동 제작 프로그램</h1>
          <p>AI 기반 초등학교 졸업영상 자동 편집 시스템</p>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <nav className="tab-nav">
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ 설정
        </button>
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 파일 업로드
        </button>
        <button
          className={`tab-button ${activeTab === 'scenario' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenario')}
        >
          🎬 시나리오 생성
        </button>
        <button
          className={`tab-button ${activeTab === 'render' ? 'active' : ''}`}
          onClick={() => setActiveTab('render')}
        >
          🎥 렌더링
        </button>
      </nav>

      {/* 탭 콘텐츠 */}
      <main className="app-content">
        {activeTab === 'settings' && <Settings onNext={() => setActiveTab('upload')} />}
        {activeTab === 'upload' && <Upload onNext={() => setActiveTab('scenario')} />}
        {activeTab === 'scenario' && <Scenario onNext={() => setActiveTab('render')} />}
        {activeTab === 'render' && <Render />}
      </main>

      {/* 푸터 */}
      <footer className="app-footer">
        <p>v1.0.0 | Made with React + Electron + Python + AI</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
