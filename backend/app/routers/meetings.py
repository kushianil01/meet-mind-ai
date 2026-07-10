import re

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy import (
    asc,
    desc,
    or_,
    select,
)

from sqlalchemy.orm import (
    Session,
    selectinload,
)

from groq import Groq

from app.config import settings

from app.database import get_db

from app.models import (
    ActionItem,
    Chapter,
    Meeting,
    Participant,
    Topic,
    TranscriptSegment,
)

from app.schemas import (
    ActionItemCreate,
    ActionItemResponse,
    ActionItemUpdate,
    AskMeetingRequest,
    AskMeetingResponse,
    MeetingCreate,
    MeetingDetail,
    MeetingListItem,
    MeetingUpdate,
)


router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
)


# ============================================================
# DATABASE LOADING OPTIONS
# ============================================================


def meeting_detail_options():
    return (
        selectinload(
            Meeting.participants
        ),
        selectinload(
            Meeting.topics
        ),
        selectinload(
            Meeting.transcript_segments
        ),
        selectinload(
            Meeting.action_items
        ),
        selectinload(
            Meeting.chapters
        ),
        selectinload(
            Meeting.soundbites
        ),
    )


# ============================================================
# TRANSCRIPT HELPERS
# ============================================================


def clean_transcript(
    transcript: str,
) -> str:
    """
    Remove unnecessary spaces while preserving
    transcript line breaks.
    """

    lines = []

    for line in transcript.splitlines():
        cleaned_line = re.sub(
            r"\s+",
            " ",
            line,
        ).strip()

        if cleaned_line:
            lines.append(
                cleaned_line
            )

    return "\n".join(
        lines
    )


def parse_transcript(
    transcript: str,
    duration_seconds: int,
) -> list[dict]:
    """
    Convert transcript text into transcript segments.

    Supported example:

    Sarah: Welcome to the meeting.
    David: We should finish the API.

    Plain text without speaker labels is also
    supported.
    """

    cleaned_text = (
        clean_transcript(
            transcript
        )
    )

    if not cleaned_text:
        return []

    raw_lines = [
        line.strip()
        for line
        in cleaned_text.splitlines()
        if line.strip()
    ]

    parsed_lines = []

    current_speaker = (
        "Speaker"
    )

    current_text = ""

    speaker_pattern = re.compile(
        r"^([A-Za-z][A-Za-z0-9 ._'()-]{0,60})"
        r"\s*:\s*(.+)$"
    )

    for line in raw_lines:
        speaker_match = (
            speaker_pattern.match(
                line
            )
        )

        if speaker_match:
            if current_text:
                parsed_lines.append(
                    {
                        "speaker_name":
                            current_speaker,

                        "text":
                            current_text
                            .strip(),
                    }
                )

            current_speaker = (
                speaker_match
                .group(1)
                .strip()
            )

            current_text = (
                speaker_match
                .group(2)
                .strip()
            )

        else:
            if current_text:
                current_text += (
                    " "
                    + line
                )

            else:
                current_text = (
                    line
                )

    if current_text:
        parsed_lines.append(
            {
                "speaker_name":
                    current_speaker,

                "text":
                    current_text
                    .strip(),
            }
        )

    if not parsed_lines:
        parsed_lines.append(
            {
                "speaker_name":
                    "Speaker",

                "text":
                    cleaned_text,
            }
        )

    total_segments = len(
        parsed_lines
    )

    if duration_seconds > 0:
        seconds_per_segment = (
            duration_seconds
            /
            total_segments
        )

    else:
        seconds_per_segment = (
            30
        )

    segments = []

    for (
        index,
        item,
    ) in enumerate(
        parsed_lines
    ):
        start_time = (
            index
            *
            seconds_per_segment
        )

        end_time = (
            (
                index
                +
                1
            )
            *
            seconds_per_segment
        )

        segments.append(
            {
                "speaker_name":
                    item[
                        "speaker_name"
                    ],

                "text":
                    item[
                        "text"
                    ],

                "start_time":
                    round(
                        start_time,
                        2,
                    ),

                "end_time":
                    round(
                        end_time,
                        2,
                    ),

                "position":
                    index,
            }
        )

    return segments


# ============================================================
# BASIC MEETING INTELLIGENCE
# ============================================================


def generate_summary(
    transcript: str,
) -> str:
    """
    Generate a clear AI-powered meeting summary
    using Groq.
    """

    cleaned_transcript = (
        clean_transcript(
            transcript
        )
    )

    if not cleaned_transcript:
        return (
            "No transcript was available "
            "for this meeting."
        )

    try:
        client = Groq(
            api_key=(
                settings
                .groq_api_key
            )
        )

        completion = (
            client
            .chat
            .completions
            .create(
                model=(
                    "llama-3.1-8b-instant"
                ),

                temperature=(
                    0.2
                ),

                max_tokens=(
                    350
                ),

                messages=[
                    {
                        "role":
                            "system",

                        "content": (
                            "You are MeetMind, an AI "
                            "meeting intelligence "
                            "assistant. Create a clear, "
                            "professional, and accurate "
                            "summary using only the "
                            "information in the meeting "
                            "transcript. Summarize the "
                            "meeting's purpose, major "
                            "discussion points, important "
                            "updates, decisions, outcomes, "
                            "deadlines, and next steps. "
                            "Do not copy greetings, "
                            "introductions, or speaker "
                            "labels. Do not merely repeat "
                            "the first few transcript "
                            "sentences. Do not invent "
                            "information. Write one "
                            "coherent paragraph of about "
                            "100 to 150 words."
                        ),
                    },

                    {
                        "role":
                            "user",

                        "content": (
                            "MEETING TRANSCRIPT:\n\n"
                            f"{cleaned_transcript}\n\n"
                            "Generate the meeting "
                            "summary now."
                        ),
                    },
                ],
            )
        )

        summary = (
            completion
            .choices[
                0
            ]
            .message
            .content
        )

        if (
            not summary
            or
            not summary.strip()
        ):
            raise ValueError(
                "Groq returned an "
                "empty summary."
            )

        return (
            summary
            .strip()
        )

    except Exception as error:
        print(
            "GROQ SUMMARY ERROR:",
            error,
        )

        return (
            "The meeting transcript was "
            "processed successfully, but "
            "the AI summary could not be "
            "generated."
        )
def generate_topics(
    transcript: str,
) -> list[str]:
    """
    Generate key discussion topics
    from the transcript using Groq.
    """

    cleaned_transcript = (
        clean_transcript(
            transcript
        )
    )

    if not cleaned_transcript:
        return []

    try:
        client = Groq(
            api_key=(
                settings
                .groq_api_key
            )
        )

        completion = (
            client
            .chat
            .completions
            .create(
                model=(
                    "llama-3.1-8b-instant"
                ),

                temperature=(
                    0.1
                ),

                max_tokens=(
                    200
                ),

                messages=[
                    {
                        "role":
                            "system",

                        "content": (
                            "You are MeetMind, an AI "
                            "meeting intelligence "
                            "assistant. Identify the "
                            "most important discussion "
                            "topics in the meeting. "
                            "Return between 3 and 6 "
                            "short topic names. "
                            "Each topic should contain "
                            "approximately 2 to 5 words. "
                            "Do not return sentences, "
                            "tasks, generic labels, "
                            "explanations, or duplicate "
                            "topics. Return exactly one "
                            "topic per line beginning "
                            "with '- '. Use only "
                            "information found in the "
                            "meeting transcript."
                        ),
                    },

                    {
                        "role":
                            "user",

                        "content": (
                            "MEETING TRANSCRIPT:\n\n"
                            f"{cleaned_transcript}\n\n"
                            "Generate the key "
                            "discussion topics."
                        ),
                    },
                ],
            )
        )

        response_text = (
            completion
            .choices[
                0
            ]
            .message
            .content
        )

        if (
            not response_text
            or
            not response_text
            .strip()
        ):
            return []

        topics = []

        for line in (
            response_text
            .splitlines()
        ):
            topic = (
                re.sub(
                    (
                        r"^\s*"
                        r"(?:[-*•]|\d+[.)])"
                        r"\s*"
                    ),
                    "",
                    line,
                )
                .strip()
            )

            if (
                topic
                and
                topic
                not in topics
            ):
                topics.append(
                    topic
                )

            if (
                len(
                    topics
                )
                ==
                6
            ):
                break

        return topics

    except Exception as error:
        print(
            "GROQ TOPICS ERROR:",
            error,
        )

        return []
    


def generate_action_items(
    transcript: str,
) -> list[str]:
    """
    Generate clear and specific action items
    from the transcript using Groq.
    """

    cleaned_transcript = (
        clean_transcript(
            transcript
        )
    )

    if not cleaned_transcript:
        return []

    try:
        client = Groq(
            api_key=(
                settings
                .groq_api_key
            )
        )

        completion = (
            client
            .chat
            .completions
            .create(
                model=(
                    "llama-3.1-8b-instant"
                ),

                temperature=(
                    0.1
                ),

                max_tokens=(
                    400
                ),

                messages=[
                    {
                        "role":
                            "system",

                        "content": (
                            "You are MeetMind, an AI "
                            "meeting intelligence "
                            "assistant. Extract only "
                            "genuine action items, tasks, "
                            "commitments, follow-ups, or "
                            "next steps from the meeting "
                            "transcript. Do not treat "
                            "general discussion, opinions, "
                            "background information, or "
                            "completed work as action "
                            "items. Preserve the owner "
                            "and deadline when stated. "
                            "Rewrite each item as a clear, "
                            "concise, actionable sentence. "
                            "Return at most 5 items. "
                            "Return exactly one item per "
                            "line beginning with '- '. "
                            "If there are no genuine "
                            "action items, return exactly "
                            "NONE. Use only information "
                            "from the transcript and do "
                            "not invent owners, tasks, "
                            "or deadlines."
                        ),
                    },

                    {
                        "role":
                            "user",

                        "content": (
                            "MEETING TRANSCRIPT:\n\n"
                            f"{cleaned_transcript}\n\n"
                            "Extract the action items."
                        ),
                    },
                ],
            )
        )

        response_text = (
            completion
            .choices[
                0
            ]
            .message
            .content
        )

        if (
            not response_text
            or
            not response_text.strip()
        ):
            return []

        response_text = (
            response_text
            .strip()
        )

        if (
            response_text
            .upper()
            ==
            "NONE"
        ):
            return []

        action_items = []

        for line in (
            response_text
            .splitlines()
        ):
            cleaned_line = (
                re.sub(
                    r"^\s*(?:[-*•]|\d+[.)])\s*",
                    "",
                    line,
                )
                .strip()
            )

            if (
                cleaned_line
                and
                cleaned_line
                .upper()
                !=
                "NONE"
                and
                cleaned_line
                not in action_items
            ):
                action_items.append(
                    cleaned_line
                )

            if (
                len(
                    action_items
                )
                ==
                5
            ):
                break

        return action_items

    except Exception as error:
        print(
            "GROQ ACTION ITEMS ERROR:",
            error,
        )

        return []


def generate_chapters(
    segments: list[dict],
) -> list[dict]:
    """
    Generate meaningful transcript chapters
    using Groq while preserving timestamps.
    """

    if not segments:
        return []

    numbered_segments = "\n".join(
        (
            f"[{index}] "
            f"{segment['speaker_name']}: "
            f"{segment['text']}"
        )

        for (
            index,
            segment,
        )
        in enumerate(
            segments
        )
    )

    try:
        client = Groq(
            api_key=(
                settings
                .groq_api_key
            )
        )

        completion = (
            client
            .chat
            .completions
            .create(
                model=(
                    "llama-3.1-8b-instant"
                ),

                temperature=(
                    0.1
                ),

                max_tokens=(
                    600
                ),

                messages=[
                    {
                        "role":
                            "system",

                        "content": (
                            "You are MeetMind, an AI "
                            "meeting intelligence "
                            "assistant. Divide a meeting "
                            "transcript into meaningful "
                            "topic-based chapters. Create "
                            "between 1 and 4 chapters, "
                            "depending on the transcript. "
                            "Each chapter must cover a "
                            "continuous range of segment "
                            "indexes. Use every segment "
                            "exactly once, in order, with "
                            "no gaps or overlaps. Give "
                            "each chapter a specific, "
                            "descriptive title and a "
                            "concise one-sentence summary. "
                            "Do not use generic titles "
                            "such as 'Main discussion' or "
                            "'Next steps' unless they "
                            "accurately describe the "
                            "content. Return only lines "
                            "in this exact format:\n"
                            "START_INDEX|END_INDEX|TITLE|"
                            "SUMMARY\n"
                            "Do not add markdown, bullets, "
                            "headings, or explanations. "
                            "Use only information from "
                            "the transcript."
                        ),
                    },

                    {
                        "role":
                            "user",

                        "content": (
                            "NUMBERED TRANSCRIPT "
                            "SEGMENTS:\n\n"
                            f"{numbered_segments}\n\n"
                            "Create the chapters."
                        ),
                    },
                ],
            )
        )

        response_text = (
            completion
            .choices[
                0
            ]
            .message
            .content
        )

        if (
            not response_text
            or
            not response_text.strip()
        ):
            raise ValueError(
                "Groq returned empty "
                "chapter data."
            )

        chapters = []
        last_end_index = -1

        for line in (
            response_text
            .strip()
            .splitlines()
        ):
            parts = [
                part.strip()
                for part
                in line.split(
                    "|",
                    3,
                )
            ]

            if (
                len(
                    parts
                )
                !=
                4
            ):
                continue

            try:
                start_index = int(
                    parts[
                        0
                    ]
                )

                end_index = int(
                    parts[
                        1
                    ]
                )

            except ValueError:
                continue

            start_index = max(
                0,
                start_index,
            )

            end_index = min(
                len(
                    segments
                )
                -
                1,
                end_index,
            )

            if (
                start_index
                >
                end_index
            ):
                continue

            if (
                start_index
                <=
                last_end_index
            ):
                start_index = (
                    last_end_index
                    +
                    1
                )

            if (
                start_index
                >
                end_index
            ):
                continue

            title = (
                parts[
                    2
                ]
                .strip()
            )

            summary = (
                parts[
                    3
                ]
                .strip()
            )

            if (
                not title
                or
                not summary
            ):
                continue

            chapters.append(
                {
                    "title":
                        title,

                    "summary":
                        summary,

                    "start_time":
                        segments[
                            start_index
                        ][
                            "start_time"
                        ],

                    "end_time":
                        segments[
                            end_index
                        ][
                            "end_time"
                        ],

                    "position":
                        len(
                            chapters
                        ),
                }
            )

            last_end_index = (
                end_index
            )

            if (
                len(
                    chapters
                )
                ==
                4
            ):
                break

        if not chapters:
            raise ValueError(
                "Groq returned invalid "
                "chapter data."
            )

        return chapters

    except Exception as error:
        print(
            "GROQ CHAPTERS ERROR:",
            error,
        )

        chapter_text = " ".join(
            segment[
                "text"
            ]
            for segment
            in segments
        )

        fallback_summary = (
            chapter_text[
                :250
            ]
        )

        if (
            len(
                chapter_text
            )
            >
            250
        ):
            fallback_summary += (
                "..."
            )

        return [
            {
                "title":
                    "Meeting discussion",

                "summary":
                    fallback_summary,

                "start_time":
                    segments[
                        0
                    ][
                        "start_time"
                    ],

                "end_time":
                    segments[
                        -1
                    ][
                        "end_time"
                    ],

                "position":
                    0,
            }
        ]


# ============================================================
# CREATE MEETING
# ============================================================


@router.post(
    "",
    response_model=(
        MeetingDetail
    ),
    status_code=(
        status
        .HTTP_201_CREATED
    ),
    summary=(
        "Create and process a meeting"
    ),
)
def create_meeting(
    meeting_data:
        MeetingCreate,

    db:
        Session
        =
        Depends(
            get_db
        ),
):
    cleaned_transcript = (
        clean_transcript(
            meeting_data
            .transcript
        )
    )

    if not cleaned_transcript:
        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),

            detail=(
                "The meeting transcript "
                "cannot be empty."
            ),
        )

    meeting = Meeting(
        title=(
            meeting_data
            .title
            .strip()
        ),

        meeting_date=(
            meeting_data
            .meeting_date
        ),

        duration_seconds=(
            meeting_data
            .duration_seconds
        ),

        audio_url=(
            meeting_data
            .audio_url
        ),

        summary=(
            generate_summary(
                cleaned_transcript
            )
        ),
    )

    # --------------------------------------------------------
    # PARTICIPANTS
    # --------------------------------------------------------

    for participant_data in (
        meeting_data
        .participants
    ):
        participant = None

        if (
            participant_data
            .email
        ):
            participant = (
                db.scalar(
                    select(
                        Participant
                    )
                    .where(
                        Participant
                        .email
                        ==
                        participant_data
                        .email
                    )
                )
            )

        if (
            participant
            is None
        ):
            participant = (
                db.scalar(
                    select(
                        Participant
                    )
                    .where(
                        Participant
                        .name
                        ==
                        participant_data
                        .name
                    )
                )
            )

        if (
            participant
            is None
        ):
            participant = (
                Participant(
                    name=(
                        participant_data
                        .name
                        .strip()
                    ),

                    email=(
                        participant_data
                        .email
                    ),

                    avatar_url=(
                        participant_data
                        .avatar_url
                    ),

                    avatar_color=(
                        participant_data
                        .avatar_color
                        or
                        "purple"
                    ),
                )
            )

            db.add(
                participant
            )

        meeting.participants.append(
            participant
        )

    # --------------------------------------------------------
    # TRANSCRIPT SEGMENTS
    # --------------------------------------------------------

    transcript_segments = (
        parse_transcript(
            cleaned_transcript,

            meeting_data
            .duration_seconds,
        )
    )

    for segment_data in (
        transcript_segments
    ):
        meeting.transcript_segments.append(
            TranscriptSegment(
                speaker_name=(
                    segment_data[
                        "speaker_name"
                    ]
                ),

                start_time=(
                    segment_data[
                        "start_time"
                    ]
                ),

                end_time=(
                    segment_data[
                        "end_time"
                    ]
                ),

                text=(
                    segment_data[
                        "text"
                    ]
                ),

                position=(
                    segment_data[
                        "position"
                    ]
                ),
            )
        )
        


    # --------------------------------------------------------
    # KEY DISCUSSION TOPICS
    # --------------------------------------------------------

    generated_topics = (
        generate_topics(
            cleaned_transcript
        )
    )

    for topic_name in (
        generated_topics
    ):
        cleaned_topic_name = (
            topic_name
            .strip()
        )

        if not cleaned_topic_name:
            continue

        existing_topic = (
            db.scalar(
                select(
                    Topic
                )
                .where(
                    Topic
                    .name
                    ==
                    cleaned_topic_name
                )
            )
        )

        if (
            existing_topic
            is None
        ):
            existing_topic = (
                Topic(
                    name=(
                        cleaned_topic_name
                    )
                )
            )

            db.add(
                existing_topic
            )

        meeting.topics.append(
            existing_topic
        )


    # --------------------------------------------------------
    # ACTION ITEMS
    # --------------------------------------------------------

    

    generated_actions = (
        generate_action_items(
            cleaned_transcript
        )
    )

    for task in (
        generated_actions
    ):
        meeting.action_items.append(
            ActionItem(
                task=task,

                completed=False,
            )
        )

    # --------------------------------------------------------
    # CHAPTERS
    # --------------------------------------------------------

    generated_chapters = (
        generate_chapters(
            transcript_segments
        )
    )

    for chapter_data in (
        generated_chapters
    ):
        meeting.chapters.append(
            Chapter(
                title=(
                    chapter_data[
                        "title"
                    ]
                ),

                summary=(
                    chapter_data[
                        "summary"
                    ]
                ),

                start_time=(
                    chapter_data[
                        "start_time"
                    ]
                ),

                end_time=(
                    chapter_data[
                        "end_time"
                    ]
                ),

                position=(
                    chapter_data[
                        "position"
                    ]
                ),
            )
        )

    try:
        db.add(
            meeting
        )

        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "CREATE MEETING ERROR:",
            error,
        )

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),

            detail=(
                "The meeting could "
                "not be created."
            ),
        )

    statement = (
        select(
            Meeting
        )
        .where(
            Meeting.id
            ==
            meeting.id
        )
        .options(
            *meeting_detail_options()
        )
    )

    created_meeting = (
        db.scalar(
            statement
        )
    )

    return (
        created_meeting
    )


# ============================================================
# LIST MEETINGS
# ============================================================


@router.get(
    "",
    response_model=list[
        MeetingListItem
    ],
    summary=(
        "List and search meetings"
    ),
)
def list_meetings(
    search:
        str | None
        =
        Query(
            default=None,

            description=(
                "Search by meeting title, "
                "summary, or participant name."
            ),
        ),

    participant:
        str | None
        =
        Query(
            default=None,

            description=(
                "Filter by participant name."
            ),
        ),

    topic:
        str | None
        =
        Query(
            default=None,

            description=(
                "Filter by topic name."
            ),
        ),

    sort_order:
        str
        =
        Query(
            default="desc",

            pattern=(
                "^(asc|desc)$"
            ),

            description=(
                "Sort meetings by date."
            ),
        ),

    db:
        Session
        =
        Depends(
            get_db
        ),
):
    statement = (
        select(
            Meeting
        )
        .options(
            selectinload(
                Meeting
                .participants
            ),

            selectinload(
                Meeting
                .topics
            ),
        )
    )

    if (
        search
        and
        search.strip()
    ):
        search_term = (
            f"%{search.strip()}%"
        )

        statement = (
            statement
            .outerjoin(
                Meeting
                .participants
            )
            .where(
                or_(
                    Meeting
                    .title
                    .ilike(
                        search_term
                    ),

                    Meeting
                    .summary
                    .ilike(
                        search_term
                    ),

                    Participant
                    .name
                    .ilike(
                        search_term
                    ),
                )
            )
            .distinct()
        )

    if (
        participant
        and
        participant
        .strip()
    ):
        statement = (
            statement
            .join(
                Meeting
                .participants
            )
            .where(
                Participant
                .name
                .ilike(
                    f"%{participant.strip()}%"
                )
            )
            .distinct()
        )

    if (
        topic
        and
        topic.strip()
    ):
        statement = (
            statement
            .join(
                Meeting
                .topics
            )
            .where(
                Topic
                .name
                .ilike(
                    f"%{topic.strip()}%"
                )
            )
            .distinct()
        )

    if (
        sort_order
        ==
        "asc"
    ):
        statement = (
            statement
            .order_by(
                asc(
                    Meeting
                    .meeting_date
                )
            )
        )

    else:
        statement = (
            statement
            .order_by(
                desc(
                    Meeting
                    .meeting_date
                )
            )
        )

    meetings = (
        db.scalars(
            statement
        )
        .unique()
        .all()
    )

    return list(
        meetings
    )


# ============================================================
# ASK MEETMIND
# ============================================================


@router.post(
    "/{meeting_id}/ask",

    response_model=(
        AskMeetingResponse
    ),

    summary=(
        "Ask MeetMind about a meeting"
    ),
)
def ask_meeting(
    meeting_id:
        int,

    request:
        AskMeetingRequest,

    db:
        Session
        =
        Depends(
            get_db
        ),
):
    statement = (
        select(
            Meeting
        )
        .where(
            Meeting.id
            ==
            meeting_id
        )
        .options(
            selectinload(
                Meeting
                .transcript_segments
            )
        )
    )

    meeting = (
        db.scalar(
            statement
        )
    )

    if (
        meeting
        is None
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),

            detail=(
                "Meeting not found."
            ),
        )

    transcript = (
        "\n".join(
            (
                f"{segment.speaker_name}: "
                f"{segment.text}"
            )

            for segment
            in sorted(
                meeting
                .transcript_segments,

                key=lambda item:
                    item.position,
            )
        )
    )

    if (
        not transcript
        .strip()
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),

            detail=(
                "This meeting does not "
                "contain a transcript."
            ),
        )

    try:
        client = Groq(
            api_key=(
                settings
                .groq_api_key
            )
        )

        completion = (
            client
            .chat
            .completions
            .create(
                model=(
                    "llama-3.1-8b-instant"
                ),

                temperature=(
                    0.2
                ),

                messages=[
                    {
                        "role":
                            "system",

                        "content": (
                            "You are MeetMind, "
                            "an AI meeting assistant. "
                            "Answer only from the "
                            "meeting transcript. "
                            "If the transcript does "
                            "not contain the answer, "
                            "say so clearly. "
                            "Use concise paragraphs "
                            "or bullet points."
                        ),
                    },

                    {
                        "role":
                            "user",

                        "content": (
                            "MEETING TRANSCRIPT:\n\n"
                            f"{transcript}\n\n"
                            "QUESTION:\n"
                            f"{request.question}"
                        ),
                    },
                ],
            )
        )

        answer = (
            completion
            .choices[
                0
            ]
            .message
            .content
        )

        if (
            not answer
        ):
            raise ValueError(
                "Groq returned "
                "an empty answer."
            )

        return (
            AskMeetingResponse(
                answer=(
                    answer
                    .strip()
                )
            )
        )

    except Exception as error:
        print(
            "GROQ ERROR:",
            error,
        )

        raise HTTPException(
            status_code=(
                status
                .HTTP_502_BAD_GATEWAY
            ),

            detail=(
                "MeetMind could not "
                "generate an answer."
            ),
        )


# ============================================================
# GET ONE MEETING
# Keep this route below /{meeting_id}/ask
# ============================================================


@router.get(
    "/{meeting_id}",

    response_model=(
        MeetingDetail
    ),

    summary=(
        "Get complete meeting details"
    ),
)
def get_meeting(
    meeting_id:
        int,

    db:
        Session
        =
        Depends(
            get_db
        ),
):
    statement = (
        select(
            Meeting
        )
        .where(
            Meeting.id
            ==
            meeting_id
        )
        .options(
            *meeting_detail_options()
        )
    )

    meeting = (
        db.scalar(
            statement
        )
    )

    if (
        meeting
        is None
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),

            detail=(
                "Meeting not found."
            ),
        )

    return meeting
# ============================================================
# DELETE MEETING
# ============================================================


@router.delete(
    "/{meeting_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
    summary="Delete a meeting",
)
def delete_meeting(
    meeting_id: int,

    db: Session = Depends(
        get_db
    ),
):
    meeting = db.get(
        Meeting,
        meeting_id,
    )

    if meeting is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Meeting not found."
            ),
        )

    try:
        db.delete(
            meeting
        )

        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "DELETE MEETING ERROR:",
            error,
        )

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "The meeting could "
                "not be deleted."
            ),
        )

    return None


# ============================================================
# CREATE ACTION ITEM
# ============================================================


@router.post(
    "/{meeting_id}/action-items",
    response_model=(
        ActionItemResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
    summary=(
        "Create an action item"
    ),
)
def create_action_item(
    meeting_id: int,

    action_data:
        ActionItemCreate,

    db:
        Session
        =
        Depends(
            get_db
        ),
):
    meeting = db.get(
        Meeting,
        meeting_id,
    )

    if meeting is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Meeting not found."
            ),
        )

    cleaned_task = (
        action_data
        .task
        .strip()
    )

    if not cleaned_task:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "The action item "
                "cannot be empty."
            ),
        )

    action_item = ActionItem(
        meeting_id=(
            meeting_id
        ),

        task=(
            cleaned_task
        ),

        assignee=(
            action_data
            .assignee
            .strip()
            if
            action_data.assignee
            else
            None
        ),

        due_date=(
            action_data
            .due_date
        ),

        completed=False,
    )

    try:
        db.add(
            action_item
        )

        db.commit()

        db.refresh(
            action_item
        )

    except Exception as error:
        db.rollback()

        print(
            "CREATE ACTION ITEM ERROR:",
            error,
        )

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "The action item "
                "could not be created."
            ),
        )

    return action_item


# ============================================================
# UPDATE ACTION ITEM
# ============================================================


@router.patch(
    "/action-items/{action_item_id}",
    response_model=ActionItemResponse,
    summary="Update an action item",
)
def update_action_item(
    action_item_id: int,
    action_data: ActionItemUpdate,
    db: Session = Depends(get_db),
):
    action_item = db.get(ActionItem, action_item_id)

    if action_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found.",
        )

    update_data = action_data.model_dump(exclude_unset=True)

    if "task" in update_data:
        cleaned_task = update_data["task"].strip()

        if not cleaned_task:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The action item cannot be empty.",
            )

        action_item.task = cleaned_task

    if "assignee" in update_data:
        assignee = update_data["assignee"]
        action_item.assignee = (
            assignee.strip()
            if assignee and assignee.strip()
            else None
        )

    if "due_date" in update_data:
        action_item.due_date = update_data["due_date"]

    if "completed" in update_data:
        action_item.completed = update_data["completed"]

    try:
        db.commit()
        db.refresh(action_item)

    except Exception as error:
        db.rollback()

        print(
            "UPDATE ACTION ITEM ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The action item could not be updated.",
        ) from error

    return action_item


# ============================================================
# DELETE ACTION ITEM
# ============================================================


@router.delete(
    "/action-items/{action_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an action item",
)
def delete_action_item(
    action_item_id: int,
    db: Session = Depends(get_db),
):
    action_item = db.get(ActionItem, action_item_id)

    if action_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found.",
        )

    try:
        db.delete(action_item)
        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "DELETE ACTION ITEM ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The action item could not be deleted.",
        ) from error

    return None


# ============================================================
# UPDATE MEETING METADATA
# ============================================================


@router.patch(
    "/{meeting_id}",
    response_model=MeetingDetail,
    summary="Update meeting metadata",
)
def update_meeting(
    meeting_id: int,
    meeting_data: MeetingUpdate,
    db: Session = Depends(get_db),
):
    statement = (
        select(Meeting)
        .where(Meeting.id == meeting_id)
        .options(*meeting_detail_options())
    )

    meeting = db.scalar(statement)

    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found.",
        )

    update_data = meeting_data.model_dump(
        exclude_unset=True,
    )

    if "title" in update_data:
        cleaned_title = update_data["title"].strip()

        if not cleaned_title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The meeting title cannot be empty.",
            )

        meeting.title = cleaned_title

    if "meeting_date" in update_data:
        meeting.meeting_date = update_data["meeting_date"]

    if "duration_seconds" in update_data:
        meeting.duration_seconds = update_data[
            "duration_seconds"
        ]

    if "audio_url" in update_data:
        meeting.audio_url = update_data["audio_url"]

    if "participants" in update_data:
        participant_payloads = update_data["participants"]

        if not participant_payloads:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please add at least one participant.",
            )

        selected_participants = []
        selected_ids = set()

        for participant_data in participant_payloads:
            cleaned_name = participant_data["name"].strip()

            if not cleaned_name:
                continue

            raw_email = participant_data.get("email")
            cleaned_email = (
                raw_email.strip().lower()
                if raw_email and raw_email.strip()
                else None
            )

            participant = None

            # Reuse the existing database participant instead of
            # inserting a duplicate row with the same unique email.
            if cleaned_email:
                participant = db.scalar(
                    select(Participant).where(
                        Participant.email == cleaned_email
                    )
                )

            if participant is None:
                participant = db.scalar(
                    select(Participant).where(
                        Participant.name == cleaned_name
                    )
                )

            if participant is None:
                participant = Participant(
                    name=cleaned_name,
                    email=cleaned_email,
                    avatar_url=participant_data.get(
                        "avatar_url"
                    ),
                    avatar_color=(
                        participant_data.get(
                            "avatar_color"
                        )
                        or "purple"
                    ),
                )

                db.add(participant)
                db.flush()

            else:
                participant.name = cleaned_name

                if cleaned_email is not None:
                    participant.email = cleaned_email

                if (
                    participant_data.get("avatar_url")
                    is not None
                ):
                    participant.avatar_url = (
                        participant_data["avatar_url"]
                    )

                if (
                    participant_data.get("avatar_color")
                    is not None
                ):
                    participant.avatar_color = (
                        participant_data["avatar_color"]
                    )

            if participant.id not in selected_ids:
                selected_participants.append(participant)
                selected_ids.add(participant.id)

        if not selected_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please add at least one valid participant.",
            )

        meeting.participants = selected_participants

    try:
        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "UPDATE MEETING ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The meeting could not be updated.",
        ) from error

    updated_statement = (
        select(Meeting)
        .where(Meeting.id == meeting_id)
        .options(*meeting_detail_options())
    )

    updated_meeting = db.scalar(updated_statement)

    if updated_meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found after update.",
        )

    return updated_meeting


# ============================================================
# DELETE MEETING
# ============================================================


@router.delete(
    "/{meeting_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a meeting",
)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = db.get(Meeting, meeting_id)

    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found.",
        )

    try:
        db.delete(meeting)
        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "DELETE MEETING ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The meeting could not be deleted.",
        ) from error

    return None
