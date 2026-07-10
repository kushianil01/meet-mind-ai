from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ParticipantBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: str | None = None
    avatar_url: str | None = None
    avatar_color: str | None = None


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantResponse(ParticipantBase, ORMModel):
    id: int


class TopicResponse(ORMModel):
    id: int
    name: str
    color: str


class CommentResponse(ORMModel):
    id: int
    transcript_segment_id: int
    author_name: str
    content: str
    created_at: datetime
    updated_at: datetime


class HighlightResponse(ORMModel):
    id: int
    transcript_segment_id: int
    color: str
    created_at: datetime


class TranscriptSegmentResponse(ORMModel):
    id: int
    meeting_id: int
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    position: int
    comments: list[CommentResponse] = Field(default_factory=list)
    highlights: list[HighlightResponse] = Field(default_factory=list)


class ActionItemCreate(BaseModel):
    task: str = Field(min_length=1)
    assignee: str | None = None
    due_date: date | None = None


class ActionItemUpdate(BaseModel):
    task: str | None = Field(default=None, min_length=1)
    assignee: str | None = None
    due_date: date | None = None
    completed: bool | None = None


class ActionItemResponse(ORMModel):
    id: int
    meeting_id: int
    task: str
    assignee: str | None
    due_date: date | None
    completed: bool
    created_at: datetime
    updated_at: datetime


class ChapterResponse(ORMModel):
    id: int
    meeting_id: int
    title: str
    summary: str | None
    start_time: float
    end_time: float | None
    position: int


class SoundbiteResponse(ORMModel):
    id: int
    meeting_id: int
    transcript_segment_id: int | None
    title: str
    start_time: float
    end_time: float
    created_at: datetime


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    meeting_date: datetime
    duration_seconds: int = Field(default=0, ge=0)
    audio_url: str | None = None
    transcript: str
    participants: list[ParticipantCreate] = Field(
        default_factory=list
    )


class MeetingUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    meeting_date: datetime | None = None
    duration_seconds: int | None = Field(
        default=None,
        ge=0,
    )
    audio_url: str | None = None
    participants: list[ParticipantCreate] | None = None


class MeetingListItem(ORMModel):
    id: int
    title: str
    meeting_date: datetime
    duration_seconds: int
    audio_url: str | None
    summary: str | None
    summary_source: str
    participants: list[ParticipantResponse]
    topics: list[TopicResponse]
    created_at: datetime
    updated_at: datetime


class MeetingDetail(MeetingListItem):
    transcript_segments: list[TranscriptSegmentResponse]
    action_items: list[ActionItemResponse]
    chapters: list[ChapterResponse]
    soundbites: list[SoundbiteResponse]


class HealthResponse(BaseModel):
    status: str
    application: str
    version: str


class AskMeetingRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=500,
    )


class AskMeetingResponse(BaseModel):
    answer: str
