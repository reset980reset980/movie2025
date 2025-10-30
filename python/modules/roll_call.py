"""
올스타 롤콜 모듈
증명사진 슬라이드쇼로 졸업생 전원 소개
"""

import os
from typing import List, Dict, Any, Optional, Callable
from pathlib import Path
from moviepy.editor import *


def create_roll_call(
    id_photos: List[str],
    student_names: List[str],
    font_path: str,
    duration_per_student: float = 2.0,
    columns: int = 4,
    rows: int = 3,
    progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None
) -> VideoClip:
    """
    올스타 롤콜 영상 생성

    Args:
        id_photos: 증명사진 경로 리스트
        student_names: 학생 이름 리스트
        font_path: 폰트 파일 경로
        duration_per_student: 학생당 표시 시간 (초)
        columns: 가로 개수
        rows: 세로 개수
        progress_callback: 진행률 콜백

    Returns:
        VideoClip
    """
    if progress_callback:
        progress_callback({
            "stage": "rendering",
            "percent": 60,
            "message": "롤콜 생성 중...",
            "currentModule": "rollcall"
        })

    clips = []
    students_per_page = columns * rows

    # 페이지별로 처리
    for page_idx in range(0, len(id_photos), students_per_page):
        page_photos = id_photos[page_idx:page_idx + students_per_page]
        page_names = student_names[page_idx:page_idx + students_per_page]

        # 페이지 생성
        page_clip = create_roll_call_page(
            page_photos,
            page_names,
            font_path,
            duration_per_student,
            columns,
            rows
        )

        clips.append(page_clip)

    if not clips:
        # 빈 클립 방지
        return ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=5)

    # 페이지 연결
    final_clip = concatenate_videoclips(clips, method="compose")

    if progress_callback:
        progress_callback({
            "stage": "rendering",
            "percent": 70,
            "message": "롤콜 생성 완료",
            "currentModule": "rollcall"
        })

    return final_clip


def create_roll_call_page(
    photos: List[str],
    names: List[str],
    font_path: str,
    duration: float,
    columns: int,
    rows: int
) -> VideoClip:
    """
    롤콜 한 페이지 생성 (격자 배치)

    Args:
        photos: 사진 경로 리스트
        names: 이름 리스트
        font_path: 폰트 경로
        duration: 페이지 표시 시간
        columns: 가로 개수
        rows: 세로 개수

    Returns:
        VideoClip
    """
    # 배경
    background = ColorClip(size=(1920, 1080), color=(30, 30, 50), duration=duration)

    # 제목
    try:
        title = TextClip(
            "올스타 롤콜",
            fontsize=70,
            color='white',
            font=font_path,
            method='caption'
        ).set_duration(duration).set_position(('center', 50))

        clips = [background, title]
    except Exception as e:
        print(f"[경고] 제목 생성 실패: {e}")
        clips = [background]

    # 격자 크기 계산
    photo_width = 300
    photo_height = 400
    grid_width = columns * photo_width + (columns - 1) * 50  # 간격 50px
    grid_height = rows * photo_height + (rows - 1) * 30  # 간격 30px

    start_x = (1920 - grid_width) // 2
    start_y = 200

    # 사진 및 이름 배치
    for idx, (photo_path, name) in enumerate(zip(photos, names)):
        row = idx // columns
        col = idx % columns

        if row >= rows:
            break

        x = start_x + col * (photo_width + 50)
        y = start_y + row * (photo_height + 30)

        try:
            # 증명사진
            photo = (ImageClip(photo_path)
                .resize(height=photo_height)
                .set_duration(duration)
                .set_position((x, y))
                .crossfadein(0.3))

            clips.append(photo)

            # 이름 텍스트
            name_text = TextClip(
                name,
                fontsize=30,
                color='white',
                font=font_path,
                method='caption'
            ).set_duration(duration).set_position((x + photo_width // 2 - 50, y + photo_height + 10))

            clips.append(name_text)

        except Exception as e:
            print(f"[경고] 사진 로드 실패 ({photo_path}): {e}")
            continue

    return CompositeVideoClip(clips)
