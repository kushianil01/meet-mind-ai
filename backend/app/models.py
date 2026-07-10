from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================
# ASSOCIATION TABLES
# ============================================================

# Many-to-many:
# One meeting can contain many participants.
# One participant can attend many meetings.
meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column(
        "meeting_id",
        ForeignKey(
            "meetings.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
    Column(
        "participant_id",
        ForeignKey(
            "participants.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


# Many-to-many:
# One meeting can contain many topics.
# One topic can belong to many meetings.
meeting_topics = Table(
    "meeting_topics",
    Base.metadata,
    Column(
        "meeting_id",
        ForeignKey(
            "meetings.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
    Column(
        "topic_id",
        ForeignKey(
            "topics.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


# ============================================================
# MEETING
# ============================================================

class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    meeting_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    duration_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    audio_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    summary_source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="seeded",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )

    participants: Mapped[list["Participant"]] = relationship(
        secondary=meeting_participants,
        back_populates="meetings",
    )

    transcript_segments: Mapped[
        list["TranscriptSegment"]
    ] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.position",
    )

    action_items: Mapped[list["ActionItem"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
    )

    topics: Mapped[list["Topic"]] = relationship(
        secondary=meeting_topics,
        back_populates="meetings",
    )

    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Chapter.position",
    )

    soundbites: Mapped[list["Soundbite"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
    )


# ============================================================
# PARTICIPANT
# ============================================================

class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
    )

    avatar_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    avatar_color: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    meetings: Mapped[list["Meeting"]] = relationship(
        secondary=meeting_participants,
        back_populates="participants",
    )


# ============================================================
# TRANSCRIPT SEGMENT
# ============================================================

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    __table_args__ = (
        UniqueConstraint(
            "meeting_id",
            "position",
            name="uq_transcript_meeting_position",
        ),
        Index(
            "ix_transcript_meeting_start",
            "meeting_id",
            "start_time",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey(
            "meetings.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    speaker_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    start_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    end_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    meeting: Mapped["Meeting"] = relationship(
        back_populates="transcript_segments",
    )

    comments: Mapped[list["Comment"]] = relationship(
        back_populates="transcript_segment",
        cascade="all, delete-orphan",
    )

    highlights: Mapped[list["Highlight"]] = relationship(
        back_populates="transcript_segment",
        cascade="all, delete-orphan",
    )

    soundbites: Mapped[list["Soundbite"]] = relationship(
        back_populates="transcript_segment",
    )


# ============================================================
# ACTION ITEM
# ============================================================

class ActionItem(Base):
    __tablename__ = "action_items"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey(
            "meetings.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    task: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    assignee: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
        index=True,
    )

    due_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        index=True,
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )

    meeting: Mapped["Meeting"] = relationship(
        back_populates="action_items",
    )


# ============================================================
# TOPIC
# ============================================================

class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    color: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="purple",
    )

    meetings: Mapped[list["Meeting"]] = relationship(
        secondary=meeting_topics,
        back_populates="topics",
    )


# ============================================================
# CHAPTER
# ============================================================

class Chapter(Base):
    __tablename__ = "chapters"

    __table_args__ = (
        UniqueConstraint(
            "meeting_id",
            "position",
            name="uq_chapter_meeting_position",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey(
            "meetings.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    start_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    end_time: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    meeting: Mapped["Meeting"] = relationship(
        back_populates="chapters",
    )


# ============================================================
# COMMENT
# ============================================================

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    transcript_segment_id: Mapped[int] = mapped_column(
        ForeignKey(
            "transcript_segments.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    author_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        default="Kushi",
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )

    transcript_segment: Mapped[
        "TranscriptSegment"
    ] = relationship(
        back_populates="comments",
    )


# ============================================================
# HIGHLIGHT
# ============================================================

class Highlight(Base):
    __tablename__ = "highlights"

    __table_args__ = (
        UniqueConstraint(
            "transcript_segment_id",
            name="uq_highlight_transcript_segment",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    transcript_segment_id: Mapped[int] = mapped_column(
        ForeignKey(
            "transcript_segments.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    color: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="yellow",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    transcript_segment: Mapped[
        "TranscriptSegment"
    ] = relationship(
        back_populates="highlights",
    )


# ============================================================
# SOUNDBITE
# ============================================================

class Soundbite(Base):
    __tablename__ = "soundbites"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        ForeignKey(
            "meetings.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    transcript_segment_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "transcript_segments.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    start_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    end_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )

    meeting: Mapped["Meeting"] = relationship(
        back_populates="soundbites",
    )

    transcript_segment: Mapped[
        "TranscriptSegment | None"
    ] = relationship(
        back_populates="soundbites",
    )