// src/types/index.ts

/** 학생 정보 */
export interface Student {
  name: string;              // 이름
  babyPhotoPath: string;     // 어릴 때 사진 경로
  dreamJob: string;          // 장래희망
  idPhotoPath?: string;      // 증명사진 경로 (자동 매핑)
}

/** 시나리오 장면 */
export interface Scene {
  type: 'photo' | 'video';   // 미디어 타입
  file: string;              // 파일 경로
  duration: number;          // 재생 시간 (초)
  description?: string;      // 설명
  effect?: 'kenburns' | 'fade' | 'zoom'; // 효과
}

/** AI 생성 시나리오 */
export interface Scenario {
  opening: {
    duration: number;
    text: string;
  };
  mainStory: Scene[];        // 메인 스토리 장면들
  totalDuration: number;     // 전체 예상 길이
}

/** 렌더링 설정 */
export interface RenderOptions {
  resolution: '1920x1080' | '1280x720';
  fps: 30 | 60;
  codec: 'libx264' | 'libx265';
  preset: 'ultrafast' | 'fast' | 'medium' | 'slow';
  bitrate: string;           // 예: '8000k'
}

/** 렌더링 진행 상태 */
export interface RenderProgress {
  stage: 'preparing' | 'rendering' | 'finalizing' | 'complete';
  percent: number;           // 0-100
  currentModule: 'main' | 'rollcall' | 'timetravel' | 'credits';
  estimatedTimeLeft: number; // 초
  message: string;           // 상태 메시지
}

/** 앱 설정 */
export interface AppSettings {
  geminiApiKey: string;      // Gemini API 키 (시나리오 생성 + 나노바나나 이미지 생성)  schoolName: string;
  schoolLogo?: string;
  backgroundMusic?: string;
  renderPreset: 'high' | 'medium' | 'low';}

/** 업로드된 파일 정보 */
export interface UploadedFiles {
  groupPhotos: File[]       // 단체 사진
  videos: File[]            // 영상 클립
  studentExcel: File | null // 학생 명단 엑셀
  babyPhotos: File[]        // 어릴 때 사진
  idPhotos: File[]          // 증명사진
}
/** 파일 업로드 결과 */
export interface UploadResult {
  success: boolean;
  files?: string[];
  error?: string;
}

/** IPC 응답 타입 */
export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
