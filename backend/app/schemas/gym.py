from pydantic import BaseModel
from typing import List


class MachineInfo(BaseModel):
    name: str
    confidence: float


class VideoInfo(BaseModel):
    title: str
    url: str


class PersonalizedAdvice(BaseModel):
    sets: int
    reps: str
    rest_seconds: int
    tips: List[str]


class GymAnalysisResponse(BaseModel):
    machine: MachineInfo
    video: VideoInfo
    personalized_advice: PersonalizedAdvice