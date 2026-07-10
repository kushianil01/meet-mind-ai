from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import (
    ActionItem,
    Chapter,
    Meeting,
    Participant,
    Topic,
    TranscriptSegment,
)


MEETINGS = [
    {
        "title": "Product Strategy and Q3 Roadmap",
        "days_ago": 1,
        "duration": 2520,
        "summary": (
            "The product team reviewed Q3 priorities and agreed to focus on "
            "enterprise onboarding, dashboard performance, and mobile parity. "
            "The team approved a phased rollout beginning with design-partner "
            "customers and set July 18 as the API migration deadline."
        ),
        "participants": [
            ("Sarah Chen", "sarah@meetmind.demo", "purple"),
            ("David Kumar", "david@meetmind.demo", "blue"),
            ("Maya Patel", "maya@meetmind.demo", "pink"),
            ("Alex Morgan", "alex@meetmind.demo", "green"),
        ],
        "topics": [
            ("Product Roadmap", "purple"),
            ("API Migration", "blue"),
            ("Enterprise", "green"),
            ("Mobile App", "pink"),
        ],
        "transcript": [
            (0, 18, "Sarah Chen", "Welcome, everyone. Today we need to finalize our Q3 roadmap and agree on the initiatives that will receive engineering capacity."),
            (18, 42, "David Kumar", "Engineering recommends prioritizing the API migration. The current integration layer is slowing down enterprise onboarding."),
            (42, 70, "Maya Patel", "Customer interviews support that. Enterprise admins repeatedly mentioned setup time and unclear integration errors."),
            (70, 101, "Alex Morgan", "From design, we can simplify onboarding into four guided steps and add progress indicators for administrators."),
            (101, 134, "Sarah Chen", "That sounds aligned. Our first objective will be reducing enterprise onboarding time from five days to two days."),
            (134, 171, "David Kumar", "The migration is about seventy percent complete. We can finish the remaining endpoints by July 18 if the scope stays stable."),
            (171, 205, "Maya Patel", "We should include three design-partner customers in the first rollout and collect feedback before general availability."),
            (205, 242, "Alex Morgan", "I will complete the onboarding prototype by Friday and schedule a usability review with those customers."),
            (242, 278, "Sarah Chen", "The second priority is dashboard performance. The largest accounts are seeing load times above four seconds."),
            (278, 318, "David Kumar", "We can reduce that by caching aggregate metrics and moving expensive report generation to background jobs."),
            (318, 355, "Maya Patel", "For mobile parity, customers mainly need action-item updates and meeting-summary access. Full administration can wait."),
            (355, 402, "Sarah Chen", "Decision recorded: API migration first, dashboard performance second, and focused mobile parity third. We will review progress next Monday."),
        ],
        "actions": [
            ("Complete remaining API migration endpoints", "David Kumar", date.today() + timedelta(days=7), False),
            ("Finish the enterprise onboarding prototype", "Alex Morgan", date.today() + timedelta(days=3), False),
            ("Recruit three enterprise design partners", "Maya Patel", date.today() + timedelta(days=5), False),
            ("Publish the approved Q3 roadmap", "Sarah Chen", date.today() + timedelta(days=2), True),
        ],
        "chapters": [
            ("Q3 Priorities", 0, 101, "The team aligned on the highest-impact product initiatives."),
            ("Enterprise Onboarding", 101, 242, "The group defined onboarding goals and the API migration deadline."),
            ("Performance and Mobile", 242, 355, "The team discussed dashboard speed and a focused mobile scope."),
            ("Decisions and Next Steps", 355, 402, "Priorities were approved and owners were confirmed."),
        ],
    },
    {
        "title": "Engineering Weekly Stand-up",
        "days_ago": 2,
        "duration": 1980,
        "summary": (
            "Engineering reviewed the API migration, search latency, mobile "
            "release readiness, and production incidents. The team agreed to "
            "complete load testing before Thursday and delay nonessential "
            "refactoring until after the release."
        ),
        "participants": [
            ("David Kumar", "david@meetmind.demo", "blue"),
            ("Priya Shah", "priya@meetmind.demo", "purple"),
            ("Liam Wilson", "liam@meetmind.demo", "orange"),
            ("Nina Rao", "nina@meetmind.demo", "green"),
        ],
        "topics": [
            ("Engineering", "blue"),
            ("Performance", "orange"),
            ("Release", "green"),
            ("API Migration", "purple"),
        ],
        "transcript": [
            (0, 20, "David Kumar", "Good morning. We will cover migration progress, production health, and blockers for the mobile release."),
            (20, 48, "Priya Shah", "The new meeting-list endpoint is complete and integration tests are passing. Pagination still needs edge-case coverage."),
            (48, 78, "Liam Wilson", "Search latency dropped from nine hundred milliseconds to three hundred after adding the new indexes."),
            (78, 112, "Nina Rao", "Production was stable except for one background worker restart. No customer requests were lost."),
            (112, 145, "David Kumar", "The API migration is on schedule, but we need load testing before approving the enterprise rollout."),
            (145, 179, "Priya Shah", "I can prepare the load-test scenarios today and run them against the staging environment tomorrow."),
            (179, 214, "Liam Wilson", "The mobile team found inconsistent timestamp formatting. I have a fix ready for review."),
            (214, 249, "Nina Rao", "Monitoring now includes separate alerts for API latency, queue depth, and failed export jobs."),
            (249, 284, "David Kumar", "Please avoid nonessential refactoring until the release branch is stable."),
            (284, 320, "Priya Shah", "The only blocker is access to the enterprise-size test dataset. I will coordinate with data engineering."),
            (320, 357, "Liam Wilson", "I will merge the timestamp fix after review and verify it on both Android and iOS clients."),
            (357, 398, "David Kumar", "We will review load-test results on Thursday and make the release decision then."),
        ],
        "actions": [
            ("Prepare and run API load tests", "Priya Shah", date.today() + timedelta(days=3), False),
            ("Merge the timestamp formatting fix", "Liam Wilson", date.today() + timedelta(days=2), False),
            ("Verify production monitoring alerts", "Nina Rao", date.today() + timedelta(days=2), True),
            ("Review load-test results", "David Kumar", date.today() + timedelta(days=4), False),
        ],
        "chapters": [
            ("Team Updates", 0, 112, "Engineering shared progress and production-health updates."),
            ("Migration and Testing", 112, 214, "The team discussed load testing and mobile timestamp issues."),
            ("Release Readiness", 214, 320, "Monitoring and release constraints were reviewed."),
            ("Next Steps", 320, 398, "Owners and the Thursday release review were confirmed."),
        ],
    },
    {
        "title": "Customer Feedback Review",
        "days_ago": 4,
        "duration": 2280,
        "summary": (
            "The team analyzed customer feedback from enterprise and mid-market "
            "accounts. Customers value searchable transcripts and summaries but "
            "want clearer speaker identification, faster exports, and more "
            "control over action-item ownership."
        ),
        "participants": [
            ("Maya Patel", "maya@meetmind.demo", "pink"),
            ("Sarah Chen", "sarah@meetmind.demo", "purple"),
            ("Jordan Lee", "jordan@meetmind.demo", "blue"),
            ("Alex Morgan", "alex@meetmind.demo", "green"),
        ],
        "topics": [
            ("Customer Feedback", "pink"),
            ("User Experience", "purple"),
            ("Exports", "blue"),
            ("Action Items", "green"),
        ],
        "transcript": [
            (0, 21, "Maya Patel", "We reviewed feedback from twenty-two customers across enterprise and mid-market accounts."),
            (21, 53, "Sarah Chen", "What are the strongest positive signals and the most repeated sources of friction?"),
            (53, 86, "Maya Patel", "Searchable transcripts are the most valued feature. Customers use them to recover decisions without replaying recordings."),
            (86, 121, "Jordan Lee", "Support tickets show that incorrect speaker labels create confusion when several people have similar voices."),
            (121, 158, "Alex Morgan", "We can make speaker correction easier by allowing users to rename a speaker once and apply it throughout the transcript."),
            (158, 193, "Maya Patel", "Exports are another concern. Large PDF exports sometimes take more than thirty seconds."),
            (193, 229, "Sarah Chen", "We should show progress during export and move document generation to a background task in production."),
            (229, 266, "Jordan Lee", "Customers also want action items assigned to people who did not attend the meeting."),
            (266, 302, "Alex Morgan", "The action-item editor can support free-text assignees now and a directory picker after team features are available."),
            (302, 338, "Maya Patel", "Several customers requested filters for topics, participants, and date ranges in the meetings library."),
            (338, 374, "Sarah Chen", "Those filters align with our roadmap. Let us prioritize speaker correction and export feedback first."),
            (374, 416, "Maya Patel", "I will prepare a ranked feedback report with customer quotes and expected impact by Wednesday."),
        ],
        "actions": [
            ("Prepare ranked customer-feedback report", "Maya Patel", date.today() + timedelta(days=4), False),
            ("Design speaker-correction workflow", "Alex Morgan", date.today() + timedelta(days=6), False),
            ("Investigate slow PDF exports", "Jordan Lee", date.today() + timedelta(days=3), False),
            ("Add library filters to roadmap", "Sarah Chen", date.today() + timedelta(days=2), True),
        ],
        "chapters": [
            ("Feedback Overview", 0, 86, "The team reviewed major positive signals."),
            ("Speaker Identification", 86, 158, "Speaker-label problems and correction UX were discussed."),
            ("Exports and Tasks", 158, 302, "The team reviewed export performance and action-item ownership."),
            ("Priorities", 302, 416, "Search filters and next actions were prioritized."),
        ],
    },
    {
        "title": "Mobile App Launch Planning",
        "days_ago": 7,
        "duration": 2700,
        "summary": (
            "Product, engineering, design, and marketing aligned on the mobile "
            "launch plan. The first release will focus on meeting summaries, "
            "action items, transcript search, and notifications. Beta begins "
            "August 5 with a target public launch on August 26."
        ),
        "participants": [
            ("Sarah Chen", "sarah@meetmind.demo", "purple"),
            ("Liam Wilson", "liam@meetmind.demo", "orange"),
            ("Alex Morgan", "alex@meetmind.demo", "green"),
            ("Emma Davis", "emma@meetmind.demo", "pink"),
        ],
        "topics": [
            ("Mobile App", "purple"),
            ("Launch", "orange"),
            ("Beta", "green"),
            ("Marketing", "pink"),
        ],
        "transcript": [
            (0, 22, "Sarah Chen", "The goal today is to lock the mobile beta scope, launch dates, and ownership across teams."),
            (22, 57, "Liam Wilson", "Core summary viewing and action-item updates are stable on both platforms."),
            (57, 91, "Alex Morgan", "The latest usability tests show that users understand the bottom navigation without onboarding instructions."),
            (91, 128, "Emma Davis", "Marketing needs final screenshots and the approved feature list before we prepare the launch campaign."),
            (128, 164, "Sarah Chen", "The beta scope will include summaries, action items, transcript search, and push notifications."),
            (164, 201, "Liam Wilson", "Offline access and advanced administration should move to a later release to protect the schedule."),
            (201, 239, "Alex Morgan", "I will deliver production-ready store assets and accessibility checks by July 29."),
            (239, 278, "Emma Davis", "We will recruit one hundred beta users from existing customers and segment feedback by company size."),
            (278, 316, "Sarah Chen", "The beta will begin August 5. We will review crash rate and weekly active usage after seven days."),
            (316, 354, "Liam Wilson", "Our release threshold should be a crash-free session rate above ninety-nine point five percent."),
            (354, 393, "Emma Davis", "If the beta metrics are healthy, the public launch campaign can begin on August 26."),
            (393, 438, "Sarah Chen", "The dates are approved. Each team should update the shared launch checklist before Friday."),
        ],
        "actions": [
            ("Complete app-store assets and accessibility review", "Alex Morgan", date.today() + timedelta(days=8), False),
            ("Recruit one hundred mobile beta users", "Emma Davis", date.today() + timedelta(days=10), False),
            ("Finalize mobile release monitoring", "Liam Wilson", date.today() + timedelta(days=9), False),
            ("Update the shared launch checklist", "Sarah Chen", date.today() + timedelta(days=3), True),
        ],
        "chapters": [
            ("Launch Goals", 0, 128, "The team reviewed product readiness and marketing dependencies."),
            ("Beta Scope", 128, 239, "The first-release feature set was finalized."),
            ("Beta Plan", 239, 354, "Recruitment, dates, and success metrics were agreed."),
            ("Public Launch", 354, 438, "The public launch target and next steps were approved."),
        ],
    },
    {
        "title": "Marketing Campaign Retrospective",
        "days_ago": 10,
        "duration": 2160,
        "summary": (
            "Marketing reviewed the spring campaign, which exceeded the lead "
            "target by eighteen percent. Educational webinars and customer "
            "stories performed best, while broad paid-social campaigns had "
            "lower conversion. Future campaigns will focus on role-specific "
            "content and stronger attribution."
        ),
        "participants": [
            ("Emma Davis", "emma@meetmind.demo", "pink"),
            ("Maya Patel", "maya@meetmind.demo", "purple"),
            ("Noah Brown", "noah@meetmind.demo", "blue"),
            ("Sarah Chen", "sarah@meetmind.demo", "green"),
        ],
        "topics": [
            ("Marketing", "pink"),
            ("Campaign", "purple"),
            ("Analytics", "blue"),
            ("Customer Stories", "green"),
        ],
        "transcript": [
            (0, 20, "Emma Davis", "Today we will review campaign performance, what worked, what underperformed, and what to change next quarter."),
            (20, 54, "Noah Brown", "The campaign generated eighteen percent more qualified leads than target and reduced cost per lead by nine percent."),
            (54, 89, "Maya Patel", "Customer-story content produced the highest engagement, especially for operations and customer-success audiences."),
            (89, 124, "Sarah Chen", "Did those leads convert into product evaluations at the same rate as our other channels?"),
            (124, 161, "Noah Brown", "Webinar leads converted at fourteen percent, while broad paid-social leads converted at only five percent."),
            (161, 198, "Emma Davis", "That suggests we should reduce broad targeting and invest more in educational events and role-specific content."),
            (198, 236, "Maya Patel", "Customers responded well to practical examples showing how teams recover decisions from meeting transcripts."),
            (236, 272, "Sarah Chen", "We should build the next campaign around measurable productivity outcomes rather than generic AI messaging."),
            (272, 309, "Noah Brown", "Attribution is still incomplete because several webinar registrations were not connected to CRM opportunities."),
            (309, 346, "Emma Davis", "I will work with operations to fix campaign tracking before the next launch."),
            (346, 382, "Maya Patel", "I will identify three customers for new stories focused on engineering, sales, and customer success."),
            (382, 424, "Emma Davis", "The next campaign will prioritize webinars, customer evidence, role-specific messaging, and complete attribution."),
        ],
        "actions": [
            ("Fix webinar-to-CRM campaign attribution", "Emma Davis", date.today() + timedelta(days=6), False),
            ("Identify three customers for new stories", "Maya Patel", date.today() + timedelta(days=5), False),
            ("Create role-specific conversion report", "Noah Brown", date.today() + timedelta(days=4), False),
            ("Approve productivity-outcomes campaign direction", "Sarah Chen", date.today() + timedelta(days=2), True),
        ],
        "chapters": [
            ("Campaign Results", 0, 124, "The team reviewed lead volume, cost, and content performance."),
            ("Channel Conversion", 124, 236, "Webinars and customer stories outperformed broad paid social."),
            ("Messaging and Attribution", 236, 346, "The team discussed positioning and tracking gaps."),
            ("Next Campaign", 346, 424, "Owners and the future campaign direction were confirmed."),
        ],
    },
]


def get_or_create_participant(db, name, email, color):
    participant = db.scalar(
        select(Participant).where(Participant.email == email)
    )

    if participant:
        return participant

    participant = Participant(
        name=name,
        email=email,
        avatar_color=color,
    )

    db.add(participant)
    db.flush()

    return participant


def get_or_create_topic(db, name, color):
    topic = db.scalar(
        select(Topic).where(Topic.name == name)
    )

    if topic:
        return topic

    topic = Topic(
        name=name,
        color=color,
    )

    db.add(topic)
    db.flush()

    return topic


def seed_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    created_meetings = 0
    existing_meetings = 0

    try:
        for meeting_data in MEETINGS:
            existing = db.scalar(
                select(Meeting).where(
                    Meeting.title == meeting_data["title"]
                )
            )

            if existing:
                existing_meetings += 1
                continue

            meeting = Meeting(
                title=meeting_data["title"],
                meeting_date=(
                    datetime.now(timezone.utc)
                    - timedelta(days=meeting_data["days_ago"])
                ),
                duration_seconds=meeting_data["duration"],
                summary=meeting_data["summary"],
                summary_source="seeded",
            )

            meeting.participants = [
                get_or_create_participant(
                    db,
                    name,
                    email,
                    color,
                )
                for name, email, color
                in meeting_data["participants"]
            ]

            meeting.topics = [
                get_or_create_topic(
                    db,
                    name,
                    color,
                )
                for name, color
                in meeting_data["topics"]
            ]

            for position, segment in enumerate(
                meeting_data["transcript"]
            ):
                start_time, end_time, speaker, text = segment

                meeting.transcript_segments.append(
                    TranscriptSegment(
                        speaker_name=speaker,
                        start_time=start_time,
                        end_time=end_time,
                        text=text,
                        position=position,
                    )
                )

            for task, assignee, due_date, completed in (
                meeting_data["actions"]
            ):
                meeting.action_items.append(
                    ActionItem(
                        task=task,
                        assignee=assignee,
                        due_date=due_date,
                        completed=completed,
                    )
                )

            for position, chapter in enumerate(
                meeting_data["chapters"]
            ):
                title, start_time, end_time, summary = chapter

                meeting.chapters.append(
                    Chapter(
                        title=title,
                        start_time=start_time,
                        end_time=end_time,
                        summary=summary,
                        position=position,
                    )
                )

            db.add(meeting)
            created_meetings += 1

        db.commit()

        print()
        print("MeetMind AI database seeded successfully.")
        print(f"Created meetings: {created_meetings}")
        print(f"Already existing: {existing_meetings}")
        print(f"Total configured meetings: {len(MEETINGS)}")
        print()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()