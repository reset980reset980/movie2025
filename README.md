# 🎓 졸업영상 자동 제작 프로그램

AI 기반 초등학교 졸업영상 자동 편집 시스템

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
# Node.js 의존성
npm install

# Python 의존성
pip install -r python/requirements.txt
```

### 2. 개발 서버 실행

```bash
npm run electron:dev
```

### 3. 프로덕션 빌드

```bash
# Windows 설치 파일 생성
npm run build:win

# macOS 설치 파일 생성
npm run build:mac
```

## 📋 주요 기능

- ✅ **설정 관리**: API 키, 학교 정보, 렌더링 옵션 통합 관리
- 🚧 **파일 업로드**: 사진, 영상, 증명사진, 학생 정보 업로드 (구현 예정)
- 🚧 **AI 시나리오 생성**: Gemini AI 자동 시나리오 작성 (구현 예정)
- 🚧 **자동 렌더링**: MoviePy 기반 Full HD 영상 제작 (구현 예정)

## 🏗️ 기술 스택

- **Frontend**: Electron 33 + React 18 + TypeScript
- **Backend**: Python 3.11 + MoviePy 1.0.3
- **AI**: Google Gemini 2.0 Flash
- **Build**: Vite 6.0.3

## 📁 프로젝트 구조

```
movie2025/
├── electron/           # Electron 메인 프로세스
│   ├── main.ts        # 앱 진입점
│   └── preload.ts     # Preload 스크립트
├── src/               # React 렌더러
│   ├── components/    # UI 컴포넌트
│   ├── contexts/      # React Context
│   ├── types/         # TypeScript 타입
│   └── App.tsx        # 루트 컴포넌트
├── python/            # Python 백엔드
│   ├── main.py        # Python 진입점
│   └── modules/       # 영상 편집 모듈
└── resources/         # 리소스 파일
```

## 📝 개발 가이드

자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 📄 라이선스

MIT License

## 🤝 기여

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ using React, Electron, Python, and AI**
