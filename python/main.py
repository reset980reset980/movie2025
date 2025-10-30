#\!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
졸업영상 자동 제작 프로그램 - Python 백엔드
Electron 메인 프로세스와 IPC 통신하여 영상 처리 수행
"""

import sys
import json
import os
from pathlib import Path
from typing import Dict, Any

from gemini_client import GeminiClient
from video_editor import VideoEditor


class GraduationVideoBackend:
    """졸업영상 백엔드 메인 클래스"""

    def __init__(self):
        """백엔드 초기화"""
        self.gemini_client: GeminiClient | None = None
        self.video_editor: VideoEditor | None = None

        # 리소스 디렉토리 (fonts, templates)
        self.resources_dir = Path(__file__).parent.parent / "resources"
        self.output_dir = Path.home() / "Documents" / "GraduationVideos"
        self.output_dir.mkdir(parents=True, exist_ok=True)

        print(f"[백엔드] 초기화 완료 - 출력 디렉토리: {self.output_dir}", file=sys.stderr)

    def initialize_gemini(self, api_key: str):
        """Gemini 클라이언트 초기화"""
        try:
            self.gemini_client = GeminiClient(api_key)
            print("[백엔드] Gemini 클라이언트 초기화 완료", file=sys.stderr)
        except Exception as e:
            print(f"[백엔드] Gemini 초기화 실패: {e}", file=sys.stderr)
            raise

    def initialize_video_editor(self, progress_callback=None):
        """비디오 편집기 초기화"""
        try:
            self.video_editor = VideoEditor(
                resources_dir=str(self.resources_dir),
                output_dir=str(self.output_dir),
                progress_callback=progress_callback
            )
            print("[백엔드] VideoEditor 초기화 완료", file=sys.stderr)
        except Exception as e:
            print(f"[백엔드] VideoEditor 초기화 실패: {e}", file=sys.stderr)
            raise

    def generate_scenario(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """AI 시나리오 생성"""
        try:
            api_key = data.get("apiKey")
            photo_paths = data.get("photoPaths", [])
            video_paths = data.get("videoPaths", [])
            target_duration = data.get("targetDuration", 180)
            school_name = data.get("schoolName", "")

            if not api_key:
                return {"success": False, "error": "Gemini API 키가 필요합니다"}

            if not photo_paths:
                return {"success": False, "error": "사진이 최소 1장 이상 필요합니다"}

            # Gemini 클라이언트 초기화
            if not self.gemini_client:
                self.initialize_gemini(api_key)

            # 시나리오 생성
            scenario = self.gemini_client.generate_full_scenario(
                photo_paths=photo_paths,
                video_paths=video_paths,
                target_duration=target_duration,
                school_name=school_name
            )

            return {"success": True, "data": scenario}

        except Exception as e:
            return {"success": False, "error": f"시나리오 생성 실패: {str(e)}"}

    def render_video(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """영상 렌더링"""
        try:
            scenario = data.get("scenario")
            modules = data.get("modules", {"mainStory": True})
            settings = data.get("settings", {})

            if not scenario:
                return {"success": False, "error": "시나리오가 필요합니다"}

            # 진행률 콜백
            def progress_callback(progress_data):
                progress_message = {
                    "type": "progress",
                    "data": progress_data
                }
                print(json.dumps(progress_message, ensure_ascii=False))
                sys.stdout.flush()

            # 비디오 편집기 초기화
            if not self.video_editor:
                self.initialize_video_editor(progress_callback)

            school_name = settings.get("schoolName", "")
            school_logo = settings.get("schoolLogo")
            background_music = settings.get("backgroundMusic")
            render_preset = settings.get("renderPreset", "medium")

            # 출력 파일 경로
            import time
            timestamp = int(time.time())
            output_filename = f"{school_name}_졸업영상_{timestamp}.mp4"
            output_path = self.output_dir / output_filename

            # 렌더링
            clips = []

            # 1. 오프닝
            opening_clip = self.video_editor.create_opening(
                school_name=school_name,
                duration=scenario.get("opening", {}).get("duration", 10),
                logo_path=school_logo
            )
            clips.append(opening_clip)

            # 2. 메인 스토리
            if modules.get("mainStory", True):
                main_story_clip = self.video_editor.create_main_story(
                    scenario=scenario,
                    background_music=background_music
                )
                clips.append(main_story_clip)

            # 최종 렌더링
            from moviepy.editor import concatenate_videoclips
            final_clip = concatenate_videoclips(clips, method="compose")

            self.video_editor.render_video(
                final_clip,
                str(output_path),
                preset=render_preset,
                fps=30
            )

            return {"success": True, "data": {"outputPath": str(output_path)}}

        except Exception as e:
            import traceback
            traceback.print_exc(file=sys.stderr)
            return {"success": False, "error": f"렌더링 실패: {str(e)}"}


def main():
    """Python 백엔드 진입점"""
    print("[백엔드] Python 백엔드 시작됨", file=sys.stderr)

    backend = GraduationVideoBackend()

    for line in sys.stdin:
        try:
            message = json.loads(line.strip())
            command = message.get('command')
            data = message.get('data', {})

            if command == 'generate_scenario':
                response = backend.generate_scenario(data)
            elif command == 'render_video':
                response = backend.render_video(data)
            elif command == 'ping':
                response = {'success': True, 'data': 'pong'}
            else:
                response = {'success': False, 'error': f'알 수 없는 명령어: {command}'}

            print(json.dumps(response, ensure_ascii=False))
            sys.stdout.flush()

        except json.JSONDecodeError as e:
            error_response = {'success': False, 'error': f'JSON 파싱 오류: {str(e)}'}
            print(json.dumps(error_response, ensure_ascii=False))
            sys.stdout.flush()
        except Exception as e:
            import traceback
            traceback.print_exc(file=sys.stderr)
            error_response = {'success': False, 'error': f'처리 오류: {str(e)}'}
            print(json.dumps(error_response, ensure_ascii=False))
            sys.stdout.flush()


if __name__ == '__main__':
    main()
