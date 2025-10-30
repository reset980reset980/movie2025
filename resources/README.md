# 리소스 파일 가이드

이 디렉토리에는 졸업영상 제작에 필요한 리소스 파일들이 포함됩니다.

## 📝 필수 파일 목록

### 1. 폰트 파일 (`fonts/`)

한글 텍스트 렌더링을 위한 폰트 파일이 필요합니다.

**필수 폰트**:
- `NanumGothic.ttf` - 나눔고딕 폰트

**다운로드 방법**:
1. [네이버 나눔글꼴](https://hangeul.naver.com/font) 접속
2. 나눔고딕 다운로드
3. `NanumGothic.ttf` 파일을 `resources/fonts/` 폴더에 복사

**또는 시스템 폰트 사용**:
```bash
# Ubuntu/Debian
sudo apt-get install fonts-nanum

# macOS
brew install font-nanum-gothic

# Windows
# 제어판 > 글꼴에서 나눔고딕 설치
```

### 2. 템플릿 이미지 (`templates/`)

선택적으로 사용할 수 있는 템플릿 이미지들입니다.

**권장 템플릿**:
- `background.png` - 기본 배경 이미지 (1920x1080)
- `overlay.png` - 오버레이 효과 (1920x1080, 투명도 포함)
- `frame.png` - 사진 프레임 (선택사항)

**템플릿 제작 가이드**:
- 해상도: 1920x1080 (Full HD)
- 형식: PNG (투명도 지원) 또는 JPG
- 색상: RGB

## 🚀 빠른 설정

### Windows
```powershell
# 나눔고딕 폰트 다운로드 및 설치
Invoke-WebRequest -Uri "https://github.com/naver/nanumfont/releases/download/VER2.5/NanumFont_TTF_ALL.zip" -OutFile "NanumFont.zip"
Expand-Archive -Path "NanumFont.zip" -DestinationPath "."
Copy-Item "NanumFont_TTF_ALL/NanumGothic.ttf" "resources/fonts/"
```

### macOS/Linux
```bash
# 나눔고딕 설치
# macOS
brew install font-nanum-gothic

# Ubuntu/Debian
sudo apt-get install fonts-nanum

# 폰트 파일 복사 (시스템 설치 후)
# macOS
cp /Library/Fonts/NanumGothic.ttf resources/fonts/

# Linux
cp /usr/share/fonts/truetype/nanum/NanumGothic.ttf resources/fonts/
```

## ⚠️ 주의사항

1. **폰트 라이선스**: 나눔글꼴은 SIL Open Font License로 무료 사용 가능합니다.
2. **파일 크기**: 폰트 파일은 Git에 포함되지 않으므로 각 환경에서 직접 설치해야 합니다.
3. **경로 확인**: Python 백엔드에서 자동으로 폰트를 찾지만, 수동 설정도 가능합니다.

## 🔧 문제 해결

### 폰트가 렌더링되지 않을 때
```python
# video_editor.py에서 폰트 경로 수동 설정
self.font_path = "/path/to/your/NanumGothic.ttf"
```

### 템플릿 이미지가 없을 때
- 템플릿은 선택사항이므로 없어도 기본 렌더링은 정상 작동합니다.
- 배경색이나 효과가 필요한 경우에만 추가하세요.
