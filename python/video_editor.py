"""
MoviePy 영상 편집 엔진
"""

import os
import sys
from typing import Dict, Any, List, Callable, Optional
from pathlib import Path
from moviepy.editor import *
from moviepy.video.fx.all import *


class VideoEditor:
    """MoviePy 기반 영상 편집 클래스"""

    def __init__(
        self,
        resources_dir: str,
        output_dir: str = "./output",
        progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ):
        """
        비디오 편집기 초기화

        Args:
            resources_dir: 리소스 디렉토리 (폰트, 템플릿 등)
            output_dir: 출력 디렉토리
            progress_callback: 진행률 콜백 함수
        """
        self.resources_dir = Path(resources_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.progress_callback = progress_callback or (lambda x: None)

        # 폰트 경로
        self.font_path = str(self.resources_dir / "fonts" / "NanumGothic.ttf")
        if not os.path.exists(self.font_path):
            print(f"[경고] 폰트 파일을 찾을 수 없습니다: {self.font_path}")
            self.font_path = "Arial"  # 기본 폰트

    def report_progress(
        self,
        stage: str,
        percent: float,
        message: str,
        current_module: str = "main",
        estimated_time_left: int = 0
    ):
        """진행률 보고"""
        self.progress_callback({
            "stage": stage,
            "percent": percent,
            "message": message,
            "currentModule": current_module,
            "estimatedTimeLeft": estimated_time_left
        })

    def create_ken_burns_effect(
        self,
        image_path: str,
        duration: float = 3.0,
        zoom_factor: float = 1.2
    ) -> VideoClip:
        """
        Ken Burns 효과 (확대/이동 효과)

        Args:
            image_path: 이미지 파일 경로
            duration: 지속 시간 (초)
            zoom_factor: 확대 비율

        Returns:
            VideoClip
        """
        try:
            img_clip = ImageClip(image_path, duration=duration)

            # 1920x1080 크기로 조정
            img_clip = img_clip.resize(height=1080)

            def zoom(t):
                """시간에 따른 확대"""
                scale = 1 + (zoom_factor - 1) * (t / duration)
                return scale

            # 확대 효과 적용
            img_clip = img_clip.resize(lambda t: zoom(t))

            return img_clip.set_position('center')

        except Exception as e:
            print(f"[오류] Ken Burns 효과 생성 실패 ({image_path}): {e}")
            # 기본 이미지 클립 반환
            return ImageClip(image_path, duration=duration).resize(height=1080)

    def create_text_clip(
        self,
        text: str,
        duration: float,
        font_size: int = 60,
        color: str = 'white',
        position: str = 'center'
    ) -> TextClip:
        """
        텍스트 클립 생성

        Args:
            text: 텍스트 내용
            duration: 지속 시간
            font_size: 폰트 크기
            color: 텍스트 색상
            position: 위치

        Returns:
            TextClip
        """
        try:
            txt_clip = TextClip(
                text,
                fontsize=font_size,
                color=color,
                font=self.font_path,
                method='caption',
                size=(1600, None),
                align='center'
            ).set_duration(duration).set_position(position)

            # 페이드 인/아웃
            txt_clip = txt_clip.crossfadein(0.5).crossfadeout(0.5)

            return txt_clip

        except Exception as e:
            print(f"[오류] 텍스트 클립 생성 실패: {e}")
            # 기본 텍스트 클립
            return TextClip(
                text,
                fontsize=font_size,
                color=color,
                method='caption'
            ).set_duration(duration).set_position(position)

    def create_opening(
        self,
        school_name: str,
        duration: float = 10.0,
        logo_path: Optional[str] = None
    ) -> VideoClip:
        """
        오프닝 영상 생성

        Args:
            school_name: 학교 이름
            duration: 지속 시간
            logo_path: 학교 로고 경로 (선택)

        Returns:
            VideoClip
        """
        self.report_progress("preparing", 5, "오프닝 생성 중...", "main")

        # 검은 배경
        background = ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=duration)

        clips = [background]

        # 학교 로고 (있는 경우)
        if logo_path and os.path.exists(logo_path):
            try:
                logo = (ImageClip(logo_path)
                    .resize(height=300)
                    .set_duration(duration)
                    .set_position(('center', 200))
                    .crossfadein(1.0)
                    .crossfadeout(1.0))
                clips.append(logo)
            except Exception as e:
                print(f"[경고] 로고 로드 실패: {e}")

        # 제목 텍스트
        title_text = self.create_text_clip(
            f"{school_name}\n졸업을 축하합니다",
            duration,
            font_size=80,
            position=('center', 600)
        )
        clips.append(title_text)

        return CompositeVideoClip(clips)

    def create_main_story(
        self,
        scenario: Dict[str, Any],
        background_music: Optional[str] = None
    ) -> VideoClip:
        """
        메인 스토리 영상 생성

        Args:
            scenario: 시나리오 딕셔너리
            background_music: 배경 음악 경로

        Returns:
            VideoClip
        """
        self.report_progress("rendering", 20, "메인 스토리 생성 중...", "main")

        clips = []
        total_scenes = len(scenario.get("mainStory", []))

        for i, scene in enumerate(scenario.get("mainStory", [])):
            try:
                if scene["type"] == "photo":
                    # 사진 클립
                    if scene.get("effect") == "kenburns":
                        clip = self.create_ken_burns_effect(
                            scene["file"],
                            duration=scene["duration"]
                        )
                    else:
                        clip = ImageClip(scene["file"], duration=scene["duration"]).resize(height=1080)

                    # 설명 자막 (있는 경우)
                    if scene.get("description"):
                        desc_text = self.create_text_clip(
                            scene["description"],
                            scene["duration"],
                            font_size=40,
                            position=('center', 950)
                        )
                        clip = CompositeVideoClip([clip, desc_text])

                elif scene["type"] == "video":
                    # 비디오 클립
                    clip = VideoFileClip(scene["file"]).subclip(0, min(scene["duration"], 10))
                    clip = clip.resize(height=1080)

                else:
                    continue

                # 페이드 전환
                clip = clip.crossfadein(0.5).crossfadeout(0.5)
                clips.append(clip)

                # 진행률 업데이트
                progress = 20 + (i / total_scenes) * 40
                self.report_progress(
                    "rendering",
                    progress,
                    f"메인 스토리 생성 중... ({i+1}/{total_scenes})",
                    "main"
                )

            except Exception as e:
                print(f"[오류] 장면 생성 실패 ({scene.get('file')}): {e}")
                continue

        if not clips:
            # 빈 클립 방지
            return ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=5)

        # 클립 연결
        final_clip = concatenate_videoclips(clips, method="compose")

        # 배경 음악 추가 (있는 경우)
        if background_music and os.path.exists(background_music):
            try:
                audio = AudioFileClip(background_music).subclip(0, final_clip.duration)
                audio = audio.volumex(0.3)  # 볼륨 30%
                final_clip = final_clip.set_audio(audio)
            except Exception as e:
                print(f"[경고] 배경 음악 추가 실패: {e}")

        return final_clip

    def create_ending_credits(
        self,
        student_names: List[str],
        duration: float = 30.0
    ) -> VideoClip:
        """
        엔딩 크레딧 생성

        Args:
            student_names: 학생 이름 리스트
            duration: 지속 시간

        Returns:
            VideoClip
        """
        self.report_progress("rendering", 85, "엔딩 크레딧 생성 중...", "credits")

        # 검은 배경
        background = ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=duration)

        # 크레딧 텍스트
        credits_text = "\n\n".join([
            "졸업생 명단",
            "",
            "\n".join(student_names[:50])  # 최대 50명
        ])

        txt_clip = self.create_text_clip(
            credits_text,
            duration,
            font_size=40,
            position=('center', 200)
        )

        return CompositeVideoClip([background, txt_clip])

    def render_video(
        self,
        final_clip: VideoClip,
        output_path: str,
        preset: str = 'medium',
        fps: int = 30
    ):
        """
        최종 영상 렌더링

        Args:
            final_clip: 최종 비디오 클립
            output_path: 출력 파일 경로
            preset: 인코딩 프리셋 (ultrafast, fast, medium, slow)
            fps: 프레임레이트
        """
        self.report_progress("finalizing", 90, "최종 렌더링 중...", "main")

        try:
            final_clip.write_videofile(
                output_path,
                fps=fps,
                codec='libx264',
                preset=preset,
                audio_codec='aac',
                threads=4,
                logger=None  # 로그 억제
            )

            self.report_progress("complete", 100, "렌더링 완료!", "main")
            print(f"[완료] 영상 저장: {output_path}")

        except Exception as e:
            print(f"[오류] 렌더링 실패: {e}")
            raise

        finally:
            # 리소스 정리
            final_clip.close()
