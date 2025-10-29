import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import './Render.css'

interface RenderModules {
  mainStory: boolean
  rollCall: boolean
  timeTravel: boolean
}

export const Render: React.FC = () => {
  const { settings, scenario, renderProgress, isLoading } = useApp()
  const [modules, setModules] = useState<RenderModules>({
    mainStory: true,
    rollCall: true,
    timeTravel: false, // AI 이미지 생성이 필요하므로 기본 비활성화
  })
  const [isRendering, setIsRendering] = useState(false)
  const [renderComplete, setRenderComplete] = useState(false)
  const [outputPath, setOutputPath] = useState<string>('')
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0)

  // 예상 렌더링 시간 계산
  useEffect(() => {
    if (!scenario) return

    let totalDuration = scenario.totalDuration
    const activeModuleCount = Object.values(modules).filter(Boolean).length

    // 모듈당 추가 시간 (초)
    const moduleTime = {
      mainStory: scenario.totalDuration,
      rollCall: 60, // 약 1분
      timeTravel: 120, // 약 2분 (AI 생성 포함)
    }

    let calculatedDuration = 0
    if (modules.mainStory) calculatedDuration += moduleTime.mainStory
    if (modules.rollCall) calculatedDuration += moduleTime.rollCall
    if (modules.timeTravel) calculatedDuration += moduleTime.timeTravel

    setEstimatedDuration(calculatedDuration)
  }, [modules, scenario])

  const handleModuleToggle = (module: keyof RenderModules) => {
    // 시간여행 모듈은 Flux API 키가 있을 때만 활성화 가능
    if (module === 'timeTravel' && !settings.fluxApiKey && !modules.timeTravel) {
      alert('시간여행 모듈은 Flux API 키가 필요합니다. 설정 탭에서 API 키를 입력하거나, useFlux 옵션을 비활성화하세요.')
      return
    }

    setModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }))
  }

  const handleStartRender = async () => {
    if (!scenario) {
      alert('먼저 시나리오를 생성해주세요.')
      return
    }

    // 최소 하나의 모듈은 선택되어야 함
    if (!Object.values(modules).some(Boolean)) {
      alert('최소 하나의 모듈을 선택해주세요.')
      return
    }

    setIsRendering(true)
    setRenderComplete(false)

    try {
      // Python 백엔드에 렌더링 요청
      const response = await window.electronAPI.python.renderVideo({
        scenario,
        modules,
        settings: {
          schoolName: settings.schoolName,
          schoolLogo: settings.schoolLogo,
          backgroundMusic: settings.backgroundMusic,
          renderPreset: settings.renderPreset,
          useFlux: settings.useFlux,
          fluxApiKey: settings.fluxApiKey,
        },
      })

      if (response.success && response.data) {
        setOutputPath(response.data.outputPath)
        setRenderComplete(true)
      } else {
        throw new Error(response.error || '렌더링 실패')
      }
    } catch (error: any) {
      alert(`렌더링 중 오류가 발생했습니다:\n${error.message}`)
      console.error('Render error:', error)
    } finally {
      setIsRendering(false)
    }
  }

  const handleOpenOutput = async () => {
    if (outputPath) {
      await window.electronAPI.files.openPath(outputPath)
    }
  }

  const handleReset = () => {
    setRenderComplete(false)
    setOutputPath('')
    setIsRendering(false)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}분 ${secs}초`
  }

  const getQualityInfo = () => {
    const presets = {
      high: {
        label: '고품질',
        resolution: '1920x1080',
        fps: '30 FPS',
        codec: 'H.264',
        bitrate: '8000k',
        color: '#4CAF50',
      },
      medium: {
        label: '중품질',
        resolution: '1280x720',
        fps: '30 FPS',
        codec: 'H.264',
        bitrate: '4000k',
        color: '#FF9800',
      },
      low: {
        label: '저품질',
        resolution: '1280x720',
        fps: '24 FPS',
        codec: 'H.264',
        bitrate: '2000k',
        color: '#9E9E9E',
      },
    }
    return presets[settings.renderPreset] || presets.high
  }

  if (!scenario) {
    return (
      <div className="render-container">
        <div className="render-empty">
          <div className="render-empty-icon">🎬</div>
          <h2>렌더링할 시나리오가 없습니다</h2>
          <p>먼저 시나리오 탭에서 영상 시나리오를 생성해주세요.</p>
        </div>
      </div>
    )
  }

  const qualityInfo = getQualityInfo()

  return (
    <div className="render-container">
      {!renderComplete ? (
        <>
          {/* 렌더링 설정 요약 */}
          <section className="render-summary">
            <h2>📊 렌더링 설정</h2>
            <div className="render-summary-grid">
              <div className="render-summary-item">
                <span className="render-summary-label">학교명</span>
                <span className="render-summary-value">{settings.schoolName || '미설정'}</span>
              </div>
              <div className="render-summary-item">
                <span className="render-summary-label">품질</span>
                <span
                  className="render-summary-value"
                  style={{ color: qualityInfo.color, fontWeight: 'bold' }}
                >
                  {qualityInfo.label}
                </span>
              </div>
              <div className="render-summary-item">
                <span className="render-summary-label">해상도</span>
                <span className="render-summary-value">{qualityInfo.resolution}</span>
              </div>
              <div className="render-summary-item">
                <span className="render-summary-label">프레임</span>
                <span className="render-summary-value">{qualityInfo.fps}</span>
              </div>
              <div className="render-summary-item">
                <span className="render-summary-label">코덱</span>
                <span className="render-summary-value">{qualityInfo.codec}</span>
              </div>
              <div className="render-summary-item">
                <span className="render-summary-label">비트레이트</span>
                <span className="render-summary-value">{qualityInfo.bitrate}</span>
              </div>
            </div>
          </section>

          {/* 모듈 선택 */}
          <section className="render-modules">
            <h2>🎥 포함할 모듈 선택</h2>
            <div className="render-modules-grid">
              <div
                className={`render-module-card ${modules.mainStory ? 'active' : ''}`}
                onClick={() => handleModuleToggle('mainStory')}
              >
                <div className="render-module-icon">📖</div>
                <h3>메인 스토리</h3>
                <p>학교 생활 추억 사진 및 영상</p>
                <div className="render-module-duration">
                  {scenario.mainStory.length}개 장면 • {Math.ceil(scenario.totalDuration / 60)}분
                </div>
                <div className="render-module-checkbox">
                  <input type="checkbox" checked={modules.mainStory} readOnly />
                </div>
              </div>

              <div
                className={`render-module-card ${modules.rollCall ? 'active' : ''}`}
                onClick={() => handleModuleToggle('rollCall')}
              >
                <div className="render-module-icon">🌟</div>
                <h3>올스타 롤콜</h3>
                <p>졸업생 증명사진 슬라이드쇼</p>
                <div className="render-module-duration">약 1분</div>
                <div className="render-module-checkbox">
                  <input type="checkbox" checked={modules.rollCall} readOnly />
                </div>
              </div>

              <div
                className={`render-module-card ${modules.timeTravel ? 'active' : ''} ${
                  !settings.fluxApiKey && settings.useFlux ? 'disabled' : ''
                }`}
                onClick={() => handleModuleToggle('timeTravel')}
              >
                <div className="render-module-icon">⏰</div>
                <h3>시간여행</h3>
                <p>과거-현재-미래 (AI 이미지 생성)</p>
                <div className="render-module-duration">약 2분</div>
                {!settings.fluxApiKey && settings.useFlux && (
                  <div className="render-module-warning">⚠️ Flux API 키 필요</div>
                )}
                <div className="render-module-checkbox">
                  <input type="checkbox" checked={modules.timeTravel} readOnly />
                </div>
              </div>
            </div>
          </section>

          {/* 예상 정보 */}
          <section className="render-estimation">
            <div className="render-estimation-card">
              <div className="render-estimation-item">
                <span className="render-estimation-label">예상 영상 길이</span>
                <span className="render-estimation-value">{formatTime(estimatedDuration)}</span>
              </div>
              <div className="render-estimation-item">
                <span className="render-estimation-label">예상 렌더링 시간</span>
                <span className="render-estimation-value">
                  {formatTime(Math.ceil(estimatedDuration * 0.5))}
                  <span className="render-estimation-note">
                    (실제 시간은 시스템 성능에 따라 다를 수 있습니다)
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* 렌더링 버튼 또는 진행률 */}
          {!isRendering ? (
            <div className="render-actions">
              <button className="render-start-button" onClick={handleStartRender}>
                🎬 렌더링 시작
              </button>
            </div>
          ) : (
            <section className="render-progress-section">
              <h2>🎥 렌더링 중...</h2>
              <div className="render-progress-container">
                <div className="render-progress-stages">
                  <div
                    className={`render-progress-stage ${
                      renderProgress?.stage === 'preparing' ? 'active' : ''
                    } ${
                      renderProgress &&
                      ['rendering', 'finalizing', 'complete'].includes(renderProgress.stage)
                        ? 'completed'
                        : ''
                    }`}
                  >
                    <div className="render-progress-stage-icon">📋</div>
                    <div className="render-progress-stage-label">준비 중</div>
                  </div>
                  <div
                    className={`render-progress-stage ${
                      renderProgress?.stage === 'rendering' ? 'active' : ''
                    } ${
                      renderProgress && ['finalizing', 'complete'].includes(renderProgress.stage)
                        ? 'completed'
                        : ''
                    }`}
                  >
                    <div className="render-progress-stage-icon">🎬</div>
                    <div className="render-progress-stage-label">렌더링</div>
                  </div>
                  <div
                    className={`render-progress-stage ${
                      renderProgress?.stage === 'finalizing' ? 'active' : ''
                    } ${renderProgress?.stage === 'complete' ? 'completed' : ''}`}
                  >
                    <div className="render-progress-stage-icon">⚙️</div>
                    <div className="render-progress-stage-label">마무리</div>
                  </div>
                  <div
                    className={`render-progress-stage ${
                      renderProgress?.stage === 'complete' ? 'active completed' : ''
                    }`}
                  >
                    <div className="render-progress-stage-icon">✅</div>
                    <div className="render-progress-stage-label">완료</div>
                  </div>
                </div>

                <div className="render-progress-bar-container">
                  <div className="render-progress-bar">
                    <div
                      className="render-progress-bar-fill"
                      style={{ width: `${renderProgress?.percent || 0}%` }}
                    ></div>
                  </div>
                  <div className="render-progress-text">
                    {renderProgress?.percent || 0}% • {renderProgress?.message || '준비 중...'}
                  </div>
                </div>

                {renderProgress && renderProgress.estimatedTimeLeft > 0 && (
                  <div className="render-progress-eta">
                    예상 남은 시간: {formatTime(renderProgress.estimatedTimeLeft)}
                  </div>
                )}

                {renderProgress?.currentModule && (
                  <div className="render-progress-module">
                    현재 모듈:{' '}
                    {renderProgress.currentModule === 'main'
                      ? '메인 스토리'
                      : renderProgress.currentModule === 'rollcall'
                        ? '올스타 롤콜'
                        : renderProgress.currentModule === 'timetravel'
                          ? '시간여행'
                          : '엔딩 크레딧'}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      ) : (
        /* 렌더링 완료 화면 */
        <section className="render-complete">
          <div className="render-complete-icon">🎉</div>
          <h2>렌더링 완료!</h2>
          <p>졸업 영상이 성공적으로 제작되었습니다.</p>

          <div className="render-complete-info">
            <div className="render-complete-info-item">
              <span className="render-complete-info-label">저장 위치</span>
              <span className="render-complete-info-value">{outputPath}</span>
            </div>
            <div className="render-complete-info-item">
              <span className="render-complete-info-label">영상 길이</span>
              <span className="render-complete-info-value">{formatTime(estimatedDuration)}</span>
            </div>
            <div className="render-complete-info-item">
              <span className="render-complete-info-label">품질</span>
              <span className="render-complete-info-value" style={{ color: qualityInfo.color }}>
                {qualityInfo.label} ({qualityInfo.resolution})
              </span>
            </div>
          </div>

          <div className="render-complete-actions">
            <button className="render-complete-button primary" onClick={handleOpenOutput}>
              📂 폴더 열기
            </button>
            <button className="render-complete-button secondary" onClick={handleReset}>
              🔄 새로 렌더링
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
