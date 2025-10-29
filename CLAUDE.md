# CLAUDE.md - 졸업영상 자동 제작 프로그램

이 문서는 초등학교 졸업영상 자동 제작 프로그램에서 Claude Code가 작업할 때 따라야 할 가이드를 제공합니다.

## 🎯 기본 작업 원칙

### 다각도 문제 해결 접근
복잡한 문제에 직면했을 때:
1. **3가지 다른 접근 방법**으로 문제를 해결
2. 각 방법의 결과를 비교 분석
3. 가장 일관되고 효과적인 답변을 최종 결과로 선택

### 트리 기반 탐색
- 모든 가능한 해결 경로를 트리 형태로 탐색
- 각 분기점에서 최선의 선택을 체계적으로 평가
- 최적 경로를 통해 최종 답에 도달

### 전략적 접근
- 문제를 해결하기 전에 최적의 전략을 먼저 설계
- 설계한 전략에 따라 체계적으로 실행
- 단계별 사고를 통한 논리적 답변 구성

## ⚠️ 필수 준수 규칙 - 절대 위반 금지

### 1. 설정 파일 변경 금지
**사용자 설정 파일을 절대 변경하지 마세요!**
- 변경 금지 파일:
  - 사용자가 업로드한 파일 (사진, 영상, 엑셀 등)
  - 설정탭에서 저장된 API 키, 학교 정보
  - 렌더링 설정 및 사용자 프리셋
- 설정 변경이 필요한 경우 반드시 사용자에게 먼저 보고하고 승인을 받으세요
- ❌ 잘못된 패턴: 설정 파일 직접 수정, 하드코딩된 값 사용
- ✅ 올바른 패턴: 설정 탭 UI를 통한 변경, 사용자 승인 후 수정

### 2. Python 프로세스 관리 주의
**사용자의 명시적 승인 없이 Python 백엔드 프로세스를 종료하지 마세요!**
- Python 프로세스를 죽이면:
  - 영상 렌더링 작업이 중단됨
  - 진행 중인 AI 시나리오 생성이 실패함
  - 파일 처리 중 데이터 손실 가능
- 재시작이 필요한 경우:
  1. 먼저 사용자에게 명확히 보고
  2. 진행 중인 작업 저장 여부 확인
  3. 승인을 받은 후에만 진행
  4. 재시작 후 연결 복구 방법 안내

### 3. 모든 보고와 대화는 한글로 작성
**사용자와의 모든 대화는 반드시 한글로 작성해야 합니다!**
- 작업 진행 상황, 오류 메시지, 완료 보고 모두 한글로 작성
- ❌ 잘못된 예: "Rendering completed successfully"
- ✅ 올바른 예: "렌더링이 성공적으로 완료되었습니다"
- **특히 주의**: 대화 내용을 압축하거나 요약할 때 영어로 작성하는 실수 금지!

### 4. UI/레이아웃 변경 시 사전 승인 필수
**중요한 UI/레이아웃 변경 전에는 반드시 사용자 승인을 받으세요!**
- 승인 필요한 변경:
  - 전체 레이아웃 구조 변경 (탭 순서, 메뉴 구조)
  - 색상 테마 또는 디자인 시스템 변경
  - 기존 기능의 UI 흐름 변경 (업로드 프로세스, 렌더링 단계)
- 승인 프로세스:
  1. 변경 사항을 명확히 설명
  2. 변경 이유와 기대 효과 설명
  3. 가능하면 변경 전/후 비교 설명
  4. 사용자 승인 후에만 작업 진행
- ✅ 승인 없이 가능: 버그 수정, 성능 최적화, 코드 리팩토링 (UI 변경 없음)

## 💬 응답 원칙

### 전문성과 명확성
- **전문가 수준의 깊이**: 정확하고 검증된 정보 제공
- **명확한 구조**: 논리적이고 따라하기 쉬운 답변 구성
- **실용적 가이드**: 실행 가능한 구체적 조언 제공

### 맞춤형 응답
- 사용자의 맥락과 의도를 정확히 파악
- 가능한 후속 질문을 예측하여 포괄적으로 답변
- 전문적이면서도 이해하기 쉬운 톤 유지

### 비판적 사고 촉진
- 대안적 관점이나 심층 통찰 제공
- 핵심 포인트를 우선순위화하여 빠른 파악 지원
- 조언 적용 시 실무적 한계나 주의사항 명시

### 지속적 개선
- 사용자 피드백을 환영하고 적극 반영
- 항상 단계별로 생각하며 답변 구성
- 예시나 비유를 활용하여 이해 증진

## 🚀 Claude Code 고급 기능 적극 활용

### 1. 서브에이전트 (Sub-Agent) 위임
**언제 사용**:
- 대량의 사진/영상 파일 분석 시
- 프로젝트 전체 코드베이스 검색 시
- 복잡한 다단계 작업 수행 시 (시나리오 생성 → 편집 → 렌더링)
- 파일 간 의존성 분석 시

**사용 방법**:
```bash
--delegate files     # 파일별 분석 위임
--delegate folders   # 폴더별 분석 위임
--delegate auto      # 자동 판단하여 위임
```

**효과**: 40-70% 시간 절약, 정확한 파일 분석, 놓치기 쉬운 참조 발견

### 2. 슈퍼클로드 프레임워크
**주요 명령어**:
- `/analyze`: 코드 품질, 성능, 보안 분석
- `/improve`: 코드 개선 및 리팩토링
- `/implement`: 새 기능 구현 (페르소나 자동 활성화)
- `/troubleshoot`: 문제 조사 및 해결
- `/document`: 문서 작성
- `/design`: 시스템 설계

**페르소나 활용**:
- `--persona-frontend`: UI/UX 작업 (Electron 렌더러)
- `--persona-backend`: Python 백엔드 작업
- `--persona-analyzer`: 버그 분석
- `--persona-performance`: 렌더링 성능 최적화

**플래그 활용**:
- `--think`: 복잡한 문제 분석 (4K 토큰)
- `--think-hard`: 아키텍처 수준 분석 (10K 토큰)
- `--uc`: 토큰 효율 최적화 (30-50% 절감)
- `--validate`: 위험한 작업 전 검증
- `--loop`: 반복 개선 작업

### 3. MCP 서버
- **Context7** (`--c7`): MoviePy, Electron, React 공식 문서 조회
- **Sequential** (`--seq`): 복잡한 영상 편집 로직 분석
- **Magic** (`--magic`): UI 컴포넌트 생성

### 권장 워크플로우

**새 기능 구현**:
1. `/analyze --delegate auto` - 기존 코드 분석
2. `/design --persona-architect` - 설계 수립
3. `/implement --persona-frontend` (UI) 또는 `--persona-backend` (Python) - 구현
4. `/document` - 문서화

**버그 수정**:
1. `/troubleshoot --persona-analyzer --think` - 근본 원인 분석
2. `/implement` - 수정 구현
3. 테스트 및 검증

**성능 개선**:
1. `/analyze --persona-performance` - 성능 분석
2. `/improve --persona-performance --loop` - 반복 최적화
3. 렌더링 시간 측정으로 개선 효과 확인

## 📋 프로젝트 개요

### 초등학교 졸업영상 자동 제작 프로그램이란?
AI를 활용하여 졸업 사진/영상을 자동으로 편집하고, 감동적인 5분 분량의 Full HD 졸업영상을 제작하는 데스크톱 애플리케이션입니다.

**핵심 기능**:
1. **자동 시나리오 생성**: Gemini AI가 사진을 분석하여 최적의 영상 구성 자동 생성
2. **3단 모듈 편집**: 메인 스토리, 올스타 롤콜, 시간여행 (과거-현재-미래)
3. **AI 이미지 생성**: 학생들의 미래 모습을 AI로 생성 (선택적)
4. **자동 렌더링**: MoviePy 기반 Full HD 영상 자동 제작
5. **설정 관리**: API 키, 학교 정보, 렌더링 옵션 통합 관리

### 기술 스택
- **Frontend**: Electron 33.2.1 + React 18 + TypeScript
- **Backend**: Python 3.11 + MoviePy 1.0.3
- **AI**: Google Gemini 2.0 Flash (시나리오), Flux API (이미지 생성, 선택)
- **State Management**: React Context API + Electron IPC
- **Styling**: CSS Modules + 반응형 디자인
- **Build**: Vite 6.0.3 + electron-builder

## 🏗️ 아키텍처 상세

### 시스템 구조

```
┌─────────────────────────────────────────────────┐
│         Electron 메인 프로세스 (Node.js)          │
│  - IPC 통신 관리                                  │
│  - Python 프로세스 관리                           │
│  - 파일 시스템 접근                               │
└─────────────────┬───────────────────────────────┘
                  │ IPC
┌─────────────────▼───────────────────────────────┐
│       Electron 렌더러 프로세스 (React)           │
│  - UI 컴포넌트 (설정, 업로드, 프리뷰, 렌더링)      │
│  - 상태 관리 (Context API)                        │
│  - 사용자 인터랙션 처리                           │
└─────────────────┬───────────────────────────────┘
                  │ IPC
┌─────────────────▼───────────────────────────────┐
│         Python 백엔드 (MoviePy)                  │
│  - 영상 편집 엔진                                 │
│  - Gemini AI 통신                                │
│  - 파일 처리 (이미지/비디오)                      │
│  - 렌더링 실행                                    │
└──────────────────────────────────────────────────┘
```

**Electron 메인 프로세스**:
- Node.js 환경에서 실행
- 파일 시스템 전체 접근 권한
- Python 자식 프로세스 생성 및 관리
- IPC 메시지 라우팅

**Electron 렌더러 프로세스**:
- Chromium 브라우저 환경
- React 기반 사용자 인터페이스
- 샌드박스 환경에서 실행
- preload 스크립트를 통한 제한적 Node.js API 접근

**Python 백엔드가 중요한 이유**:
- MoviePy는 Python 전용 라이브러리 (JavaScript 포팅 불가)
- 영상 처리는 CPU 집약적 작업 → Python의 성숙한 멀티미디어 생태계 활용
- Gemini Python SDK가 가장 안정적이고 기능 완전

### 영상 제작 워크플로우

```
사용자 → 파일 업로드 → Gemini 시나리오 생성 → Python 영상 편집 → 렌더링 → 완성
   │           │                │                    │              │
   │      업로드 탭        시나리오 탭          편집 탭       렌더링 탭     다운로드
   │           │                │                    │              │
   └─ 설정 탭 ──┴────────────────┴────────────────────┴──────────────┘
      (API 키, 학교 정보, 렌더링 설정)
```

**해결하는 문제**:
- 수작업 영상 편집의 시간 소모 (3-5일 → 1.5시간)
- 전문 지식 없이도 고품질 영상 제작 가능
- 대량의 사진/영상 자료 효율적 관리
- 졸업생 개별 맞춤형 콘텐츠 자동 생성 (시간여행 모듈)

### IPC 통신 시스템

```typescript
// Electron 메인 → Python
ipcMain.handle('python:generateScenario', async (event, photos, videos) => {
  return await pythonProcess.generateScenario(photos, videos);
});

// React → Electron 메인 → Python → React
const scenario = await window.electronAPI.generateScenario(photos, videos);
```

**핵심 IPC 채널**:
- `settings:save` / `settings:load`: 설정 저장/불러오기
- `files:upload`: 파일 업로드 및 검증
- `python:generateScenario`: AI 시나리오 생성
- `python:renderVideo`: 영상 렌더링 실행
- `render:progress`: 렌더링 진행률 업데이트 (실시간)

### 설정 관리 모델

**저장 전략**:
- **Electron Store**: API 키, 학교 정보, 렌더링 프리셋 (암호화 저장)
- **LocalStorage**: UI 상태, 사용자 선호도
- **파일 시스템**: 업로드된 사진/영상, 렌더링 결과

**동기화 패턴**:
```
설정 탭 (React) → IPC → 메인 프로세스 → Electron Store
                                    ↓
                           Python 프로세스 (환경 변수)
```

### 오류 복구 패턴

**다층 복원력**:
- **Python 프로세스 크래시**: 자동 재시작, 진행 중인 작업 체크포인트 복원
- **Gemini API 실패**: 재시도 로직 (3회), 타임아웃 처리, 사용자 알림
- **렌더링 실패**: 임시 파일 정리, 오류 로그 저장, 사용자 친화적 에러 메시지
- **파일 손상**: 업로드 시 검증, 지원 형식 확인, 손상된 파일 건너뛰기

## 📁 프로젝트 구조

### 디렉토리 구조
```
movie2025/
├── src/
│   ├── main/                  # Electron 메인 프로세스
│   │   ├── index.ts          # 앱 진입점
│   │   ├── ipc/              # IPC 핸들러
│   │   └── python/           # Python 프로세스 관리
│   ├── renderer/              # React 렌더러
│   │   ├── components/       # UI 컴포넌트
│   │   │   ├── Settings.tsx  # 설정 탭
│   │   │   ├── Upload.tsx    # 파일 업로드
│   │   │   ├── Scenario.tsx  # 시나리오 생성
│   │   │   └── Render.tsx    # 렌더링 제어
│   │   ├── contexts/         # React Context
│   │   └── App.tsx           # 루트 컴포넌트
│   ├── preload/              # Preload 스크립트
│   └── types/                # TypeScript 타입 정의
├── python/                    # Python 백엔드
│   ├── main.py               # Python 진입점
│   ├── video_editor.py       # MoviePy 편집 엔진
│   ├── gemini_client.py      # Gemini AI 클라이언트
│   └── modules/              # 영상 모듈 (메인, 롤콜, 시간여행)
├── resources/                 # 번들 리소스
│   ├── fonts/                # 한글 폰트 (NanumGothic)
│   └── templates/            # 템플릿 이미지
└── dist/                     # 빌드 결과물
```

### Python 모듈 구조
`python/modules/` 디렉토리에 영상 편집 로직 모듈화:
- `main_story.py`: 메인 스토리 생성 (사진 + 영상 클립, Ken Burns 효과)
- `roll_call.py`: 올스타 롤콜 (증명사진 슬라이드쇼)
- `time_travel.py`: 시간여행 (과거-현재-미래, AI 이미지 생성)
- `credits.py`: 엔딩 크레딧 (졸업생 명단)
- `compositor.py`: 모든 모듈 조립 및 최종 렌더링

### IPC 통신 패턴
**메인 프로세스 (src/main/ipc/)**:
```typescript
// 예시: 시나리오 생성 핸들러
ipcMain.handle('python:generateScenario', async (event, data) => {
  try {
    const result = await pythonBridge.call('generate_scenario', data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

**렌더러 프로세스 (src/renderer/)**:
```typescript
// preload에서 노출된 API 사용
const result = await window.electronAPI.generateScenario({
  photos: photoList,
  videos: videoList,
  targetDuration: 180
});
```

### 설정 중앙화
**Electron Store 사용**:
```typescript
// src/main/store.ts
import Store from 'electron-store';

interface AppSettings {
  geminiApiKey: string;
  fluxApiKey?: string;
  schoolName: string;
  schoolLogo?: string;
  backgroundMusic?: string;
  renderPreset: 'high' | 'medium' | 'low';
}

const store = new Store<AppSettings>({
  defaults: {
    schoolName: '',
    renderPreset: 'high'
  },
  encryptionKey: process.env.ENCRYPTION_KEY // API 키 암호화
});
```

## 🔑 핵심 타입 정의

```typescript
// src/types/index.ts

/** 학생 정보 */
interface Student {
  name: string;              // 이름
  babyPhotoPath: string;     // 어릴 때 사진 경로
  dreamJob: string;          // 장래희망
  idPhotoPath?: string;      // 증명사진 경로 (자동 매핑)
}

/** 시나리오 장면 */
interface Scene {
  type: 'photo' | 'video';   // 미디어 타입
  file: string;              // 파일 경로
  duration: number;          // 재생 시간 (초)
  description?: string;      // 설명
  effect?: 'kenburns' | 'fade' | 'zoom'; // 효과
}

/** AI 생성 시나리오 */
interface Scenario {
  opening: {
    duration: number;
    text: string;
  };
  mainStory: Scene[];        // 메인 스토리 장면들
  totalDuration: number;     // 전체 예상 길이
}

/** 렌더링 설정 */
interface RenderOptions {
  resolution: '1920x1080' | '1280x720';
  fps: 30 | 60;
  codec: 'libx264' | 'libx265';
  preset: 'ultrafast' | 'fast' | 'medium' | 'slow';
  bitrate: string;           // 예: '8000k'
}

/** 렌더링 진행 상태 */
interface RenderProgress {
  stage: 'preparing' | 'rendering' | 'finalizing' | 'complete';
  percent: number;           // 0-100
  currentModule: 'main' | 'rollcall' | 'timetravel' | 'credits';
  estimatedTimeLeft: number; // 초
  message: string;           // 상태 메시지
}

/** 앱 설정 */
interface AppSettings {
  geminiApiKey: string;
  fluxApiKey?: string;
  schoolName: string;
  schoolLogo?: string;
  backgroundMusic?: string;
  renderPreset: 'high' | 'medium' | 'low';
  useFlux: boolean;          // AI 이미지 생성 사용 여부
}
```

## 🛠️ 필수 명령어

```bash
# 의존성 설치
npm install

# Python 의존성 설치
pip install -r python/requirements.txt

# 개발 서버 시작 (Electron + Vite)
npm run dev

# Python 백엔드 단독 테스트
python python/main.py

# 프로덕션 빌드
npm run build

# 설치 파일 생성 (Windows)
npm run build:win

# 설치 파일 생성 (macOS)
npm run build:mac

# 타입 체크
npm run type-check

# 린트 실행
npm run lint
```

## 🔧 일반 개발 작업

### 새 영상 모듈 추가
1. `python/modules/` 에 새 모듈 파일 생성 (예: `special_effects.py`)
2. MoviePy를 사용한 영상 생성 함수 구현:
   ```python
   from moviepy.editor import *

   def create_special_effect(params):
       clips = []
       # 영상 편집 로직
       return concatenate_videoclips(clips)
   ```
3. `python/modules/compositor.py`에 모듈 통합:
   ```python
   from modules.special_effects import create_special_effect

   # final_assembly 함수에 추가
   special_clip = create_special_effect(settings)
   video_clips.append(special_clip)
   ```
4. IPC 핸들러 추가 (필요 시):
   ```typescript
   // src/main/ipc/video.ts
   ipcMain.handle('python:createSpecialEffect', async (event, params) => {
       return await pythonBridge.call('create_special_effect', params);
   });
   ```
5. React 컴포넌트에서 호출 (필요 시)

### 새 설정 옵션 추가
1. `src/types/index.ts`에 타입 추가:
   ```typescript
   interface AppSettings {
       // 기존 필드...
       newOption: string;
   }
   ```
2. `src/main/store.ts`에 기본값 추가:
   ```typescript
   const store = new Store<AppSettings>({
       defaults: {
           // 기존 기본값...
           newOption: 'default'
       }
   });
   ```
3. `src/renderer/components/Settings.tsx`에 UI 추가:
   ```tsx
   <input
       type="text"
       value={settings.newOption}
       onChange={(e) => updateSettings({ newOption: e.target.value })}
   />
   ```
4. Python 백엔드에서 설정 사용 (IPC로 전달)

### UI 컴포넌트 추가
1. `src/renderer/components/` 에 새 컴포넌트 파일 생성
2. TypeScript + React 컴포넌트 작성:
   ```tsx
   import React from 'react';

   interface Props {
       // props 정의
   }

   export const NewComponent: React.FC<Props> = ({ /* props */ }) => {
       return <div>{/* JSX */}</div>;
   };
   ```
3. `App.tsx`에 임포트 및 사용
4. 스타일링 (CSS Modules 권장):
   ```css
   /* NewComponent.module.css */
   .container {
       /* 스타일 */
   }
   ```

## 🐛 문제 해결

### Python 프로세스가 시작되지 않음
- **원인**: Python 경로 문제, 의존성 미설치
- **해결**:
  1. `python --version` 확인 (3.11 이상)
  2. `pip install -r python/requirements.txt` 재실행
  3. Electron 메인 프로세스 로그 확인
  4. `src/main/python/bridge.ts`에서 Python 경로 확인

### Gemini API 호출 실패
- **원인**: API 키 오류, 네트워크 문제, 할당량 초과
- **해결**:
  1. 설정 탭에서 API 키 재확인
  2. https://makersuite.google.com 에서 키 상태 확인
  3. 월 60회 무료 할당량 확인
  4. 네트워크 연결 상태 확인
  5. `python/gemini_client.py` 로그 확인

### 렌더링 중 메모리 부족 오류
- **원인**: 고해상도 이미지/영상 대량 처리, RAM 부족
- **해결**:
  1. 렌더링 프리셋을 'medium' 또는 'low'로 변경
  2. 이미지 해상도 사전 다운샘플링 (4K → Full HD)
  3. 영상 클립 개수 줄이기
  4. MoviePy 임시 파일 정리: `python/temp/` 폴더 삭제
  5. 시스템 RAM 16GB 이상 권장

### 한글 폰트가 렌더링되지 않음
- **원인**: 폰트 파일 누락, 경로 오류
- **해결**:
  1. `resources/fonts/NanumGothic.ttf` 존재 확인
  2. Python 코드에서 폰트 경로 확인:
     ```python
     font_path = os.path.join(resources_dir, 'fonts', 'NanumGothic.ttf')
     ```
  3. Windows: 시스템 폰트 폴더에 설치
  4. macOS: Font Book으로 설치

### IPC 통신 에러
- **원인**: preload 스크립트 오류, 채널 이름 불일치
- **해결**:
  1. `src/preload/index.ts` 에서 노출된 API 확인
  2. 메인 프로세스 핸들러와 렌더러 호출의 채널 이름 일치 확인
  3. 개발자 도구 콘솔에서 에러 메시지 확인
  4. contextBridge 샌드박스 제약 확인

## 🎓 모범 사례

### 코드 품질
- **타입 안정성**: 모든 함수와 변수에 TypeScript 타입 명시
- **에러 처리**: try-catch로 모든 비동기 작업 감싸기
- **IPC 검증**: 메인 프로세스에서 렌더러 입력 검증 필수
- **Python 타입 힌트**: 함수 시그니처에 타입 힌트 사용
- 매직 넘버 대신 상수 사용 (예: `FULL_HD_WIDTH = 1920`)
- 모든 비동기 작업에 에러 핸들링

### 성능
- 대량 파일 처리 시 청크 단위로 분할
- 이미지 썸네일 생성으로 메모리 절약
- MoviePy 클립 사용 후 명시적 해제: `clip.close()`
- Python 멀티프로세싱 활용 (렌더링 병렬화)
- 렌더링 전 메모리 예측 및 경고

### 보안
- **API 키 암호화**: Electron Store encryptionKey 사용
- **파일 검증**: 업로드 시 파일 확장자, MIME 타입, 크기 검증
- **경로 검증**: 사용자 입력 경로 정규화 (path traversal 방지)
- **샌드박스**: 렌더러 프로세스 샌드박스 활성화
- 환경 변수에 민감 정보 저장 (.env 파일, git 제외)
- 사용자 입력 검증 (XSS 방지)

### 사용자 경험
- **진행률 표시**: 렌더링 중 실시간 진행률 업데이트
- **에러 메시지**: 기술 용어 피하고 해결 방법 제시
- **자동 저장**: 설정 변경 시 즉시 저장
- **미리보기**: 렌더링 전 시나리오 미리보기 제공
- **체크포인트**: 장시간 작업 중간 저장

### 테스트
- **단위 테스트**: Python 모듈별 pytest 작성
- **통합 테스트**: IPC 통신 E2E 테스트
- **파일 검증**: 다양한 형식의 샘플 파일로 테스트
- **메모리 테스트**: 대량 파일 처리 시 메모리 누수 확인
- **크로스 플랫폼**: Windows, macOS에서 빌드 및 실행 테스트

### 문서화
- 복잡한 영상 편집 로직에 주석 추가
- IPC 채널 목록 문서화 (`docs/IPC_CHANNELS.md`)
- 새 모듈 추가 시 CLAUDE.md 업데이트
- Python 함수 docstring 작성 (Google 스타일)
- 변경 사항을 명확한 커밋 메시지로 문서화

## 📚 추가 리소스

### 관련 문서
- `졸업영상제작_작업지시서_v2.md`: 상세 기능 명세
- `docs/ARCHITECTURE.md`: 시스템 아키텍처 다이어그램
- `docs/API.md`: Python-Electron IPC API 레퍼런스

### 외부 의존성 문서
- [Electron 공식 문서](https://www.electronjs.org/docs)
- [MoviePy 문서](https://zulko.github.io/moviepy/)
- [Gemini API 문서](https://ai.google.dev/docs)
- [React 공식 문서](https://react.dev/)

### 유용한 도구
- **Electron Devtools**: 렌더러 프로세스 디버깅
- **Python Debugger**: `python -m pdb main.py`
- **FFmpeg**: 영상 인코딩 문제 분석
- **Postman**: Gemini API 직접 테스트

---

**이 문서는 프로젝트와 함께 지속적으로 업데이트됩니다.**
**새로운 기능 추가 시 반드시 CLAUDE.md도 함께 수정하세요.**
