"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  FileText,
  ListChecks,
  LoaderCircle,
  MessageSquareText,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Share2,
  Sparkles,
  Users,
  Volume2,
  WandSparkles,
  X,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  askMeeting,
  createActionItem,
  deleteActionItem,
  updateActionItem,
  updateMeeting 

} from "@/lib/api";
import {
  ActionItem,
  MeetingDetail,
} from "@/lib/types";
interface Props {
  meeting: MeetingDetail;
}

type DetailTab =
  | "summary"
  | "transcript"
  | "actions"
  | "chapters";

function formatTime(
  seconds: number,
) {
  const safeSeconds =
    Number(seconds) || 0;

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const remainingSeconds =
    Math.floor(
      safeSeconds % 60,
    );

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function formatDuration(
  seconds: number,
) {
  const minutes =
    Math.round(
      seconds / 60,
    );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remaining =
    minutes % 60;

  return `${hours}h ${remaining}m`;
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function getInitials(
  name: string,
) {
  return name
    .split(" ")
    .map(
      (word) => word[0],
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MeetingDetailView({
  meeting,
}: Props) {
    const router =
    useRouter();


  const [
    displayedMeeting,
    setDisplayedMeeting,
  ] = useState<MeetingDetail>(
    meeting,
  );
  const [
    activeTab,
    setActiveTab,
  ] = useState<DetailTab>(
    "summary",
  );

  const [
    transcriptSearch,
    setTranscriptSearch,
  ] = useState("");

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    copied,
    setCopied,
  ] = useState(false);

  /*
  ========================================
  ASK MEETMIND STATE
  ========================================
  */
 const [
  summaryCopied,
  setSummaryCopied,
] = useState(false);
  /*
  ========================================
  ACTION ITEM CRUD STATE
  ========================================
  */
  /*
  ========================================
  EDIT MEETING STATE
  ========================================
  */


  const [
    isEditingMeeting,
    setIsEditingMeeting,
  ] = useState(false);


  const [
    editMeetingTitle,
    setEditMeetingTitle,
  ] = useState(
    meeting.title,
  );


  const [
    editParticipants,
    setEditParticipants,
  ] = useState(
    meeting.participants.map(
      (
        participant,
      ) => ({
        name:
          participant.name,

        email:
          participant.email ??
          "",

        avatar_url:
          participant.avatar_url ??
          null,

        avatar_color:
          participant.avatar_color ??
          null,
      }),
    ),
  );


  const [
    editMeetingLoading,
    setEditMeetingLoading,
  ] = useState(false);


  const [
    editMeetingError,
    setEditMeetingError,
  ] = useState("");

  const [
    actionItems,
    setActionItems,
  ] = useState<ActionItem[]>(
    meeting.action_items,
  );

  const [
    actionMenuId,
    setActionMenuId,
  ] = useState<
    number | null
  >(null);

  const [
    showActionForm,
    setShowActionForm,
  ] = useState(false);

  const [
    editingAction,
    setEditingAction,
  ] = useState<
    ActionItem | null
  >(null);

  const [
    actionTask,
    setActionTask,
  ] = useState("");

  const [
    actionAssignee,
    setActionAssignee,
  ] = useState("");

  const [
    actionDueDate,
    setActionDueDate,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    askQuestion,
    setAskQuestion,
  ] = useState("");

  const [
    askAnswer,
    setAskAnswer,
  ] = useState("");

  const [
    askLoading,
    setAskLoading,
  ] = useState(false);

  const [
    askError,
    setAskError,
  ] = useState("");

  const [
    completedActions,
    setCompletedActions,
  ] = useState<
    Set<number>
  >(
    new Set(
      meeting.action_items
        .filter(
  (item) =>
    item.completed,
)
        .map(
          (item) => item.id,
        ),
    ),
  );

  const filteredTranscript =
    useMemo(() => {
      const query =
        transcriptSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return (
          meeting
            .transcript_segments
        );
      }

      return meeting
        .transcript_segments
        .filter(
          (segment) =>
            segment.text
              .toLowerCase()
              .includes(
                query,
              ) ||
            segment
              .speaker_name
              .toLowerCase()
              .includes(
                query,
              ),
        );
    }, [
      meeting,
      transcriptSearch,
    ]);

  const transcriptText =
    useMemo(
      () =>
        meeting
          .transcript_segments
          .map(
            (segment) =>
              `${
                segment.speaker_name
              } [${
                formatTime(
                  segment.start_time,
                )
              }]\n${
                segment.text
              }`,
          )
          .join("\n\n"),
      [meeting],
    );

  /*
  ========================================
  ASK MEETMIND FUNCTIONS
  ========================================
  */
   /*
  ========================================
  EDIT MEETING FUNCTIONS
  ========================================
  */


  function openEditMeeting() {
    setEditMeetingTitle(
      displayedMeeting.title,
    );


    setEditParticipants(
      displayedMeeting
        .participants
        .map(
          (
            participant,
          ) => ({
            name:
              participant.name,

            email:
              participant.email ??
              "",

            avatar_url:
              participant.avatar_url ??
              null,

            avatar_color:
              participant.avatar_color ??
              null,
          }),
        ),
    );


    setEditMeetingError("");

    setIsEditingMeeting(
      true,
    );
  }


  function closeEditMeeting() {
    if (
      editMeetingLoading
    ) {
      return;
    }


    setEditMeetingError("");

    setIsEditingMeeting(
      false,
    );
  }


  function addMeetingParticipant() {
    setEditParticipants(
      (
        current,
      ) => [
        ...current,

        {
          name:
            "",

          email:
            "",

          avatar_url:
            null,

          avatar_color:
            null,
        },
      ],
    );
  }


  function updateMeetingParticipant(
    index:
      number,

    field:
      "name" |
      "email",

    value:
      string,
  ) {
    setEditParticipants(
      (
        current,
      ) =>
        current.map(
          (
            participant,
            participantIndex,
          ) =>
            participantIndex ===
            index
              ? {
                  ...participant,

                  [field]:
                    value,
                }
              : participant,
        ),
    );
  }


  function removeMeetingParticipant(
    index:
      number,
  ) {
    setEditParticipants(
      (
        current,
      ) =>
        current.filter(
          (
            _participant,
            participantIndex,
          ) =>
            participantIndex !==
            index,
        ),
    );
  }


  async function saveMeetingChanges(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    const cleanedTitle =
      editMeetingTitle
        .trim();


    const cleanedParticipants =
      editParticipants
        .map(
          (
            participant,
          ) => ({
            name:
              participant
                .name
                .trim(),

            email:
              participant
                .email
                .trim() ||
              null,

            avatar_url:
              participant
                .avatar_url,

            avatar_color:
              participant
                .avatar_color,
          }),
        )
        .filter(
          (
            participant,
          ) =>
            participant
              .name
              .length >
            0,
        );


    if (
      !cleanedTitle
    ) {
      setEditMeetingError(
        "Please enter a meeting title.",
      );

      return;
    }


    if (
      cleanedParticipants
        .length ===
      0
    ) {
      setEditMeetingError(
        "Please add at least one participant.",
      );

      return;
    }


    try {
      setEditMeetingLoading(
        true,
      );

      setEditMeetingError(
        "",
      );


      const updatedMeeting =
        await updateMeeting(
          displayedMeeting.id,

          {
            title:
              cleanedTitle,

            participants:
              cleanedParticipants,
          },
        );


      setDisplayedMeeting(
        updatedMeeting,
      );


      setIsEditingMeeting(
        false,
      );


      router.refresh();
    }

    catch (
      error
    ) {
      setEditMeetingError(
        error instanceof
          Error
          ? error.message
          : "Unable to update the meeting.",
      );
    }

    finally {
      setEditMeetingLoading(
        false,
      );
    }
  }
 

  async function submitQuestion(
    question?: string,
  ) {
    const finalQuestion =
      (
        question ??
        askQuestion
      ).trim();

    if (
      !finalQuestion ||
      askLoading
    ) {
      return;
    }

    try {
      setAskQuestion(
        finalQuestion,
      );

      setAskLoading(
        true,
      );

      setAskAnswer("");

      setAskError("");

      const answer =
        await askMeeting(
          meeting.id,
          finalQuestion,
        );

      setAskAnswer(
        answer,
      );
    } catch (error) {
      setAskError(
        error instanceof Error
          ? error.message
          : "MeetMind could not answer this question.",
      );
    } finally {
      setAskLoading(
        false,
      );
    }
  }

  function handleAskSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    submitQuestion();
  }

  function scrollToAskMeetMind() {
    document
      .getElementById(
        "ask-meetmind",
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  async function copyTranscript() {
    await navigator.clipboard
      .writeText(
        transcriptText,
      );

    setCopied(true);

    setTimeout(
      () =>
        setCopied(false),
      1600,
    );
  }

  function exportMeeting() {
    const content = [
      meeting.title,
      formatDate(
        meeting.meeting_date,
      ),
      "",
      "SUMMARY",
      meeting.summary ??
        "No summary available.",
      "",
      "ACTION ITEMS",
      ...actionItems.map(
        (item) =>
          `- ${item.task}`,
      ),
      "",
      "TRANSCRIPT",
      transcriptText,
    ].join("\n");

    const blob =
      new Blob(
        [content],
        {
          type:
            "text/plain;charset=utf-8",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href = url;

    anchor.download =
      `${meeting.title
        .replace(
          /[^a-z0-9]/gi,
          "-",
        )
        .toLowerCase()}.txt`;

    anchor.click();

    URL.revokeObjectURL(
      url,
    );
  }

  async function copySummary() {
    const summary =
      meeting.summary?.trim();

    if (!summary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        summary,
      );

      setSummaryCopied(true);

      setTimeout(
        () =>
          setSummaryCopied(false),
        1600,
      );
    } catch {
      setSummaryCopied(false);
    }
  }

  function openAddActionForm() {
    setEditingAction(null);
    setActionTask("");
    setActionAssignee("");
    setActionDueDate("");
    setActionError("");
    setActionMenuId(null);
    setShowActionForm(true);
  }

  function openEditActionForm(
    item: ActionItem,
  ) {
    setEditingAction(item);
    setActionTask(item.task);
    setActionAssignee(
      item.assignee ?? "",
    );
    setActionDueDate(
      item.due_date ?? "",
    );
    setActionError("");
    setActionMenuId(null);
    setShowActionForm(true);
  }

  function closeActionForm() {
    if (actionLoading) {
      return;
    }

    setShowActionForm(false);
    setEditingAction(null);
    setActionTask("");
    setActionAssignee("");
    setActionDueDate("");
    setActionError("");
  }

  async function saveActionItem(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedTask =
      actionTask.trim();

    if (
      !cleanedTask ||
      actionLoading
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      if (editingAction) {
        const updated =
          await updateActionItem(
            editingAction.id,
            {
              task: cleanedTask,
              assignee:
                actionAssignee
                  .trim() ||
                null,
              due_date:
                actionDueDate ||
                null,
            },
          );

        setActionItems(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item,
            ),
        );
      } else {
        const created =
          await createActionItem(
            meeting.id,
            {
              task: cleanedTask,
              assignee:
                actionAssignee
                  .trim() ||
                null,
              due_date:
                actionDueDate ||
                null,
            },
          );

        setActionItems(
          (current) => [
            ...current,
            created,
          ],
        );
      }

      setShowActionForm(false);
      setEditingAction(null);
      setActionTask("");
      setActionAssignee("");
      setActionDueDate("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to save the action item.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleAction(
    actionId: number,
  ) {
    const currentAction =
      actionItems.find(
        (item) =>
          item.id === actionId,
      );

    if (!currentAction) {
      return;
    }

    try {
      const updated =
        await updateActionItem(
          actionId,
          {
            completed:
              !currentAction.completed,
          },
        );

      setActionItems(
        (current) =>
          current.map(
            (item) =>
              item.id ===
                updated.id
                ? updated
                : item,
          ),
      );

      setCompletedActions(
        (current) => {
          const next =
            new Set(current);

          if (
            updated.completed
          ) {
            next.add(
              actionId,
            );
          } else {
            next.delete(
              actionId,
            );
          }

          return next;
        },
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to update the action item.",
      );
    }
  }

  async function removeActionItem(
    item: ActionItem,
  ) {
    const confirmed =
      window.confirm(
        `Delete this action item?\n\n${item.task}`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionError("");

      await deleteActionItem(
        item.id,
      );

      setActionItems(
        (current) =>
          current.filter(
            (action) =>
              action.id !==
              item.id,
          ),
      );

      setCompletedActions(
        (current) => {
          const next =
            new Set(current);

          next.delete(item.id);

          return next;
        },
      );

      setActionMenuId(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to delete the action item.",
      );
    }
  }

  return (
    <main className="meeting-detail-page">
      <header className="detail-topbar">
        <Link
          className="detail-back-button"
          href="/"
        >
          <ArrowLeft
            size={17}
          />

          <span>
            All meetings
          </span>
        </Link>

        <div className="detail-brand">
          <div>
            <WandSparkles
              size={17}
            />
          </div>

          <strong>
            MeetMind
            <span> AI</span>
          </strong>
        </div>

        <div className="detail-header-actions">
          <button
            onClick={
              exportMeeting
            }
          >
            <Download
              size={16}
            />

            Export
          </button>

          <button>
            <Share2
              size={16}
            />

            Share
          </button>

          <button
            className="detail-ai-button"
            onClick={
              scrollToAskMeetMind
            }
          >
            <Sparkles
              size={16}
            />

            Ask MeetMind
          </button>

          <button
            className="detail-icon-button"
          >
            <MoreHorizontal
              size={18}
            />
          </button>
        </div>
      </header>

      <div className="detail-content">
        <section className="detail-hero">
          <div className="detail-breadcrumb">
            Meetings

            <ChevronRight
              size={13}
            />

            <span>
              Meeting intelligence
            </span>
          </div>

          <div className="detail-title-row">
            <div>
              <div className="detail-status">
                <CheckCircle2
                  size={13}
                />

                Analysis complete
              </div>

              <h1>
  {
    displayedMeeting
      .title
  }
</h1>

              <div className="detail-metadata">
                <span>
                  <CalendarDays
                    size={15}
                  />

                  {formatDate(
                    meeting
                      .meeting_date,
                  )}
                </span>

                <span>
                  <Clock3
                    size={15}
                  />

                  {formatDuration(
                    meeting
                      .duration_seconds,
                  )}
                </span>

                <span>
                  <Users
                    size={15}
                  />

                 {
  displayedMeeting
    .participants
    .length
}{" "}
                  participants
                </span>
              </div>
            </div>

           <div className="meeting-header-actions">
  <button
    className="edit-meeting-button"
    type="button"
    onClick={
  openEditMeeting
}
  >
    <Pencil size={17} />

    <span>
      Edit meeting
    </span>
  </button>

  <button
    className="save-meeting-button"
    type="button"
  >
    <Bookmark size={18} />

    <span>
      Save meeting
    </span>
  </button>
</div>
          </div>

          <div className="detail-participant-row">
            <div className="detail-avatar-stack">
              {displayedMeeting
  .participants
  .map(
                  (
                    participant,
                  ) => (
                    <div
                      className="detail-avatar"
                      key={
                        participant.id
                      }
                      title={
                        participant.name
                      }
                    >
                      {getInitials(
                        participant.name,
                      )}
                    </div>
                  ),
                )}
            </div>

            <div className="detail-participant-names">
              {displayedMeeting
  .participants
  .map(
                  (
                    participant,
                  ) =>
                    participant.name,
                )
                .join(", ")}
            </div>

            <div className="detail-topic-list">
              {meeting.topics
                .map(
                  (topic) => (
                    <span
                      key={
                        topic.id
                      }
                    >
                      <Sparkles
                        size={
                          11
                        }
                      />

                      {
                        topic.name
                      }
                    </span>
                  ),
                )}
            </div>
          </div>
        </section>

        <section className="audio-player-card">
          <button
            className="audio-play-button"
            onClick={() =>
              setIsPlaying(
                (current) =>
                  !current,
              )
            }
          >
            {isPlaying ? (
              <Pause
                size={20}
                fill="currentColor"
              />
            ) : (
              <Play
                size={20}
                fill="currentColor"
              />
            )}
          </button>

          <div className="audio-player-main">
            <div className="audio-player-label">
              <div>
                <strong>
                  Meeting recording
                </strong>

                <span>
                  AI-enhanced audio
                </span>
              </div>

              <span>
                {formatTime(
                  currentTime,
                )}{" "}
                /{" "}
                {formatTime(
                  meeting
                    .duration_seconds,
                )}
              </span>
            </div>

            <input
              aria-label="Meeting playback position"
              className="audio-range"
              max={
                meeting
                  .duration_seconds
              }
              min="0"
              onChange={(
                event,
              ) =>
                setCurrentTime(
                  Number(
                    event
                      .target
                      .value,
                  ),
                )
              }
              type="range"
              value={
                currentTime
              }
            />
          </div>

          <button className="audio-control">
            <Volume2
              size={18}
            />
          </button>

          <button className="audio-speed">
            1×
          </button>
        </section>

        <div className="detail-workspace">
          <section className="detail-main-panel">
            <nav className="detail-tabs">
              <button
                className={
                  activeTab ===
                  "summary"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "summary",
                  )
                }
              >
                <Sparkles
                  size={16}
                />

                Summary
              </button>

              <button
                className={
                  activeTab ===
                  "transcript"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "transcript",
                  )
                }
              >
                <MessageSquareText
                  size={16}
                />

                Transcript

                <small>
                  {
                    meeting
                      .transcript_segments
                      .length
                  }
                </small>
              </button>

              <button
                className={
                  activeTab ===
                  "actions"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "actions",
                  )
                }
              >
                <ListChecks
                  size={16}
                />

                Action items

                <small>
                  {
                    actionItems
                      .length
                  }
                </small>
              </button>

              <button
                className={
                  activeTab ===
                  "chapters"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "chapters",
                  )
                }
              >
                <FileText
                  size={16}
                />

                Chapters

                <small>
                  {
                    meeting
                      .chapters
                      .length
                  }
                </small>
              </button>
            </nav>

            <div className="detail-tab-content">
              {activeTab ===
                "summary" && (
                <div className="summary-content">
                  <div className="summary-heading">
                    <div>
                      <span>
                        <Sparkles
                          size={
                            15
                          }
                        />

                        AI-generated
                      </span>

                      <h2>
                        Meeting
                        summary
                      </h2>
                    </div>

                    <button
                      onClick={
                        copySummary
                      }
                      type="button"
                    >
                      {summaryCopied ? (
                        <Check
                          size={15}
                        />
                      ) : (
                        <Copy
                          size={15}
                        />
                      )}

                      {summaryCopied
                        ? "Copied"
                        : "Copy"}
                    </button>
                  </div>

                  <div className="summary-callout">
                    <div>
                      <WandSparkles
                        size={
                          20
                        }
                      />
                    </div>

                    <p>
                      {meeting.summary ??
                        "The meeting was processed successfully. Review the transcript and action items for complete details."}
                    </p>
                  </div>

                  <h3>
                    Key discussion
                    topics
                  </h3>

                  <div className="summary-topic-grid">
                    {meeting.topics
                      .map(
                        (
                          topic,
                          index,
                        ) => (
                          <article
                            key={
                              topic.id
                            }
                          >
                            <span>
                              {String(
                                index +
                                  1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>

                            <div>
                              <strong>
                                {
                                  topic.name
                                }
                              </strong>

                              <p>
                                Discussed
                                during
                                the
                                meeting
                                and
                                captured
                                in the
                                searchable
                                transcript.
                              </p>
                            </div>
                          </article>
                        ),
                      )}
                  </div>

                  {actionItems
                    .length >
                    0 && (
                    <>
                      <h3>
                        Next steps
                      </h3>

                      <div className="summary-action-list">
                        {actionItems
                          .slice(
                            0,
                            4,
                          )
                          .map(
                            (
                              item,
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                              >
                                <Check
                                  size={
                                    14
                                  }
                                />

                                <span>
                                  {
                                    item.task
                                  }
                                </span>
                              </div>
                            ),
                          )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab ===
                "transcript" && (
                <div className="transcript-content">
                  <div className="transcript-toolbar">
                    <div>
                      <h2>
                        Full transcript
                      </h2>

                      <p>
                        Search, review,
                        and jump to any
                        moment.
                      </p>
                    </div>

                    <button
                      onClick={
                        copyTranscript
                      }
                    >
                      {copied ? (
                        <Check
                          size={
                            15
                          }
                        />
                      ) : (
                        <Copy
                          size={
                            15
                          }
                        />
                      )}

                      {copied
                        ? "Copied"
                        : "Copy transcript"}
                    </button>
                  </div>

                  <div className="transcript-search">
                    <Search
                      size={17}
                    />

                    <input
                      onChange={(
                        event,
                      ) =>
                        setTranscriptSearch(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Search transcript or speaker..."
                      value={
                        transcriptSearch
                      }
                    />

                    {transcriptSearch && (
                      <button
                        onClick={() =>
                          setTranscriptSearch(
                            "",
                          )
                        }
                      >
                        <X
                          size={
                            15
                          }
                        />
                      </button>
                    )}
                  </div>

                  <div className="transcript-list">
                    {filteredTranscript
                      .map(
                        (
                          segment,
                          index,
                        ) => (
                          <article
                            className="transcript-segment"
                            key={
                              segment.id
                            }
                          >
                            <div
                              className={`speaker-avatar speaker-${
                                index %
                                4
                              }`}
                            >
                              {getInitials(
                                segment
                                  .speaker_name,
                              )}
                            </div>

                            <div className="transcript-message">
                              <div>
                                <strong>
                                  {
                                    segment
                                      .speaker_name
                                  }
                                </strong>

                                <button
                                  onClick={() =>
                                    setCurrentTime(
                                      segment
                                        .start_time,
                                    )
                                  }
                                >
                                  <Play
                                    size={
                                      10
                                    }
                                    fill="currentColor"
                                  />

                                  {formatTime(
                                    segment
                                      .start_time,
                                  )}
                                </button>
                              </div>

                              <p>
                                {
                                  segment.text
                                }
                              </p>
                            </div>
                          </article>
                        ),
                      )}

                    {filteredTranscript
                      .length ===
                      0 && (
                      <div className="empty-tab-state">
                        No transcript
                        results match “
                        {
                          transcriptSearch
                        }
                        ”.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab ===
                "actions" && (
                <div className="action-content">
                  <div className="tab-section-heading">
                    <div>
                      <h2>
                        Action items
                      </h2>

                      <p>
                        Track commitments
                        and next steps
                        from this meeting.
                      </p>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "12px",
                      }}
                    >
                      <span>
                        {
                          actionItems
                            .filter(
                              (item) =>
                                item
                                  .completed,
                            )
                            .length
                        }
                        /
                        {
                          actionItems
                            .length
                        }{" "}
                        complete
                      </span>

                      <button
                        onClick={
                          openAddActionForm
                        }
                        style={{
                          border:
                            "1px solid rgba(157, 102, 255, 0.45)",
                          background:
                            "rgba(125, 74, 220, 0.15)",
                          color:
                            "#c9a9ff",
                          borderRadius:
                            "10px",
                          padding:
                            "10px 15px",
                          cursor:
                            "pointer",
                          fontWeight:
                            600,
                        }}
                        type="button"
                      >
                        + Add action
                      </button>
                    </div>
                  </div>

                  {actionError && (
                    <div
                      className="ask-error-message"
                      role="alert"
                    >
                      {actionError}
                    </div>
                  )}

                  <div className="action-item-list">
                    {actionItems.map(
                      (item) => (
                        <article
                          className={
                            item.completed
                              ? "completed"
                              : ""
                          }
                          key={item.id}
                          style={{
                            position:
                              "relative",
                          }}
                        >
                          <button
                            className="action-checkbox"
                            onClick={() =>
                              toggleAction(
                                item.id,
                              )
                            }
                            type="button"
                          >
                            {item.completed && (
                              <Check
                                size={14}
                              />
                            )}
                          </button>

                          <div>
                            <p>
                              {item.task}
                            </p>

                            <span>
                              Assigned to{" "}
                              {item.assignee ??
                                "Meeting team"}

                              {item.due_date
                                ? ` • Due ${item.due_date}`
                                : ""}
                            </span>
                          </div>

                          <button
                            className="action-options"
                            onClick={() =>
                              setActionMenuId(
                                (current) =>
                                  current ===
                                  item.id
                                    ? null
                                    : item.id,
                              )
                            }
                            type="button"
                          >
                            <MoreHorizontal
                              size={18}
                            />
                          </button>

                          {actionMenuId ===
                            item.id && (
                            <div
                              style={{
                                position:
                                  "absolute",
                                right:
                                  "42px",
                                top:
                                  "50px",
                                zIndex:
                                  40,
                                minWidth:
                                  "135px",
                                overflow:
                                  "hidden",
                                border:
                                  "1px solid rgba(255,255,255,0.12)",
                                borderRadius:
                                  "10px",
                                background:
                                  "#171724",
                                boxShadow:
                                  "0 15px 40px rgba(0,0,0,0.4)",
                              }}
                            >
                              <button
                                onClick={() =>
                                  openEditActionForm(
                                    item,
                                  )
                                }
                                style={{
                                  width:
                                    "100%",
                                  border:
                                    "none",
                                  background:
                                    "transparent",
                                  color:
                                    "#e8e5f1",
                                  padding:
                                    "12px 16px",
                                  cursor:
                                    "pointer",
                                  textAlign:
                                    "left",
                                }}
                                type="button"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  removeActionItem(
                                    item,
                                  )
                                }
                                style={{
                                  width:
                                    "100%",
                                  border:
                                    "none",
                                  borderTop:
                                    "1px solid rgba(255,255,255,0.08)",
                                  background:
                                    "transparent",
                                  color:
                                    "#ff7f91",
                                  padding:
                                    "12px 16px",
                                  cursor:
                                    "pointer",
                                  textAlign:
                                    "left",
                                }}
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </article>
                      ),
                    )}

                    {actionItems.length ===
                      0 && (
                      <div className="empty-tab-state">
                        No action items
                        are available.
                        Click Add action
                        to create one.
                      </div>
                    )}
                  </div>

                  {showActionForm && (
                    <div
                      style={{
                        position:
                          "fixed",
                        inset:
                          0,
                        zIndex:
                          1000,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        padding:
                          "20px",
                        background:
                          "rgba(5,5,14,0.76)",
                        backdropFilter:
                          "blur(8px)",
                      }}
                    >
                      <form
                        onSubmit={
                          saveActionItem
                        }
                        style={{
                          width:
                            "min(520px, 100%)",
                          border:
                            "1px solid rgba(160,110,255,0.28)",
                          borderRadius:
                            "18px",
                          background:
                            "#12121f",
                          boxShadow:
                            "0 30px 80px rgba(0,0,0,0.55)",
                          padding:
                            "26px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            marginBottom:
                              "22px",
                          }}
                        >
                          <h2
                            style={{
                              margin:
                                0,
                            }}
                          >
                            {editingAction
                              ? "Edit action item"
                              : "Add action item"}
                          </h2>

                          <button
                            disabled={
                              actionLoading
                            }
                            onClick={
                              closeActionForm
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              color:
                                "#aaa5b8",
                              cursor:
                                "pointer",
                            }}
                            type="button"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <label
                          style={{
                            display:
                              "block",
                            marginBottom:
                              "18px",
                          }}
                        >
                          <span>
                            Action
                          </span>

                          <textarea
                            autoFocus
                            disabled={
                              actionLoading
                            }
                            onChange={(
                              event,
                            ) =>
                              setActionTask(
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder="Enter the action item..."
                            required
                            rows={4}
                            style={{
                              boxSizing:
                                "border-box",
                              width:
                                "100%",
                              marginTop:
                                "8px",
                              resize:
                                "vertical",
                              border:
                                "1px solid rgba(255,255,255,0.12)",
                              borderRadius:
                                "11px",
                              outline:
                                "none",
                              background:
                                "#191925",
                              color:
                                "#f2eff8",
                              padding:
                                "13px",
                              font:
                                "inherit",
                            }}
                            value={
                              actionTask
                            }
                          />
                        </label>

                        <label
                          style={{
                            display:
                              "block",
                            marginBottom:
                              "18px",
                          }}
                        >
                          <span>
                            Assignee
                          </span>

                          <input
                            disabled={
                              actionLoading
                            }
                            onChange={(
                              event,
                            ) =>
                              setActionAssignee(
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder="Optional"
                            style={{
                              boxSizing:
                                "border-box",
                              width:
                                "100%",
                              marginTop:
                                "8px",
                              border:
                                "1px solid rgba(255,255,255,0.12)",
                              borderRadius:
                                "11px",
                              outline:
                                "none",
                              background:
                                "#191925",
                              color:
                                "#f2eff8",
                              padding:
                                "13px",
                              font:
                                "inherit",
                            }}
                            value={
                              actionAssignee
                            }
                          />
                        </label>

                        <label
                          style={{
                            display:
                              "block",
                            marginBottom:
                              "22px",
                          }}
                        >
                          <span>
                            Due date
                          </span>

                          <input
                            disabled={
                              actionLoading
                            }
                            onChange={(
                              event,
                            ) =>
                              setActionDueDate(
                                event
                                  .target
                                  .value,
                              )
                            }
                            style={{
                              boxSizing:
                                "border-box",
                              width:
                                "100%",
                              marginTop:
                                "8px",
                              border:
                                "1px solid rgba(255,255,255,0.12)",
                              borderRadius:
                                "11px",
                              outline:
                                "none",
                              background:
                                "#191925",
                              color:
                                "#f2eff8",
                              padding:
                                "13px",
                              font:
                                "inherit",
                            }}
                            type="date"
                            value={
                              actionDueDate
                            }
                          />
                        </label>

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                            gap:
                              "11px",
                          }}
                        >
                          <button
                            disabled={
                              actionLoading
                            }
                            onClick={
                              closeActionForm
                            }
                            type="button"
                          >
                            Cancel
                          </button>

                          <button
                            disabled={
                              actionLoading ||
                              !actionTask
                                .trim()
                            }
                            type="submit"
                          >
                            {actionLoading
                              ? "Saving..."
                              : editingAction
                                ? "Save changes"
                                : "Add action"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {activeTab ===
                "chapters" && (
                <div className="chapter-content">
                  <div className="tab-section-heading">
                    <div>
                      <h2>
                        Meeting chapters
                      </h2>

                      <p>
                        Navigate the
                        conversation by
                        topic and
                        timestamp.
                      </p>
                    </div>
                  </div>

                  <div className="chapter-list">
                    {meeting
                      .chapters
                      .map(
                        (
                          chapter,
                          index,
                        ) => (
                          <button
                            key={
                              chapter.id
                            }
                            onClick={() =>
                              setCurrentTime(
                                chapter
                                  .start_time,
                              )
                            }
                          >
                            <span className="chapter-number">
                              {String(
                                index +
                                  1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>

                            <div>
                              <strong>
                                {
                                  chapter.title
                                }
                              </strong>

                              <p>
                                {chapter.summary ??
                                  "Open this chapter to review the relevant section of the conversation."}
                              </p>
                            </div>

                            <span className="chapter-time">
                              <Play
                                size={
                                  11
                                }
                                fill="currentColor"
                              />

                              {formatTime(
                                chapter
                                  .start_time,
                              )}
                            </span>
                          </button>
                        ),
                      )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="detail-side-panel">
            <section
              className="side-card ask-meetmind-card"
              id="ask-meetmind"
            >
              <div className="side-card-heading">
                <div>
                  <Sparkles
                    size={16}
                  />

                  <h3>
                    Ask MeetMind
                  </h3>
                </div>

                <span>
                  AI
                </span>
              </div>

              <p>
                Ask questions about
                this meeting and get
                answers grounded in
                the transcript.
              </p>

              <form
                className="ask-form"
                onSubmit={
                  handleAskSubmit
                }
              >
                <div className="ai-question-box">
                  <input
                    aria-label="Ask MeetMind a question"
                    disabled={
                      askLoading
                    }
                    onChange={(
                      event,
                    ) =>
                      setAskQuestion(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Ask about this meeting..."
                    value={
                      askQuestion
                    }
                  />

                  <button
                    aria-label="Submit question"
                    disabled={
                      askLoading ||
                      !askQuestion
                        .trim()
                    }
                    type="submit"
                  >
                    {askLoading ? (
                      <LoaderCircle
                        className="ask-spinner"
                        size={15}
                      />
                    ) : (
                      <Sparkles
                        size={15}
                      />
                    )}
                  </button>
                </div>
              </form>

              <div className="suggested-questions">
                <button
                  disabled={
                    askLoading
                  }
                  onClick={() =>
                    submitQuestion(
                      "What decisions were made?",
                    )
                  }
                  type="button"
                >
                  What decisions
                  were made?
                </button>

                <button
                  disabled={
                    askLoading
                  }
                  onClick={() =>
                    submitQuestion(
                      "What are the next steps?",
                    )
                  }
                  type="button"
                >
                  What are the next
                  steps?
                </button>

                <button
                  disabled={
                    askLoading
                  }
                  onClick={() =>
                    submitQuestion(
                      "Summarize customer concerns",
                    )
                  }
                  type="button"
                >
                  Summarize customer
                  concerns
                </button>
              </div>

              {askLoading && (
                <div className="ask-loading-message">
                  <LoaderCircle
                    className="ask-spinner"
                    size={17}
                  />

                  <span>
                    MeetMind is
                    analyzing the
                    transcript...
                  </span>
                </div>
              )}

              {askError && (
                <div
                  className="ask-error-message"
                  role="alert"
                >
                  {askError}
                </div>
              )}

              {askAnswer && (
                <div className="ask-answer-container">
                  <div className="ask-answer-heading">
                    <Sparkles
                      size={16}
                    />

                    <strong>
                      MeetMind answer
                    </strong>
                  </div>

                  <div className="ask-answer-text">
                    {askAnswer
                      .split("\n")
                      .map(
                        (
                          line,
                          index,
                        ) =>
                          line.trim() ? (
                            <p
                              key={
                                index
                              }
                            >
                              {line}
                            </p>
                          ) : (
                            <br
                              key={
                                index
                              }
                            />
                          ),
                      )}
                  </div>
                </div>
              )}
            </section>

            <section className="side-card">
              <div className="side-card-heading">
                <div>
                  <Users
                    size={16}
                  />

                  <h3>
                    Participants
                  </h3>
                </div>

                <span>
                  {
                    displayedMeeting
                      .participants
                      .length
                  }
                </span>
              </div>

              <div className="participant-list">
                {displayedMeeting
                  .participants
                  .map(
                    (
                      participant,
                    ) => (
                      <div
                        key={
                          participant.id
                        }
                      >
                        <div className="side-participant-avatar">
                          {getInitials(
                            participant.name,
                          )}
                        </div>

                        <div>
                          <strong>
                            {
                              participant.name
                            }
                          </strong>

                          <span>
                            {participant.email ??
                              "Meeting participant"}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </section>

            {meeting.soundbites
              .length >
              0 && (
              <section className="side-card">
                <div className="side-card-heading">
                  <div>
                    <Play
                      size={
                        16
                      }
                    />

                    <h3>
                      Soundbites
                    </h3>
                  </div>

                  <span>
                    {
                      meeting
                        .soundbites
                        .length
                    }
                  </span>
                </div>

                <div className="soundbite-list">
                  {meeting.soundbites
                    .map(
                      (
                        soundbite,
                      ) => (
                        <button
                          key={
                            soundbite.id
                          }
                          onClick={() =>
                            setCurrentTime(
                              soundbite
                                .start_time,
                            )
                          }
                        >
                          <span>
                            <Play
                              size={
                                12
                              }
                              fill="currentColor"
                            />
                          </span>

                          <div>
                            <strong>
                              {
                                soundbite.title
                              }
                            </strong>

                            <small>
                              {formatTime(
                                soundbite
                                  .start_time,
                              )}{" "}
                              –{" "}
                              {formatTime(
                                soundbite
                                  .end_time,
                              )}
                            </small>
                          </div>
                        </button>
                      ),
                    )}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>

      {isEditingMeeting && (
        <div
          style={{
            position:
              "fixed",

            inset:
              0,

            zIndex:
              1200,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            overflowY:
              "auto",

            padding:
              "24px",

            background:
              "rgba(5, 5, 14, 0.78)",

            backdropFilter:
              "blur(9px)",
          }}
        >
          <form
            onSubmit={
              saveMeetingChanges
            }

            style={{
              width:
                "min(620px, 100%)",

              maxHeight:
                "90vh",

              overflowY:
                "auto",

              border:
                "1px solid rgba(160, 110, 255, 0.3)",

              borderRadius:
                "20px",

              background:
                "#12121f",

              boxShadow:
                "0 30px 90px rgba(0, 0, 0, 0.6)",

              padding:
                "28px",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap:
                  "20px",

                marginBottom:
                  "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin:
                      0,
                  }}
                >
                  Edit meeting
                </h2>

                <p
                  style={{
                    margin:
                      "7px 0 0",

                    color:
                      "#8e899e",

                    fontSize:
                      "13px",
                  }}
                >
                  Update the title
                  and participants.
                </p>
              </div>


              <button
                disabled={
                  editMeetingLoading
                }

                onClick={
                  closeEditMeeting
                }

                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#aaa5b8",

                  cursor:
                    "pointer",
                }}

                type="button"
              >
                <X
                  size={
                    21
                  }
                />
              </button>
            </div>


            <label
              style={{
                display:
                  "block",

                marginBottom:
                  "25px",
              }}
            >
              <span>
                Meeting title
              </span>


              <input
                autoFocus

                disabled={
                  editMeetingLoading
                }

                maxLength={
                  255
                }

                onChange={(
                  event,
                ) =>
                  setEditMeetingTitle(
                    event
                      .target
                      .value,
                  )
                }

                required

                style={{
                  boxSizing:
                    "border-box",

                  width:
                    "100%",

                  marginTop:
                    "9px",

                  border:
                    "1px solid rgba(255, 255, 255, 0.13)",

                  borderRadius:
                    "11px",

                  outline:
                    "none",

                  background:
                    "#191925",

                  color:
                    "#f2eff8",

                  padding:
                    "13px",

                  font:
                    "inherit",
                }}

                value={
                  editMeetingTitle
                }
              />
            </label>


            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                marginBottom:
                  "13px",
              }}
            >
              <strong>
                Participants
              </strong>


              <button
                disabled={
                  editMeetingLoading
                }

                onClick={
                  addMeetingParticipant
                }

                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "6px",

                  border:
                    "1px solid rgba(157, 102, 255, 0.4)",

                  borderRadius:
                    "9px",

                  background:
                    "rgba(125, 74, 220, 0.14)",

                  color:
                    "#c9a9ff",

                  cursor:
                    "pointer",

                  padding:
                    "8px 11px",
                }}

                type="button"
              >
                <Plus
                  size={
                    15
                  }
                />

                Add participant
              </button>
            </div>


            <div
              style={{
                display:
                  "grid",

                gap:
                  "12px",
              }}
            >
              {editParticipants
                .map(
                  (
                    participant,
                    index,
                  ) => (
                    <div
                      key={
                        index
                      }

                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "1fr 1fr auto",

                        alignItems:
                          "center",

                        gap:
                          "10px",
                      }}
                    >
                      <input
                        disabled={
                          editMeetingLoading
                        }

                        onChange={(
                          event,
                        ) =>
                          updateMeetingParticipant(
                            index,

                            "name",

                            event
                              .target
                              .value,
                          )
                        }

                        placeholder="Participant name"

                        required

                        style={{
                          minWidth:
                            0,

                          border:
                            "1px solid rgba(255, 255, 255, 0.12)",

                          borderRadius:
                            "10px",

                          outline:
                            "none",

                          background:
                            "#191925",

                          color:
                            "#f2eff8",

                          padding:
                            "12px",

                          font:
                            "inherit",
                        }}

                        value={
                          participant
                            .name
                        }
                      />


                      <input
                        disabled={
                          editMeetingLoading
                        }

                        onChange={(
                          event,
                        ) =>
                          updateMeetingParticipant(
                            index,

                            "email",

                            event
                              .target
                              .value,
                          )
                        }

                        placeholder="Email (optional)"

                        type="email"

                        style={{
                          minWidth:
                            0,

                          border:
                            "1px solid rgba(255, 255, 255, 0.12)",

                          borderRadius:
                            "10px",

                          outline:
                            "none",

                          background:
                            "#191925",

                          color:
                            "#f2eff8",

                          padding:
                            "12px",

                          font:
                            "inherit",
                        }}

                        value={
                          participant
                            .email
                        }
                      />


                      <button
                        aria-label="Remove participant"

                        disabled={
                          editMeetingLoading
                        }

                        onClick={() =>
                          removeMeetingParticipant(
                            index,
                          )
                        }

                        style={{
                          display:
                            "grid",

                          width:
                            "42px",

                          height:
                            "42px",

                          placeItems:
                            "center",

                          border:
                            "1px solid rgba(255, 100, 120, 0.2)",

                          borderRadius:
                            "10px",

                          background:
                            "rgba(255, 90, 110, 0.08)",

                          color:
                            "#ff8192",

                          cursor:
                            "pointer",
                        }}

                        type="button"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  ),
                )}
            </div>


            {editMeetingError && (
              <div
                className="ask-error-message"

                role="alert"

                style={{
                  marginTop:
                    "18px",
                }}
              >
                {
                  editMeetingError
                }
              </div>
            )}


            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "flex-end",

                gap:
                  "11px",

                marginTop:
                  "27px",
              }}
            >
              <button
                disabled={
                  editMeetingLoading
                }

                onClick={
                  closeEditMeeting
                }

                style={{
                  border:
                    "1px solid rgba(255, 255, 255, 0.12)",

                  borderRadius:
                    "10px",

                  background:
                    "transparent",

                  color:
                    "#b8b3c4",

                  cursor:
                    "pointer",

                  padding:
                    "11px 18px",
                }}

                type="button"
              >
                Cancel
              </button>


              <button
                disabled={
                  editMeetingLoading
                }

                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "8px",

                  border:
                    "none",

                  borderRadius:
                    "10px",

                  background:
                    "#8057df",

                  color:
                    "white",

                  cursor:
                    editMeetingLoading
                      ? "not-allowed"
                      : "pointer",

                  padding:
                    "11px 18px",

                  fontWeight:
                    700,
                }}

                type="submit"
              >
                {editMeetingLoading ? (
                  <>
                    <LoaderCircle
                      className="spin"

                      size={
                        16
                      }
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Check
                      size={
                        16
                      }
                    />

                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
