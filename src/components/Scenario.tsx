// src/components/Scenario.tsx
import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Scenario as ScenarioType, Scene } from '../types'
import './Scenario.css'

interface Props {
  onNext: () => void
}

export const Scenario: React.FC<Props> = ({ onNext }) => {
  const { settings, scenario, setScenario, isLoading, setIsLoading, setError } = useApp()
  const [generatingStatus, setGeneratingStatus] = useState<string>('')

  // 시나리오 생성
  const handleGenerateScenario = async () => {
    if (!settings.geminiApiKey) {
      setError('Gemini API 키가 설정되지 않았습니다. 설정 탭에서 API 키를 입력하세요.')
      return
    }

    setIsLoading(true)
    setGeneratingStatus('사진 분석 중...')

    try {
      // TODO: 실제 파일 정보 가져오기
      const mockData = {
        photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'], // 실제로는 업로드된 파일 목록
        videos: ['video1.mp4', 'video2.mp4'],
        apiKey: settings.geminiApiKey
      }

      setGeneratingStatus('Gemini AI 시나리오 생성 중...')

      // Python 백엔드 호출
      const response = await window.electronAPI.python.generateScenario(mockData)

      if (response.success && response.data) {
        setScenario(response.data)
        setGeneratingStatus('시나리오 생성 완료!')
      } else {
        throw new Error(response.error || '시나리오 생성 실패')
      }
    } catch (err) {
      console.error('시나리오 생성 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')

      // 테스트용 목업 시나리오 생성
      createMockScenario()
    } finally {
      setIsLoading(false)
      setTimeout(() => setGeneratingStatus(''), 3000)
    }
  }

  // 테스트용 목업 시나리오
  const createMockScenario = () => {
    const mockScenario: ScenarioType = {
      opening: {
        duration: 10,
        text: `${settings.schoolName} 졸업을 축하합니다`
      },
      mainStory: [
        {
          type: 'photo',
          file: 'entrance_ceremony.jpg',
          duration: 3,
          description: '입학식 첫날',
          effect: 'kenburns'
        },
        {
          type: 'photo',
          file: 'sports_day_001.jpg',
          duration: 2.5,
          description: '운동회 단체 줄넘기',
          effect: 'zoom'
        },
        {
          type: 'video',
          file: 'school_festival.mp4',
          duration: 5,
          description: '학예회 공연',
          effect: 'fade'
        },
        {
          type: 'photo',
          file: 'field_trip_001.jpg',
          duration: 3,
          description: '수학여행 추억',
          effect: 'kenburns'
        },
        {
          type: 'photo',
          file: 'graduation_practice.jpg',
          duration: 2.5,
          description: '졸업식 연습',
          effect: 'fade'
        }
      ],
      totalDuration: 180
    }
    setScenario(mockScenario)
    setGeneratingStatus('✓ 테스트 시나리오 생성 완료')
  }

  // 장면 수정
  const updateScene = (index: number, field: keyof Scene, value: any) => {
    if (!scenario) return

    const updatedScenes = [...scenario.mainStory]
    updatedScenes[index] = {
      ...updatedScenes[index],
      [field]: value
    }

    setScenario({
      ...scenario,
      mainStory: updatedScenes
    })
  }

  // 장면 삭제
  const deleteScene = (index: number) => {
    if (!scenario) return
    if (!window.confirm('이 장면을 삭제하시겠습니까?')) return

    const updatedScenes = scenario.mainStory.filter((_, i) => i !== index)
    setScenario({
      ...scenario,
      mainStory: updatedScenes,
      totalDuration: updatedScenes.reduce((sum, scene) => sum + scene.duration, 0)
    })
  }

  // 장면 순서 변경
  const moveScene = (index: number, direction: 'up' | 'down') => {
    if (!scenario) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= scenario.mainStory.length) return

    const updatedScenes = [...scenario.mainStory]
    const temp = updatedScenes[index]
    updatedScenes[index] = updatedScenes[newIndex]
    updatedScenes[newIndex] = temp

    setScenario({
      ...scenario,
      mainStory: updatedScenes
    })
  }

  // 총 시간 계산
  const totalDuration = scenario?.mainStory.reduce((sum, scene) => sum + scene.duration, 0) || 0
  const formattedDuration = `${Math.floor(totalDuration / 60)}분 ${Math.floor(totalDuration % 60)}초`

  return (
    <div className="scenario-container">
      <div className="scenario-header">
        <div>
          <h2>🎬 시나리오 생성</h2>
          <p className="scenario-subtitle">
            AI가 업로드된 사진과 영상을 분석하여 최적의 시나리오를 생성합니다
          </p>
        </div>
        {generatingStatus && (
          <span className="scenario-status">{generatingStatus}</span>
        )}
      </div>

      <div className="scenario-content">
        {/* 시나리오 없을 때 */}
        {!scenario && (
          <div className="scenario-empty">
            <div className="empty-icon">🎭</div>
            <h3>시나리오를 생성하세요</h3>
            <p>업로드된 사진과 영상을 분석하여 감동적인 졸업영상 시나리오를 자동으로 만듭니다.</p>

            <div className="generation-info">
              <h4>생성 과정:</h4>
              <ol>
                <li>📸 사진 분석: 인물, 장면, 감정 분석</li>
                <li>🎯 베스트 사진 선별: 30-50장 자동 선택</li>
                <li>🎬 스토리 구성: 감동적인 흐름 설계</li>
                <li>⏱️ 시간 배분: 각 장면별 최적 시간 설정</li>
                <li>✨ 효과 추천: Ken Burns, Fade 등 자동 배치</li>
              </ol>
            </div>

            <button
              onClick={handleGenerateScenario}
              disabled={isLoading || !settings.geminiApiKey}
              className="btn btn-primary btn-large btn-generate"
            >
              {isLoading ? '생성 중...' : '🤖 AI 시나리오 자동 생성'}
            </button>

            {!settings.geminiApiKey && (
              <p className="warning-text">
                ⚠️ Gemini API 키를 먼저 설정하세요 (설정 탭)
              </p>
            )}

            <button
              onClick={createMockScenario}
              className="btn btn-secondary"
              style={{ marginTop: '12px' }}
            >
              테스트용 시나리오 생성
            </button>
          </div>
        )}

        {/* 시나리오 있을 때 */}
        {scenario && (
          <div className="scenario-editor">
            {/* 요약 정보 */}
            <div className="scenario-summary">
              <div className="summary-card">
                <h3>📊 시나리오 요약</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">총 길이</span>
                    <span className="summary-value">{formattedDuration}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">장면 수</span>
                    <span className="summary-value">{scenario.mainStory.length}개</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">사진</span>
                    <span className="summary-value">
                      {scenario.mainStory.filter(s => s.type === 'photo').length}장
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">영상</span>
                    <span className="summary-value">
                      {scenario.mainStory.filter(s => s.type === 'video').length}개
                    </span>
                  </div>
                </div>

                <div className="summary-actions">
                  <button
                    onClick={handleGenerateScenario}
                    className="btn btn-secondary"
                    disabled={isLoading}
                  >
                    🔄 다시 생성
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('시나리오를 초기화하시겠습니까?')) {
                        setScenario(null)
                      }
                    }}
                    className="btn btn-danger"
                  >
                    🗑️ 초기화
                  </button>
                </div>
              </div>
            </div>

            {/* 장면 목록 */}
            <div className="scene-list">
              <h3>🎞️ 장면 편집</h3>

              {/* 오프닝 */}
              <div className="scene-item opening">
                <div className="scene-header">
                  <span className="scene-number">오프닝</span>
                  <span className="scene-type">TITLE</span>
                </div>
                <div className="scene-content">
                  <input
                    type="text"
                    value={scenario.opening.text}
                    onChange={(e) => setScenario({
                      ...scenario,
                      opening: { ...scenario.opening, text: e.target.value }
                    })}
                    className="scene-input"
                  />
                  <input
                    type="number"
                    value={scenario.opening.duration}
                    onChange={(e) => setScenario({
                      ...scenario,
                      opening: { ...scenario.opening, duration: Number(e.target.value) }
                    })}
                    className="scene-duration"
                    min="1"
                    max="30"
                  />
                  <span className="duration-label">초</span>
                </div>
              </div>

              {/* 메인 장면들 */}
              {scenario.mainStory.map((scene, index) => (
                <div key={index} className="scene-item">
                  <div className="scene-header">
                    <span className="scene-number">장면 {index + 1}</span>
                    <span className={`scene-type ${scene.type}`}>
                      {scene.type === 'photo' ? '📸' : '🎬'} {scene.type.toUpperCase()}
                    </span>
                    <div className="scene-controls">
                      <button
                        onClick={() => moveScene(index, 'up')}
                        disabled={index === 0}
                        className="btn-control"
                        title="위로"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveScene(index, 'down')}
                        disabled={index === scenario.mainStory.length - 1}
                        className="btn-control"
                        title="아래로"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteScene(index)}
                        className="btn-control btn-delete"
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="scene-content">
                    <div className="scene-field">
                      <label>파일명</label>
                      <input
                        type="text"
                        value={scene.file}
                        onChange={(e) => updateScene(index, 'file', e.target.value)}
                        className="scene-input"
                      />
                    </div>

                    <div className="scene-field">
                      <label>설명</label>
                      <input
                        type="text"
                        value={scene.description || ''}
                        onChange={(e) => updateScene(index, 'description', e.target.value)}
                        className="scene-input"
                        placeholder="장면 설명..."
                      />
                    </div>

                    <div className="scene-inline-fields">
                      <div className="scene-field">
                        <label>시간</label>
                        <input
                          type="number"
                          value={scene.duration}
                          onChange={(e) => updateScene(index, 'duration', Number(e.target.value))}
                          className="scene-duration"
                          min="0.5"
                          max="30"
                          step="0.5"
                        />
                        <span className="duration-label">초</span>
                      </div>

                      <div className="scene-field">
                        <label>효과</label>
                        <select
                          value={scene.effect || 'fade'}
                          onChange={(e) => updateScene(index, 'effect', e.target.value)}
                          className="scene-select"
                        >
                          <option value="fade">Fade (페이드)</option>
                          <option value="kenburns">Ken Burns (줌/패닝)</option>
                          <option value="zoom">Zoom (줌인)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 다음 단계 */}
            <div className="scenario-footer">
              <div className="footer-info">
                <p>✓ 시나리오 편집이 완료되었습니다</p>
                <p className="footer-hint">
                  다음 단계에서 영상을 렌더링합니다 (예상 시간: {Math.ceil(totalDuration / 60 * 2)}분)
                </p>
              </div>
              <button 
                className="btn btn-primary btn-large"
                onClick={onNext}
              >
                다음: 렌더링 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
