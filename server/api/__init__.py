"""
API 모듈

모든 API 라우터를 제공합니다.
"""

from api.survey_analyzer import router as survey_router
from api.result_viewer import router as result_router
from api.luckydraw import router as luckydraw_router
from api.events import router as events_router
from api.forms import router as forms_router
from api.admins import router as admins_router

__all__ = [
    "survey_router",
    "result_router",
    "luckydraw_router",
    "events_router",
    "forms_router",
    "admins_router"
]
