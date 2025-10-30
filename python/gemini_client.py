"""
Gemini API 클라이언트
AI 시나리오 생성 및 이미지 분석
"""

import os
import json
import base64
from typing import List, Dict, Any, Optional
from pathlib import Path
import google.generativeai as genai


class GeminiClient:
    """Gemini API를 사용한 AI 시나리오 생성 클래스"""

    def __init__(self, api_key: str):
        """
        Gemini 클라이언트 초기화

        Args:
            api_key: Gemini API 키
        """
        if not api_key:
            raise ValueError("Gemini API 키가 필요합니다")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')

    def analyze_photos(self, photo_paths: List[str]) -> List[Dict[str, Any]]:
        """
        사진 분석 - 각 사진의 내용, 감정, 중요도 평가

        Args:
            photo_paths: 분석할 사진 경로 리스트

        Returns:
            분석 결과 리스트 [{"path": str, "description": str, "emotion": str, "importance": int}]
        """
        results = []

        for photo_path in photo_paths[:50]:  # 최대 50장까지 분석 (API 제한)
            try:
                # 이미지 읽기
                with open(photo_path, 'rb') as f:
                    image_data = f.read()

                # Gemini에 이미지 분석 요청
                prompt = """
                이 사진을 분석해주세요:
                1. 사진 속 주요 장면이나 활동 설명
                2. 전반적인 감정 (즐거움, 감동, 평온 등)
                3. 졸업영상에서의 중요도 (1-10점)

                JSON 형식으로 답변:
                {
                    "description": "사진 설명",
                    "emotion": "감정",
                    "importance": 점수
                }
                """

                response = self.model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_data}])

                # JSON 파싱
                try:
                    analysis = json.loads(response.text)
                    results.append({
                        "path": photo_path,
                        "description": analysis.get("description", ""),
                        "emotion": analysis.get("emotion", ""),
                        "importance": analysis.get("importance", 5)
                    })
                except json.JSONDecodeError:
                    # JSON 파싱 실패 시 기본값
                    results.append({
                        "path": photo_path,
                        "description": response.text[:100],
                        "emotion": "알 수 없음",
                        "importance": 5
                    })

            except Exception as e:
                print(f"사진 분석 실패 ({photo_path}): {e}")
                results.append({
                    "path": photo_path,
                    "description": "분석 실패",
                    "emotion": "알 수 없음",
                    "importance": 5
                })

        return results

    def generate_scenario(
        self,
        photo_analyses: List[Dict[str, Any]],
        video_paths: List[str],
        target_duration: int = 180,
        school_name: str = ""
    ) -> Dict[str, Any]:
        """
        AI 시나리오 생성

        Args:
            photo_analyses: 사진 분석 결과 리스트
            video_paths: 비디오 파일 경로 리스트
            target_duration: 목표 영상 길이 (초)
            school_name: 학교 이름

        Returns:
            시나리오 딕셔너리
        """
        # 프롬프트 생성
        prompt = f"""
        {school_name} 초등학교 졸업영상 시나리오를 생성해주세요.

        **사진 분석 결과**:
        {json.dumps(photo_analyses, ensure_ascii=False, indent=2)[:3000]}

        **비디오 파일 수**: {len(video_paths)}개
        **목표 영상 길이**: {target_duration}초

        다음 JSON 형식으로 시나리오를 생성해주세요:
        {{
            "opening": {{
                "duration": 10,
                "text": "오프닝 자막"
            }},
            "mainStory": [
                {{
                    "type": "photo",
                    "file": "파일경로",
                    "duration": 3,
                    "description": "장면 설명",
                    "effect": "kenburns"
                }},
                {{
                    "type": "video",
                    "file": "파일경로",
                    "duration": 5,
                    "description": "장면 설명"
                }}
            ],
            "totalDuration": {target_duration}
        }}

        **중요**:
        - 중요도가 높은 사진을 우선 선택
        - 감정의 흐름을 고려하여 배치 (입학 → 학교생활 → 추억 → 졸업)
        - 사진은 2-4초, 영상은 3-7초 배치
        - Ken Burns 효과를 적절히 사용
        - 총 길이가 목표 시간에 가깝도록 조정
        """

        try:
            response = self.model.generate_content(prompt)

            # JSON 추출 (마크다운 코드 블록 제거)
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            scenario = json.loads(response_text.strip())

            # 파일 경로 매핑 (분석 결과의 실제 경로 사용)
            photo_map = {os.path.basename(p["path"]): p["path"] for p in photo_analyses}

            for scene in scenario.get("mainStory", []):
                if scene["type"] == "photo":
                    filename = os.path.basename(scene["file"])
                    if filename in photo_map:
                        scene["file"] = photo_map[filename]
                elif scene["type"] == "video" and video_paths:
                    # 비디오는 순서대로 매핑
                    scene["file"] = video_paths[0] if video_paths else scene["file"]

            return scenario

        except Exception as e:
            print(f"시나리오 생성 실패: {e}")
            # 기본 시나리오 반환
            return {
                "opening": {
                    "duration": 10,
                    "text": f"{school_name} 졸업을 축하합니다"
                },
                "mainStory": [
                    {
                        "type": "photo",
                        "file": photo_analyses[i]["path"],
                        "duration": 3,
                        "description": photo_analyses[i]["description"],
                        "effect": "kenburns"
                    }
                    for i in range(min(len(photo_analyses), target_duration // 3))
                ],
                "totalDuration": target_duration
            }

    def generate_full_scenario(
        self,
        photo_paths: List[str],
        video_paths: List[str],
        target_duration: int = 180,
        school_name: str = ""
    ) -> Dict[str, Any]:
        """
        전체 시나리오 생성 (분석 + 시나리오 생성)

        Args:
            photo_paths: 사진 파일 경로 리스트
            video_paths: 비디오 파일 경로 리스트
            target_duration: 목표 영상 길이 (초)
            school_name: 학교 이름

        Returns:
            시나리오 딕셔너리
        """
        print(f"[Gemini] 사진 분석 시작... ({len(photo_paths)}장)")
        photo_analyses = self.analyze_photos(photo_paths)

        print(f"[Gemini] 시나리오 생성 시작...")
        scenario = self.generate_scenario(photo_analyses, video_paths, target_duration, school_name)

        print(f"[Gemini] 시나리오 생성 완료! (총 {scenario.get('totalDuration', 0)}초)")
        return scenario
