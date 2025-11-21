"""
Supabase 클라이언트 설정

환경 변수를 통해 Supabase 연결을 관리합니다.
"""

import os
from typing import Dict, Optional
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()


class SupabaseConfig:
    """Supabase 연결 설정"""

    # Supabase 연결 정보
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # 테이블 이름
    FORM_RESPONSES_TABLE: str = "form_responses"

    @classmethod
    def validate_config(cls) -> bool:
        """설정 유효성 검증"""
        if not cls.SUPABASE_URL:
            raise ValueError("SUPABASE_URL environment variable is required")
        if not cls.SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY environment variable is required")
        return True


class SupabaseClient:
    """
    Supabase 클라이언트 래퍼

    폼 응답 데이터를 Supabase 데이터베이스에 저장하고 관리합니다.
    """

    def __init__(self):
        """클라이언트 초기화"""
        SupabaseConfig.validate_config()

        # Supabase 클라이언트 초기화
        from supabase import create_client
        self.client = create_client(
            SupabaseConfig.SUPABASE_URL,
            SupabaseConfig.SUPABASE_KEY
        )

    async def insert_form_response(
        self,
        member_id: str,
        form_id: str,
        responses: Dict[str, str],
        result: Dict[str, any]
    ) -> Dict:
        """
        폼 응답 저장

        Args:
            member_id: 회원 ID
            form_id: 폼 ID
            responses: 설문 응답 데이터
            result: AI 분류 결과

        Returns:
            저장된 데이터 (Supabase 응답)
        """
        # responses에 result 추가
        responses_with_result = {
            **responses,
            "result": result
        }

        data = {
            "member_id": member_id,
            "form_id": form_id,
            "responses": responses_with_result,
            "submitted_at": self._get_current_timestamp()
        }

        # 실제 Supabase insert 구현
        response = self.client.table(
            SupabaseConfig.FORM_RESPONSES_TABLE
        ).insert(data).execute()

        return response.data[0] if response.data else data

    def get_form_by_share_url(self, share_url: str) -> Optional[Dict]:
        """
        공유 URL로 폼 조회

        Args:
            share_url: 공유 URL (예: "test/2")

        Returns:
            폼 데이터 (id, share_url 등)
        """
        response = self.client.table("forms").select("*").eq("share_url", share_url).execute()
        return response.data[0] if response.data else None

    async def get_form_response(
        self,
        member_id: str,
        form_id: str
    ) -> Optional[Dict]:
        """
        특정 회원의 폼 응답 조회

        Args:
            member_id: 회원 ID
            form_id: 폼 ID

        Returns:
            폼 응답 데이터 (없으면 None)
        """
        # 실제 Supabase select 구현
        response = self.client.table(
            SupabaseConfig.FORM_RESPONSES_TABLE
        ).select("*").eq("member_id", member_id).eq("form_id", form_id).execute()

        return response.data[0] if response.data else None

    async def update_form_response(
        self,
        member_id: str,
        form_id: str,
        responses: Dict[str, str],
        result: Dict[str, any]
    ) -> Dict:
        """
        폼 응답 수정

        Args:
            member_id: 회원 ID
            form_id: 폼 ID
            responses: 설문 응답 데이터
            result: AI 분류 결과

        Returns:
            수정된 데이터 (Supabase 응답)
        """
        # responses에 result 추가
        responses_with_result = {
            **responses,
            "result": result
        }

        data = {
            "responses": responses_with_result,
            "updated_at": self._get_current_timestamp()
        }

        # 실제 Supabase update 구현
        response = self.client.table(
            SupabaseConfig.FORM_RESPONSES_TABLE
        ).update(data).eq("member_id", member_id).eq("form_id", form_id).execute()

        return response.data[0] if response.data else data

    def _get_current_timestamp(self) -> str:
        """현재 시간 ISO 8601 포맷으로 반환"""
        from datetime import datetime
        return datetime.now().isoformat()


# 전역 Supabase 클라이언트 인스턴스
_supabase_client: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    """
    Supabase 클라이언트 싱글톤

    Returns:
        SupabaseClient 인스턴스
    """
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = SupabaseClient()

    return _supabase_client
