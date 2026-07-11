"use client";

import Link from "next/link";

import {
  ArrowDownUp,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Filter,
  Grid2X2,
  List,
  LoaderCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Video,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { MeetingCard } from "@/components/meeting-card";
import { Sidebar } from "@/components/sidebar";
import { getMeetings } from "@/lib/api";
import { Meeting } from "@/lib/types";

type DurationFilter =
  | "all"
  | "short"
  | "medium"
  | "long";

export default function Home() {
  const [meetings, setMeetings] =
    useState<Meeting[]>([]);

  const [search, setSearch] =
    useState("");

  const [participantFilter, setParticipantFilter] =
    useState("");

  const [topicFilter, setTopicFilter] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("desc");

  const [durationFilter, setDurationFilter] =
    useState<DurationFilter>("all");

  const [showFilters, setShowFilters] =
    useState(false);

  const [
    showMeetingTypeMenu,
    setShowMeetingTypeMenu,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getMeetings({
              search,
              participant:
                participantFilter,
              topic:
                topicFilter,
              sortOrder,
            });

          setMeetings(data);
        } catch {
          setError(
            "We could not connect to the MeetMind API. Make sure the FastAPI server is running.",
          );
        } finally {
          setLoading(false);
        }
      },
      search ||
        participantFilter ||
        topicFilter
        ? 350
        : 0,
    );

    return () =>
      clearTimeout(timer);
  }, [
    search,
    participantFilter,
    topicFilter,
    sortOrder,
  ]);

  const displayedMeetings =
    useMemo(() => {
      if (
        durationFilter === "all"
      ) {
        return meetings;
      }

      return meetings.filter(
        (meeting) => {
          const durationMinutes =
            meeting.duration_seconds /
            60;

          if (
            durationFilter ===
            "short"
          ) {
            return (
              durationMinutes <
              30
            );
          }

          if (
            durationFilter ===
            "medium"
          ) {
            return (
              durationMinutes >=
                30 &&
              durationMinutes <=
                60
            );
          }

          return (
            durationMinutes >
            60
          );
        },
      );
    }, [
      meetings,
      durationFilter,
    ]);

  const totalMinutes = useMemo(
    () =>
      Math.round(
        meetings.reduce(
          (total, meeting) =>
            total +
            meeting.duration_seconds,
          0,
        ) / 60,
      ),
    [meetings],
  );

  const participantCount =
    useMemo(() => {
      const participants =
        new Set<number>();

      meetings.forEach(
        (meeting) => {
          meeting.participants.forEach(
            (participant) => {
              participants.add(
                participant.id,
              );
            },
          );
        },
      );

      return participants.size;
    }, [meetings]);

  const durationFilterLabel =
    useMemo(() => {
      if (
        durationFilter ===
        "short"
      ) {
        return "Short meetings";
      }

      if (
        durationFilter ===
        "medium"
      ) {
        return "Medium meetings";
      }

      if (
        durationFilter ===
        "long"
      ) {
        return "Long meetings";
      }

      return "All meetings";
    }, [durationFilter]);

  const filtersAreActive =
    Boolean(
      participantFilter.trim() ||
      topicFilter.trim(),
    );

  function clearFilters() {
    setParticipantFilter("");
    setTopicFilter("");
    setDurationFilter("all");
  }

  function selectDuration(
    value: DurationFilter,
  ) {
    setDurationFilter(value);

    setShowMeetingTypeMenu(
      false,
    );
  }

  return (
    <main className="application-shell">
      <Sidebar />

      <section className="main-content">
        <header className="topbar">
          <div className="topbar-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search meetings, people, topics, or keywords..."
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            <kbd>⌘ K</kbd>
          </div>

          <div className="topbar-actions">
            <Link
              href="/ask"
              className="ask-ai-button"
            >
              <Sparkles size={16} />

              <span>
                Ask MeetMind
              </span>
            </Link>

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span />
            </button>

            <div className="topbar-avatar">
              KK
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="hero-section">
            <div>
              <div className="eyebrow">
                <span>
                  <Sparkles
                    size={13}
                  />
                </span>

                AI meeting workspace
              </div>

              <h1>
                Your meeting

                <span>
                  {" "}
                  intelligence
                </span>
              </h1>

              <p>
                Search conversations,
                revisit decisions, and
                turn every discussion
                into clear, actionable
                work.
              </p>
            </div>

            <Link
              href="/upload"
              className="primary-button"
            >
              <Plus size={18} />

              <span>
                Add new meeting
              </span>
            </Link>

            <div className="hero-orb hero-orb-one" />

            <div className="hero-orb hero-orb-two" />
          </section>

          <section className="insight-grid">
            <article className="insight-card">
              <div className="insight-icon purple">
                <Video size={19} />
              </div>

              <div>
                <span>
                  Total meetings
                </span>

                <strong>
                  {meetings.length}
                </strong>
              </div>

              <small>
                <CheckCircle2
                  size={13}
                />

                All processed
              </small>
            </article>

            <article className="insight-card">
              <div className="insight-icon blue">
                <CalendarDays
                  size={19}
                />
              </div>

              <div>
                <span>
                  Meeting time
                </span>

                <strong>
                  {totalMinutes}

                  <em>
                    {" "}
                    min
                  </em>
                </strong>
              </div>

              <small>
                This workspace
              </small>
            </article>

            <article className="insight-card">
              <div className="insight-icon pink">
                <Sparkles size={19} />
              </div>

              <div>
                <span>
                  AI summaries
                </span>

                <strong>
                  {meetings.length}
                </strong>
              </div>

              <small>
                Ready to review
              </small>
            </article>

            <article className="insight-card">
              <div className="insight-icon green">
                <Video size={19} />
              </div>

              <div>
                <span>
                  Collaborators
                </span>

                <strong>
                  {participantCount}
                </strong>
              </div>

              <small>
                Across meetings
              </small>
            </article>
          </section>

          <section className="meetings-section">
            <div className="section-heading">
              <div>
                <h2>
                  My meetings
                </h2>

                <p>
                  Review transcripts,
                  summaries, and action
                  items from every
                  conversation.
                </p>
              </div>

              
            </div>

            <div className="filter-toolbar">
              <div className="toolbar-search">
                <Search size={17} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search your meetings"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="filter-dropdown-wrapper">
                <button
                  type="button"
                  className={`filter-button ${
                    showFilters ||
                    filtersAreActive
                      ? "filter-button-active"
                      : ""
                  }`}
                  onClick={() => {
                    setShowFilters(
                      (current) =>
                        !current,
                    );

                    setShowMeetingTypeMenu(
                      false,
                    );
                  }}
                >
                  <Filter
                    size={16}
                  />

                  <span>
                    Filters
                  </span>

                  {filtersAreActive && (
                    <small className="active-filter-dot" />
                  )}

                  <ChevronDown
                    size={14}
                    className={
                      showFilters
                        ? "dropdown-chevron-open"
                        : ""
                    }
                  />
                </button>

                {showFilters && (
                  <div className="meeting-filter-panel">
                    <div className="filter-panel-heading">
                      <div>
                        <strong>
                          Filter meetings
                        </strong>

                        <span>
                          Search by participant
                          or topic.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowFilters(
                            false,
                          )
                        }
                        aria-label="Close filters"
                      >
                        <X
                          size={16}
                        />
                      </button>
                    </div>

                    <label className="meeting-filter-field">
                      <span>
                        Participant
                      </span>

                      <input
                        value={
                          participantFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setParticipantFilter(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Example: Kushi"
                      />
                    </label>

                    <label className="meeting-filter-field">
                      <span>
                        Topic
                      </span>

                      <input
                        value={
                          topicFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setTopicFilter(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Example: Product"
                      />
                    </label>

                    <div className="filter-panel-footer">
                      <button
                        type="button"
                        className="clear-meeting-filters"
                        onClick={
                          clearFilters
                        }
                        disabled={
                          !filtersAreActive &&
                          durationFilter ===
                            "all"
                        }
                      >
                        Clear filters
                      </button>

                      <button
                        type="button"
                        className="close-filter-panel"
                        onClick={() =>
                          setShowFilters(
                            false,
                          )
                        }
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="filter-dropdown-wrapper">
                <button
                  type="button"
                  className={`filter-button ${
                    showMeetingTypeMenu ||
                    durationFilter !==
                      "all"
                      ? "filter-button-active"
                      : ""
                  }`}
                  onClick={() => {
                    setShowMeetingTypeMenu(
                      (current) =>
                        !current,
                    );

                    setShowFilters(
                      false,
                    );
                  }}
                >
                  <SlidersHorizontal
                    size={16}
                  />

                  <span>
                    {
                      durationFilterLabel
                    }
                  </span>

                  <ChevronDown
                    size={14}
                    className={
                      showMeetingTypeMenu
                        ? "dropdown-chevron-open"
                        : ""
                    }
                  />
                </button>

                {showMeetingTypeMenu && (
                  <div className="meeting-type-menu">
                    <button
                      type="button"
                      className={
                        durationFilter ===
                        "all"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        selectDuration(
                          "all",
                        )
                      }
                    >
                      <span>
                        All meetings
                      </span>

                      <small>
                        Show every meeting
                      </small>
                    </button>

                    <button
                      type="button"
                      className={
                        durationFilter ===
                        "short"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        selectDuration(
                          "short",
                        )
                      }
                    >
                      <span>
                        Short meetings
                      </span>

                      <small>
                        Under 30 minutes
                      </small>
                    </button>

                    <button
                      type="button"
                      className={
                        durationFilter ===
                        "medium"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        selectDuration(
                          "medium",
                        )
                      }
                    >
                      <span>
                        Medium meetings
                      </span>

                      <small>
                        30–60 minutes
                      </small>
                    </button>

                    <button
                      type="button"
                      className={
                        durationFilter ===
                        "long"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        selectDuration(
                          "long",
                        )
                      }
                    >
                      <span>
                        Long meetings
                      </span>

                      <small>
                        More than 60 minutes
                      </small>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="filter-button"
                onClick={() =>
                  setSortOrder(
                    (current) =>
                      current ===
                      "desc"
                        ? "asc"
                        : "desc",
                  )
                }
              >
                <ArrowDownUp
                  size={16}
                />

                <span>
                  {sortOrder ===
                  "desc"
                    ? "Newest first"
                    : "Oldest first"}
                </span>
              </button>

              <span className="meeting-result-count">
                {
                  displayedMeetings.length
                }{" "}

                {displayedMeetings
                  .length === 1
                  ? "meeting"
                  : "meetings"}
              </span>
            </div>

            {loading && (
              <div className="state-card">
                <LoaderCircle
                  className="spinner"
                  size={30}
                />

                <h3>
                  Gathering your
                  meetings
                </h3>

                <p>
                  MeetMind is organizing
                  your conversation
                  intelligence.
                </p>
              </div>
            )}

            {!loading &&
              error && (
                <div className="state-card error-state">
                  <div className="state-icon">
                    <Video
                      size={24}
                    />
                  </div>

                  <h3>
                    Unable to load
                    meetings
                  </h3>

                  <p>
                    {error}
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              displayedMeetings
                .length === 0 && (
                <div className="state-card">
                  <div className="state-icon">
                    <Search
                      size={24}
                    />
                  </div>

                  <h3>
                    No meetings found
                  </h3>

                  <p>
                    Try another title,
                    participant, topic,
                    duration, or
                    keyword.
                  </p>

                  {(filtersAreActive ||
                    durationFilter !==
                      "all") && (
                    <button
                      type="button"
                      className="empty-clear-filters"
                      onClick={
                        clearFilters
                      }
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}

            {!loading &&
              !error &&
              displayedMeetings
                .length > 0 && (
                <div className="meeting-grid">
                  {displayedMeetings.map(
                    (meeting) => (
                      <MeetingCard
                        meeting={
                          meeting
                        }
                        key={
                          meeting.id
                        }
                      />
                    ),
                  )}
                </div>
              )}
          </section>
        </div>
      </section>
    </main>
  );
}