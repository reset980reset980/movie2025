// src/components/Upload.tsx
import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import './Upload.css'

interface UploadedFiles {
  photos: File[]
  videos: File[]
  idPhotos: File[]
  babyPhotos: File[]
  studentExcel: File | null
}

export const Upload: React.FC = () => {
  const { settings } = useApp()
  const [files, setFiles] = useState<UploadedFiles>({
    photos: [],
    videos: [],
    idPhotos: [],
    babyPhotos: [],
    studentExcel: null
  })
  const [uploadStatus, setUploadStatus] = useState<string>('')

  // 파일 검증
  const validateFiles = (fileList: FileList, type: 'photo' | 'video' | 'excel'): File[] => {
    const validFiles: File[] = []
    const allowedExtensions: { [key: string]: string[] } = {
      photo: ['.jpg', '.jpeg', '.png'],
      video: ['.mp4', '.mov', '.avi'],
      excel: ['.xlsx', '.xls']
    }

    Array.from(fileList).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (allowedExtensions[type].includes(ext)) {
        validFiles.push(file)
      }
    })

    return validFiles
  }

  // 드래그 앤 드롭 핸들러
  const handleDrop = (e: React.DragEvent, category: keyof UploadedFiles) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length === 0) return

    if (category === 'studentExcel') {
      const validated = validateFiles(droppedFiles, 'excel')
      if (validated.length > 0) {
        setFiles(prev => ({ ...prev, studentExcel: validated[0] }))
        setUploadStatus(`✓ 엑셀 파일 업로드 완료: ${validated[0].name}`)
      }
    } else if (category === 'videos') {
      const validated = validateFiles(droppedFiles, 'video')
      setFiles(prev => ({ ...prev, videos: [...prev.videos, ...validated] }))
      setUploadStatus(`✓ ${validated.length}개 영상 파일 추가됨`)
    } else {
      const validated = validateFiles(droppedFiles, 'photo')
      setFiles(prev => ({ ...prev, [category]: [...prev[category], ...validated] }))
      setUploadStatus(`✓ ${validated.length}개 사진 파일 추가됨`)
    }

    setTimeout(() => setUploadStatus(''), 3000)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, category: keyof UploadedFiles) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    if (category === 'studentExcel') {
      const validated = validateFiles(selectedFiles, 'excel')
      if (validated.length > 0) {
        setFiles(prev => ({ ...prev, studentExcel: validated[0] }))
        setUploadStatus(`✓ 엑셀 파일 업로드 완료: ${validated[0].name}`)
      }
    } else if (category === 'videos') {
      const validated = validateFiles(selectedFiles, 'video')
      setFiles(prev => ({ ...prev, videos: [...prev.videos, ...validated] }))
      setUploadStatus(`✓ ${validated.length}개 영상 파일 추가됨`)
    } else {
      const validated = validateFiles(selectedFiles, 'photo')
      setFiles(prev => ({ ...prev, [category]: [...prev[category], ...validated] }))
      setUploadStatus(`✓ ${validated.length}개 사진 파일 추가됨`)
    }

    setTimeout(() => setUploadStatus(''), 3000)
    e.target.value = '' // 리셋
  }

  // 파일 제거
  const removeFile = (category: keyof UploadedFiles, index?: number) => {
    if (category === 'studentExcel') {
      setFiles(prev => ({ ...prev, studentExcel: null }))
    } else {
      setFiles(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }))
    }
  }

  // 모든 파일 초기화
  const clearAllFiles = () => {
    if (window.confirm('모든 업로드된 파일을 삭제하시겠습니까?')) {
      setFiles({
        photos: [],
        videos: [],
        idPhotos: [],
        babyPhotos: [],
        studentExcel: null
      })
      setUploadStatus('모든 파일이 삭제되었습니다')
      setTimeout(() => setUploadStatus(''), 3000)
    }
  }

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // 전체 파일 수 계산
  const totalFiles = files.photos.length + files.videos.length + files.idPhotos.length +
                     files.babyPhotos.length + (files.studentExcel ? 1 : 0)

  return (
    <div className="upload-container">
      <div className="upload-header">
        <div>
          <h2>📤 파일 업로드</h2>
          <p className="upload-subtitle">
            졸업영상 제작에 필요한 파일들을 업로드하세요
          </p>
        </div>
        <div className="upload-actions">
          {uploadStatus && <span className="upload-status">{uploadStatus}</span>}
          {totalFiles > 0 && (
            <button onClick={clearAllFiles} className="btn btn-danger">
              전체 삭제
            </button>
          )}
        </div>
      </div>

      <div className="upload-content">
        {/* 진행 상황 */}
        <div className="upload-progress-card">
          <h3>📊 업로드 현황</h3>
          <div className="progress-grid">
            <div className="progress-item">
              <span className="progress-label">📸 행사 사진</span>
              <span className="progress-count">{files.photos.length}장</span>
            </div>
            <div className="progress-item">
              <span className="progress-label">🎬 영상 클립</span>
              <span className="progress-count">{files.videos.length}개</span>
            </div>
            <div className="progress-item">
              <span className="progress-label">👤 증명사진</span>
              <span className="progress-count">{files.idPhotos.length}장</span>
            </div>
            <div className="progress-item">
              <span className="progress-label">👶 어릴때 사진</span>
              <span className="progress-count">{files.babyPhotos.length}장</span>
            </div>
            <div className="progress-item">
              <span className="progress-label">📋 학생정보</span>
              <span className="progress-count">{files.studentExcel ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>

        {/* 1. 행사/일상 사진 */}
        <section className="upload-section">
          <h3>📸 행사/일상 사진 ({files.photos.length}장)</h3>
          <p className="section-description">
            운동회, 소풍, 수학여행, 학예회 등의 사진 (100-300장 권장)
          </p>

          <div
            className="dropzone"
            onDrop={(e) => handleDrop(e, 'photos')}
            onDragOver={handleDragOver}
          >
            <div className="dropzone-content">
              <span className="dropzone-icon">📁</span>
              <p>사진을 드래그하거나 클릭하여 선택</p>
              <p className="dropzone-hint">JPG, PNG 형식</p>
            </div>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, 'photos')}
              className="file-input"
            />
          </div>

          {files.photos.length > 0 && (
            <div className="file-list">
              {files.photos.slice(0, 5).map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile('photos', index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {files.photos.length > 5 && (
                <div className="file-item-more">
                  외 {files.photos.length - 5}개 파일...
                </div>
              )}
            </div>
          )}
        </section>

        {/* 2. 영상 클립 */}
        <section className="upload-section">
          <h3>🎬 영상 클립 ({files.videos.length}개)</h3>
          <p className="section-description">
            체육대회, 학예회 등의 영상 (5-10개 권장)
          </p>

          <div
            className="dropzone"
            onDrop={(e) => handleDrop(e, 'videos')}
            onDragOver={handleDragOver}
          >
            <div className="dropzone-content">
              <span className="dropzone-icon">🎥</span>
              <p>영상을 드래그하거나 클릭하여 선택</p>
              <p className="dropzone-hint">MP4, MOV, AVI 형식</p>
            </div>
            <input
              type="file"
              multiple
              accept=".mp4,.mov,.avi"
              onChange={(e) => handleFileSelect(e, 'videos')}
              className="file-input"
            />
          </div>

          {files.videos.length > 0 && (
            <div className="file-list">
              {files.videos.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile('videos', index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. 증명사진 */}
        <section className="upload-section">
          <h3>👤 증명사진 ({files.idPhotos.length}장)</h3>
          <p className="section-description">
            학생 전체 증명사진 (파일명 = 학생 이름, 예: 홍길동.jpg)
          </p>

          <div
            className="dropzone"
            onDrop={(e) => handleDrop(e, 'idPhotos')}
            onDragOver={handleDragOver}
          >
            <div className="dropzone-content">
              <span className="dropzone-icon">👥</span>
              <p>증명사진을 드래그하거나 클릭하여 선택</p>
              <p className="dropzone-hint">파일명이 학생 이름과 동일해야 합니다</p>
            </div>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, 'idPhotos')}
              className="file-input"
            />
          </div>

          {files.idPhotos.length > 0 && (
            <div className="file-list">
              {files.idPhotos.slice(0, 5).map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile('idPhotos', index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {files.idPhotos.length > 5 && (
                <div className="file-item-more">
                  외 {files.idPhotos.length - 5}개 파일...
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4. 어릴 때 사진 */}
        <section className="upload-section">
          <h3>👶 어릴 때 사진 ({files.babyPhotos.length}장)</h3>
          <p className="section-description">
            유치원 시절 또는 초등 1학년 사진 (파일명 = 학생 이름)
          </p>

          <div
            className="dropzone"
            onDrop={(e) => handleDrop(e, 'babyPhotos')}
            onDragOver={handleDragOver}
          >
            <div className="dropzone-content">
              <span className="dropzone-icon">🍼</span>
              <p>어릴 때 사진을 드래그하거나 클릭하여 선택</p>
              <p className="dropzone-hint">시간여행 모듈에 사용됩니다</p>
            </div>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, 'babyPhotos')}
              className="file-input"
            />
          </div>

          {files.babyPhotos.length > 0 && (
            <div className="file-list">
              {files.babyPhotos.slice(0, 5).map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile('babyPhotos', index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {files.babyPhotos.length > 5 && (
                <div className="file-item-more">
                  외 {files.babyPhotos.length - 5}개 파일...
                </div>
              )}
            </div>
          )}
        </section>

        {/* 5. 학생 정보 엑셀 */}
        <section className="upload-section">
          <h3>📋 학생 정보 엑셀 {files.studentExcel && '(✓ 업로드 완료)'}</h3>
          <p className="section-description">
            컬럼: 이름, 어릴때사진경로, 장래희망
          </p>

          <div
            className="dropzone"
            onDrop={(e) => handleDrop(e, 'studentExcel')}
            onDragOver={handleDragOver}
          >
            <div className="dropzone-content">
              <span className="dropzone-icon">📊</span>
              <p>엑셀 파일을 드래그하거나 클릭하여 선택</p>
              <p className="dropzone-hint">XLSX, XLS 형식</p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => handleFileSelect(e, 'studentExcel')}
              className="file-input"
            />
          </div>

          {files.studentExcel && (
            <div className="file-list">
              <div className="file-item">
                <span className="file-name">{files.studentExcel.name}</span>
                <span className="file-size">{formatFileSize(files.studentExcel.size)}</span>
                <button
                  onClick={() => removeFile('studentExcel')}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 다음 단계 버튼 */}
        <div className="upload-footer">
          <div className="validation-summary">
            {totalFiles === 0 && (
              <div className="warning-box">
                ⚠️ 업로드된 파일이 없습니다
              </div>
            )}
            {totalFiles > 0 && !files.studentExcel && (
              <div className="warning-box">
                ⚠️ 학생 정보 엑셀 파일이 필요합니다
              </div>
            )}
            {totalFiles > 0 && files.studentExcel && (
              <div className="success-box">
                ✓ 파일 업로드 완료! 다음 단계로 진행하세요
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-large"
            disabled={totalFiles === 0 || !files.studentExcel}
          >
            다음: 시나리오 생성 →
          </button>
        </div>
      </div>
    </div>
  )
}
