"""
시간여행 모듈
과거(어릴 때) - 현재(증명사진) - 미래(AI 생성) 3단 구성
"""

import os
from typing import List, Dict, Any, Optional, Callable
from pathlib import Path
from moviepy.editor import *


def create_time_travel(
    students: List[Dict[str, str]],
    font_path: str,
    use_flux: bool = False,
    flux_api_key: Optional[str] = None,
    duration_per_student: float = 6.0,
    progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None
) -> VideoClip:
    """
    시간여행 영상 생성

    Args:
        students: 학생 정보 리스트 [{"name": str, "babyPhoto": str, "idPhoto": str, "dreamJob": str, "futureImage": str}]
        font_path: 폰트 파일 경로
        use_flux: Flux AI 이미지 생성 사용 여부
        flux_api_key: Flux API 키
        duration_per_student: 학생당 표시 시간 (초)
        progress_callback: 진행률 콜백

    Returns:
        VideoClip
    """
    if progress_callback:
        progress_callback({
            "stage": "rendering",
            "percent": 75,
            "message": "시간여행 생성 중...",
            "currentModule": "timetravel"
        })

    clips = []

    for idx, student in enumerate(students[:20]):  # 최대 20명
        try:
            # 개별 학생 시간여행 클립 생성
            student_clip = create_student_time_travel(
                student,
                font_path,
                duration_per_student,
                use_flux,
                flux_api_key
            )

            clips.append(student_clip)

            # 진행률 업데이트
            if progress_callback:
                percent = 75 + (idx / len(students[:20])) * 10
                progress_callback({
                    "stage": "rendering",
                    "percent": percent,
                    "message": f"시간여행 생성 중... ({idx+1}/{len(students[:20])})",
                    "currentModule": "timetravel"
                })

        except Exception as e:
            print(f"[오류] 학생 시간여행 생성 실패 ({student.get('name', '')}): {e}")
            continue

    if not clips:
        # 빈 클립 방지
        return ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=5)

    # 클립 연결
    final_clip = concatenate_videoclips(clips, method="compose")

    if progress_callback:
        progress_callback({
            "stage": "rendering",
            "percent": 85,
            "message": "시간여행 생성 완료",
            "currentModule": "timetravel"
        })

    return final_clip


def create_student_time_travel(
    student: Dict[str, str],
    font_path: str,
    duration: float,
    use_flux: bool,
    flux_api_key: Optional[str]
) -> VideoClip:
    """
    개별 학생 시간여행 클립 생성

    Args:
        student: {"name": str, "babyPhoto": str, "idPhoto": str, "dreamJob": str, "futureImage": str}
        font_path: 폰트 경로
        duration: 총 지속 시간
        use_flux: AI 이미지 생성 사용
        flux_api_key: Flux API 키

    Returns:
        VideoClip
    """
    name = student.get("name", "")
    baby_photo = student.get("babyPhoto", "")
    id_photo = student.get("idPhoto", "")
    dream_job = student.get("dreamJob", "")
    future_image = student.get("futureImage", "")

    phase_duration = duration / 3  # 각 단계 2초씩

    # 배경
    background = ColorClip(size=(1920, 1080), color=(10, 10, 30), duration=duration)

    clips = [background]

    # 이름 타이틀 (상단)
    try:
        title = TextClip(
            name,
            fontsize=60,
            color='white',
            font=font_path,
            method='caption'
        ).set_duration(duration).set_position(('center', 50))

        clips.append(title)
    except Exception as e:
        print(f"[경고] 타이틀 생성 실패: {e}")

    # 3단 이미지 배치
    image_y = 250
    image_height = 600

    # 1. 과거 (어릴 때)
    if baby_photo and os.path.exists(baby_photo):
        try:
            past_img = (ImageClip(baby_photo)
                .resize(height=image_height)
                .set_start(0)
                .set_duration(phase_duration)
                .set_position((200, image_y))
                .crossfadein(0.5)
                .crossfadeout(0.5))

            clips.append(past_img)

            # "과거" 라벨
            past_label = TextClip(
                "과거",
                fontsize=40,
                color='yellow',
                font=font_path,
                method='caption'
            ).set_start(0).set_duration(phase_duration).set_position((300, image_y - 60))

            clips.append(past_label)

        except Exception as e:
            print(f"[경고] 과거 이미지 로드 실패: {e}")

    # 2. 현재 (증명사진)
    if id_photo and os.path.exists(id_photo):
        try:
            present_img = (ImageClip(id_photo)
                .resize(height=image_height)
                .set_start(phase_duration)
                .set_duration(phase_duration)
                .set_position((760, image_y))
                .crossfadein(0.5)
                .crossfadeout(0.5))

            clips.append(present_img)

            # "현재" 라벨
            present_label = TextClip(
                "현재",
                fontsize=40,
                color='white',
                font=font_path,
                method='caption'
            ).set_start(phase_duration).set_duration(phase_duration).set_position((860, image_y - 60))

            clips.append(present_label)

        except Exception as e:
            print(f"[경고] 현재 이미지 로드 실패: {e}")

    # 3. 미래 (AI 생성 또는 플레이스홀더)
    future_x = 1320

    if use_flux and flux_api_key and future_image and os.path.exists(future_image):
        # AI 생성 이미지 사용
        try:
            future_img = (ImageClip(future_image)
                .resize(height=image_height)
                .set_start(phase_duration * 2)
                .set_duration(phase_duration)
                .set_position((future_x, image_y))
                .crossfadein(0.5)
                .crossfadeout(0.5))

            clips.append(future_img)

        except Exception as e:
            print(f"[경고] 미래 이미지 로드 실패: {e}")

    else:
        # 플레이스홀더 (장래희망 텍스트)
        try:
            future_placeholder = ColorClip(
                size=(400, image_height),
                color=(50, 50, 100),
                duration=phase_duration
            ).set_start(phase_duration * 2).set_position((future_x, image_y))

            clips.append(future_placeholder)

            # 장래희망 텍스트
            future_text = TextClip(
                f"꿈:\n{dream_job}",
                fontsize=50,
                color='white',
                font=font_path,
                method='caption',
                size=(350, None),
                align='center'
            ).set_start(phase_duration * 2).set_duration(phase_duration).set_position((future_x + 25, image_y + 200))

            clips.append(future_text)

        except Exception as e:
            print(f"[경고] 미래 플레이스홀더 생성 실패: {e}")

    # "미래" 라벨
    try:
        future_label = TextClip(
            "미래",
            fontsize=40,
            color='cyan',
            font=font_path,
            method='caption'
        ).set_start(phase_duration * 2).set_duration(phase_duration).set_position((future_x + 100, image_y - 60))

        clips.append(future_label)

    except Exception as e:
        print(f"[경고] 미래 라벨 생성 실패: {e}")

    return CompositeVideoClip(clips)


def generate_future_image_with_flux(
    student_name: str,
    dream_job: str,
    id_photo_path: str,
    flux_api_key: str
) -> Optional[str]:
    """
    Flux API를 사용하여 미래 모습 이미지 생성 (선택적 기능)

    Args:
        student_name: 학생 이름
        dream_job: 장래희망
        id_photo_path: 증명사진 경로 (참조용)
        flux_api_key: Flux API 키

    Returns:
        생성된 이미지 경로 또는 None
    """
    # TODO: Flux API 통합
    # 현재는 미구현 상태
    print(f"[TODO] {student_name}의 {dream_job} 미래 이미지 생성 (Flux API 미구현)")
    return None
