// src/components/Settings.tsx
import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import './Settings.css'

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useApp()
  const [localSettings, setLocalSettings] = useState(settings)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // 로컬 상태 업데이트
  const handleChange = (field: keyof typeof settings, value: any) => {
    const updated = { ...localSettings, [field]: value }
    setLocalSettings(updated)

    // 자동 저장 (500ms 디바운스)
    setSaveStatus('saving')
    setTimeout(async () => {
      await updateSettings({ [field]: value })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 500)
  }

  // 파일 선택 (로고)
  const handleLogoSelect = async () => {
    const result = await window.electronAPI.dialog.openFile({
      title: '학교 로고 선택',
      filters: [
        { name: '이미지', extensions: ['png', 'jpg', 'jpeg'] }
      ],
      properties: ['openFile']
    })

    if (result.success && result.data && !result.data.canceled) {
      const filePath = result.data.filePaths[0]
      handleChange('schoolLogo', filePath)
    }
  }

  // 파일 선택 (배경음악)
  const handleMusicSelect = async () => {
    const result = await window.electronAPI.dialog.openFile({
      title: '배경음악 선택',
      filters: [
        { name: '오디오', extensions: ['mp3', 'wav'] }
      ],
      properties: ['openFile']
    })

    if (result.success && result.data && !result.data.canceled) {
      const filePath = result.data.filePaths[0]
      handleChange('backgroundMusic', filePath)
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>⚙️ 설정</h2>
        {saveStatus === 'saving' && <span className="save-status saving">저장 중...</span>}
        {saveStatus === 'saved' && <span className="save-status saved">✓ 저장됨</span>}
      </div>

      <div className="settings-content">
        {/* API 키 섹션 */}
        <section className="settings-section">
          <h3>🔑 API 키</h3>

          <div className="form-group">
            <label htmlFor="geminiApiKey">
              Gemini API 키 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="geminiApiKey"
              value={localSettings.geminiApiKey}
              onChange={(e) => handleChange('geminiApiKey', e.target.value)}
              placeholder="Gemini API 키 입력"
              className="form-input"
            />
            <small className="form-help">
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                여기서 발급 받기 →
              </a> (무료, 월 60회)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="fluxApiKey">
              Flux API 키 <span className="optional">(선택)</span>
            </label>
            <input
              type="password"
              id="fluxApiKey"
              value={localSettings.fluxApiKey || ''}
              onChange={(e) => handleChange('fluxApiKey', e.target.value)}
              placeholder="Flux API 키 입력 (미래 이미지 생성용)"
              className="form-input"
            />
            <small className="form-help">
              AI 미래 이미지 생성 기능 (유료, 약 $0.003/학생)
            </small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={localSettings.useFlux}
                onChange={(e) => handleChange('useFlux', e.target.checked)}
              />
              <span>AI 미래 이미지 생성 사용</span>
            </label>
            <small className="form-help">
              비활성화 시 템플릿 이미지 사용 (완전 무료)
            </small>
          </div>
        </section>

        {/* 학교 정보 섹션 */}
        <section className="settings-section">
          <h3>🏫 학교 정보</h3>

          <div className="form-group">
            <label htmlFor="schoolName">
              학교 이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="schoolName"
              value={localSettings.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="예: 서울초등학교"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>학교 로고</label>
            <div className="file-select-group">
              <input
                type="text"
                value={localSettings.schoolLogo || '선택된 파일 없음'}
                readOnly
                className="form-input"
                placeholder="로고 파일 선택"
              />
              <button
                type="button"
                onClick={handleLogoSelect}
                className="btn btn-secondary"
              >
                파일 선택
              </button>
            </div>
            <small className="form-help">
              투명 배경 PNG 권장, 최소 1000×1000px
            </small>
          </div>

          <div className="form-group">
            <label>배경음악</label>
            <div className="file-select-group">
              <input
                type="text"
                value={localSettings.backgroundMusic || '선택된 파일 없음'}
                readOnly
                className="form-input"
                placeholder="음악 파일 선택"
              />
              <button
                type="button"
                onClick={handleMusicSelect}
                className="btn btn-secondary"
              >
                파일 선택
              </button>
            </div>
            <small className="form-help">
              MP3/WAV 형식, 5-6분 길이 권장 (Suno AI로 제작 가능)
            </small>
          </div>
        </section>

        {/* 렌더링 설정 섹션 */}
        <section className="settings-section">
          <h3>🎬 렌더링 설정</h3>

          <div className="form-group">
            <label htmlFor="renderPreset">품질 프리셋</label>
            <select
              id="renderPreset"
              value={localSettings.renderPreset}
              onChange={(e) => handleChange('renderPreset', e.target.value as any)}
              className="form-select"
            >
              <option value="high">높음 (8000k, Full HD, 느림)</option>
              <option value="medium">중간 (4000k, Full HD, 보통)</option>
              <option value="low">낮음 (2000k, HD, 빠름)</option>
            </select>
            <small className="form-help">
              높은 품질일수록 렌더링 시간이 길어집니다
            </small>
          </div>

          <div className="preset-info">
            {localSettings.renderPreset === 'high' && (
              <div className="info-box">
                <strong>높음 품질</strong>
                <p>• 해상도: 1920×1080 (Full HD)</p>
                <p>• 비트레이트: 8000k</p>
                <p>• 예상 시간: 실시간의 2-3배</p>
                <p>• 파일 크기: 약 500MB (5분 기준)</p>
              </div>
            )}
            {localSettings.renderPreset === 'medium' && (
              <div className="info-box">
                <strong>중간 품질</strong>
                <p>• 해상도: 1920×1080 (Full HD)</p>
                <p>• 비트레이트: 4000k</p>
                <p>• 예상 시간: 실시간의 1.5-2배</p>
                <p>• 파일 크기: 약 300MB (5분 기준)</p>
              </div>
            )}
            {localSettings.renderPreset === 'low' && (
              <div className="info-box">
                <strong>낮음 품질</strong>
                <p>• 해상도: 1280×720 (HD)</p>
                <p>• 비트레이트: 2000k</p>
                <p>• 예상 시간: 실시간의 1-1.5배</p>
                <p>• 파일 크기: 약 150MB (5분 기준)</p>
              </div>
            )}
          </div>
        </section>

        {/* 검증 상태 */}
        <section className="settings-section validation-section">
          <h3>✓ 설정 검증</h3>
          <div className="validation-list">
            <div className={`validation-item ${localSettings.geminiApiKey ? 'valid' : 'invalid'}`}>
              {localSettings.geminiApiKey ? '✓' : '✗'} Gemini API 키
            </div>
            <div className={`validation-item ${localSettings.schoolName ? 'valid' : 'invalid'}`}>
              {localSettings.schoolName ? '✓' : '✗'} 학교 이름
            </div>
            <div className={`validation-item ${localSettings.schoolLogo ? 'valid' : 'optional'}`}>
              {localSettings.schoolLogo ? '✓' : '○'} 학교 로고 (선택)
            </div>
            <div className={`validation-item ${localSettings.backgroundMusic ? 'valid' : 'optional'}`}>
              {localSettings.backgroundMusic ? '✓' : '○'} 배경음악 (선택)
            </div>
          </div>

          {!localSettings.geminiApiKey || !localSettings.schoolName ? (
            <div className="warning-box">
              ⚠️ 필수 항목을 모두 입력해야 영상 제작이 가능합니다.
            </div>
          ) : (
            <div className="success-box">
              ✓ 모든 필수 설정이 완료되었습니다!
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
