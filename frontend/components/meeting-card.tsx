"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  deleteMeeting,
} from "@/lib/api";

import {
  Meeting,
} from "@/lib/types";


interface MeetingCardProps {
  meeting: Meeting;
}


/*
========================================
FORMAT MEETING DURATION
========================================
*/

function formatDuration(
  durationSeconds: number,
) {
  const minutes =
    Math.round(
      durationSeconds / 60,
    );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (
    remainingMinutes === 0
  ) {
    return `${hours}h`;
  }

  return (
    `${hours}h ` +
    `${remainingMinutes}m`
  );
}


/*
========================================
FORMAT MEETING DATE
========================================
*/

function formatMeetingDate(
  dateValue: string,
) {
  return (
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",

        day: "numeric",

        year: "numeric",
      },
    )
    .format(
      new Date(
        dateValue,
      ),
    )
  );
}


/*
========================================
MEETING CARD
========================================
*/

export function MeetingCard({
  meeting,
}: MeetingCardProps) {
  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(
    false,
  );


  const [
    isDeleting,
    setIsDeleting,
  ] = useState(
    false,
  );


  const [
    deleteError,
    setDeleteError,
  ] = useState(
    "",
  );


  /*
  ========================================
  OPEN DELETE MODAL
  ========================================
  */

  function openDeleteModal() {
    setDeleteError(
      "",
    );

    setShowDeleteModal(
      true,
    );
  }


  /*
  ========================================
  CLOSE DELETE MODAL
  ========================================
  */

  function closeDeleteModal() {
    if (
      isDeleting
    ) {
      return;
    }

    setDeleteError(
      "",
    );

    setShowDeleteModal(
      false,
    );
  }


  /*
  ========================================
  DELETE MEETING
  ========================================
  */

  async function handleDeleteMeeting() {
    if (
      isDeleting
    ) {
      return;
    }


    try {
      setIsDeleting(
        true,
      );

      setDeleteError(
        "",
      );


      await deleteMeeting(
        meeting.id,
      );


      /*
      Reload dashboard after
      successful deletion.
      */

      window.location.reload();
    }

    catch (
      error
    ) {
      console.error(
        "DELETE MEETING ERROR:",
        error,
      );


      setDeleteError(
        error instanceof Error

          ? error.message

          : (
              "Unable to delete " +
              "the meeting."
            ),
      );


      setIsDeleting(
        false,
      );
    }
  }


  return (
    <>
      <article
        className="meeting-card"
      >
        <div
          className="meeting-card-glow"
        />


        {/* =================================
            MEETING CARD HEADER
        ================================= */}

        <div
          className="meeting-card-header"
        >
          <div
            className="meeting-icon"
          >
            <MessageSquareText
              size={21}
            />
          </div>


          <button
            aria-label={
              "Delete meeting"
            }
            className={
              "icon-button"
            }
            onClick={
              openDeleteModal
            }
            type="button"
          >
            <MoreHorizontal
              size={20}
            />
          </button>
        </div>


        {/* =================================
            MEETING INFORMATION
        ================================= */}

        <div
          className="meeting-card-content"
        >
          <div
            className="meeting-date"
          >
            <CalendarDays
              size={14}
            />


            <span>
              {
                formatMeetingDate(
                  meeting
                    .meeting_date,
                )
              }
            </span>


            <span
              className={
                "metadata-dot"
              }
            />


            <Clock3
              size={14}
            />


            <span>
              {
                formatDuration(
                  meeting
                    .duration_seconds,
                )
              }
            </span>
          </div>


          <h3>
            {
              meeting.title
            }
          </h3>


          <p
            className={
              "meeting-summary"
            }
          >
            {
              meeting.summary
              ??
              (
                "Meeting insights " +
                "and transcript are " +
                "ready to review."
              )
            }
          </p>


          {/* =================================
              MEETING TOPICS
          ================================= */}

          <div
            className={
              "topic-list"
            }
          >
            {
              meeting
                .topics
                .slice(
                  0,
                  3,
                )
                .map(
                  (
                    topic,
                  ) => (
                    <span
                      className={
                        "topic-pill"
                      }
                      key={
                        topic.id
                      }
                    >
                      <Sparkles
                        size={11}
                      />

                      {
                        topic.name
                      }
                    </span>
                  ),
                )
            }
          </div>
        </div>


        {/* =================================
            MEETING CARD FOOTER
        ================================= */}

        <div
          className={
            "meeting-card-footer"
          }
        >
          <Link
            className={
              "open-meeting-button"
            }
            href={
              `/meetings/${
                meeting.id
              }`
            }
          >
            <span>
              Open meeting
            </span>

            <ArrowUpRight
              size={16}
            />
          </Link>
        </div>


        {/* =================================
            QUICK PLAY BUTTON
        ================================= */}

        <button
          aria-label={
            "Play meeting"
          }
          className={
            "quick-play-button"
          }
          type="button"
        >
          <Play
            fill={
              "currentColor"
            }
            size={14}
          />
        </button>
      </article>


      {/* =================================
          DELETE CONFIRMATION MODAL
      ================================= */}

      {
        showDeleteModal
        &&
        (
          <div
            onClick={
              closeDeleteModal
            }
            style={{
              position:
                "fixed",

              inset:
                0,

              zIndex:
                999999,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding:
                "24px",

              background:
                (
                  "rgba(" +
                  "0, 0, 0, " +
                  "0.78)"
                ),

              backdropFilter:
                "blur(8px)",
            }}
          >
            <div
              onClick={
                (
                  event,
                ) => {
                  event
                    .stopPropagation();
                }
              }
              style={{
                position:
                  "relative",

                width:
                  "100%",

                maxWidth:
                  "480px",

                padding:
                  "32px",

                border:
                  (
                    "1px solid " +
                    "rgba(" +
                    "255, 255, " +
                    "255, 0.12)"
                  ),

                borderRadius:
                  "20px",

                background:
                  "#12111d",

                boxShadow:
                  (
                    "0 35px " +
                    "100px " +
                    "rgba(" +
                    "0, 0, 0, " +
                    "0.75)"
                  ),
              }}
            >

              {/* CLOSE BUTTON */}

              <button
                aria-label={
                  "Close delete modal"
                }
                disabled={
                  isDeleting
                }
                onClick={
                  closeDeleteModal
                }
                style={{
                  position:
                    "absolute",

                  top:
                    "18px",

                  right:
                    "18px",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  width:
                    "36px",

                  height:
                    "36px",

                  padding:
                    0,

                  border:
                    "none",

                  borderRadius:
                    "8px",

                  color:
                    "#aaa5b8",

                  background:
                    "transparent",

                  cursor:
                    isDeleting

                      ? "not-allowed"

                      : "pointer",
                }}
                type="button"
              >
                <X
                  size={20}
                />
              </button>


              {/* DELETE ICON */}

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  width:
                    "54px",

                  height:
                    "54px",

                  marginBottom:
                    "21px",

                  borderRadius:
                    "15px",

                  color:
                    "#ff7188",

                  background:
                    (
                      "rgba(" +
                      "255, 82, " +
                      "111, 0.13)"
                    ),
                }}
              >
                <Trash2
                  size={26}
                />
              </div>


              {/* TITLE */}

              <h2
                style={{
                  margin:
                    "0 0 12px",

                  color:
                    "#f8f6ff",

                  fontSize:
                    "26px",

                  fontWeight:
                    700,
                }}
              >
                Delete meeting?
              </h2>


              {/* DESCRIPTION */}

              <p
                style={{
                  margin:
                    0,

                  color:
                    "#aaa6b7",

                  fontSize:
                    "15px",

                  lineHeight:
                    1.7,
                }}
              >
                You are about to
                permanently delete{" "}

                <strong
                  style={{
                    color:
                      "#f1eef8",
                  }}
                >
                  {
                    meeting.title
                  }
                </strong>

                . This action cannot
                be undone.
              </p>


              {/* ERROR MESSAGE */}

              {
                deleteError
                &&
                (
                  <div
                    style={{
                      marginTop:
                        "19px",

                      padding:
                        "13px",

                      border:
                        (
                          "1px solid " +
                          "rgba(" +
                          "255, 90, " +
                          "115, 0.3)"
                        ),

                      borderRadius:
                        "10px",

                      color:
                        "#ff91a2",

                      background:
                        (
                          "rgba(" +
                          "255, 75, " +
                          "100, 0.08)"
                        ),

                      fontSize:
                        "14px",

                      lineHeight:
                        1.5,
                    }}
                  >
                    {
                      deleteError
                    }
                  </div>
                )
              }


              {/* MODAL ACTIONS */}

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "flex-end",

                  gap:
                    "12px",

                  marginTop:
                    "30px",
                }}
              >

                {/* CANCEL */}

                <button
                  disabled={
                    isDeleting
                  }
                  onClick={
                    closeDeleteModal
                  }
                  style={{
                    padding:
                      "12px 21px",

                    border:
                      (
                        "1px solid " +
                        "rgba(" +
                        "255, 255, " +
                        "255, 0.12)"
                      ),

                    borderRadius:
                      "10px",

                    color:
                      "#d4d0dc",

                    background:
                      "transparent",

                    cursor:
                      isDeleting

                        ? "not-allowed"

                        : "pointer",

                    font:
                      "inherit",

                    fontWeight:
                      600,

                    opacity:
                      isDeleting

                        ? 0.6

                        : 1,
                  }}
                  type="button"
                >
                  Cancel
                </button>


                {/* DELETE */}

                <button
                  disabled={
                    isDeleting
                  }
                  onClick={
                    handleDeleteMeeting
                  }
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    gap:
                      "8px",

                    minWidth:
                      "168px",

                    padding:
                      "12px 21px",

                    border:
                      "none",

                    borderRadius:
                      "10px",

                    color:
                      "#ffffff",

                    background:
                      "#e94f69",

                    cursor:
                      isDeleting

                        ? "not-allowed"

                        : "pointer",

                    font:
                      "inherit",

                    fontWeight:
                      700,

                    opacity:
                      isDeleting

                        ? 0.65

                        : 1,
                  }}
                  type="button"
                >
                  <Trash2
                    size={17}
                  />

                  {
                    isDeleting

                      ? "Deleting..."

                      : "Delete meeting"
                  }
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}