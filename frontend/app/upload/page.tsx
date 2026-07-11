"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  FileJson,
  FileText,
  LoaderCircle,
  Plus,
  Sparkles,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  createMeeting,
} from "@/lib/api";


interface ParticipantForm {
  id: number;
  name: string;
  email: string;
}


const allowedExtensions = [
  "txt",
  "vtt",
  "json",
];


export default function UploadPage() {
  const router =
    useRouter();


  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );


  const [
    title,
    setTitle,
  ] = useState("");


  const [
    meetingDate,
    setMeetingDate,
  ] = useState("");


  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState("");


  const [
    transcript,
    setTranscript,
  ] = useState("");


  const [
    uploadedFile,
    setUploadedFile,
  ] = useState<File | null>(
    null,
  );


  const [
    participants,
    setParticipants,
  ] = useState<
    ParticipantForm[]
  >([
    {
      id: Date.now(),

      name: "",

      email: "",
    },
  ]);


  const [
    dragging,
    setDragging,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  function getFileExtension(
    fileName: string,
  ) {
    return (
      fileName
        .split(".")
        .pop()
        ?.toLowerCase() ??
      ""
    );
  }


  async function processFile(
    file: File,
  ) {
    setError("");


    const extension =
      getFileExtension(
        file.name,
      );


    if (
      !allowedExtensions.includes(
        extension,
      )
    ) {
      setError(
        "Please upload a .txt, .vtt, or .json transcript file.",
      );

      return;
    }


    try {
      const fileText =
        await file.text();


      let transcriptText =
        fileText;


      if (
        extension ===
        "json"
      ) {
        const parsed =
          JSON.parse(
            fileText,
          );


        if (
          typeof parsed ===
          "string"
        ) {
          transcriptText =
            parsed;
        }

        else if (
          typeof (
            parsed
              .transcript
          ) ===
          "string"
        ) {
          transcriptText =
            parsed
              .transcript;
        }

        else if (
          Array.isArray(
            parsed
              .segments,
          )
        ) {
          transcriptText =
            parsed
              .segments
              .map(
                (
                  segment: {
                    speaker?:
                      string;

                    speaker_name?:
                      string;

                    text?:
                      string;
                  },
                ) => {
                  const speaker =
                    segment
                      .speaker_name
                    ??
                    segment
                      .speaker
                    ??
                    "Speaker";


                  return (
                    `${speaker}: ${
                      segment
                        .text
                      ??
                      ""
                    }`
                  );
                },
              )
              .join(
                "\n",
              );
        }

        else {
          throw new Error(
            "The JSON file must contain a transcript string or a segments array.",
          );
        }
      }


      if (
        !transcriptText
          .trim()
      ) {
        throw new Error(
          "The uploaded transcript is empty.",
        );
      }


      setUploadedFile(
        file,
      );


      setTranscript(
        transcriptText
          .trim(),
      );


      if (
        !title.trim()
      ) {
        setTitle(
          file.name.replace(
            /\.[^/.]+$/,
            "",
          ),
        );
      }
    }

    catch (
      fileError
    ) {
      setUploadedFile(
        null,
      );


      setTranscript(
        "",
      );


      setError(
        fileError
          instanceof
          Error

          ? fileError
              .message

          : "Unable to read the transcript file.",
      );
    }
  }


  function handleFileChange(
    event:
      ChangeEvent<
        HTMLInputElement
      >,
  ) {
    const file =
      event
        .target
        .files?.[0];


    if (file) {
      void processFile(
        file,
      );
    }


    event.target.value =
      "";
  }


  function handleDrop(
    event:
      DragEvent<
        HTMLDivElement
      >,
  ) {
    event.preventDefault();


    setDragging(
      false,
    );


    const file =
      event
        .dataTransfer
        .files?.[0];


    if (file) {
      void processFile(
        file,
      );
    }
  }


  function removeFile() {
    setUploadedFile(
      null,
    );


    setTranscript(
      "",
    );


    setError(
      "",
    );
  }


  function addParticipant() {
    setParticipants(
      (
        currentParticipants,
      ) => [
        ...currentParticipants,

        {
          id:
            Date.now()
            +
            Math.random(),

          name:
            "",

          email:
            "",
        },
      ],
    );
  }


  function updateParticipant(
    participantId:
      number,

    field:
      | "name"
      | "email",

    value:
      string,
  ) {
    setParticipants(
      (
        currentParticipants,
      ) =>
        currentParticipants
          .map(
            (
              participant,
            ) =>
              participant
                .id
              ===
              participantId

                ? {
                    ...participant,

                    [field]:
                      value,
                  }

                : participant,
          ),
    );
  }


  function removeParticipant(
    participantId:
      number,
  ) {
    setParticipants(
      (
        currentParticipants,
      ) =>
        currentParticipants
          .filter(
            (
              participant,
            ) =>
              participant
                .id
              !==
              participantId,
          ),
    );
  }


  async function handleSubmit(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ) {
    event.preventDefault();


    setError(
      "",
    );


    if (
      !title.trim()
    ) {
      setError(
        "Please enter a meeting title.",
      );

      return;
    }


    if (
      !meetingDate
    ) {
      setError(
        "Please select the meeting date.",
      );

      return;
    }


    if (
      !transcript
        .trim()
    ) {
      setError(
        "Please upload a transcript file.",
      );

      return;
    }


    /*
    ========================================
    CREATE PARTICIPANT OBJECTS
    ========================================
    */

    const validParticipants =
      participants

        .filter(
          (
            participant,
          ) =>
            participant
              .name
              .trim(),
        )

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
                .trim()
              ||
              null,

            avatar_url:
              null,

            avatar_color:
              "purple",
          }),
        );


    /*
    ========================================
    CREATE JSON REQUEST
    ========================================
    */

    const meetingData = {
      title:
        title.trim(),


      meeting_date:
        new Date(
          meetingDate,
        ).toISOString(),


      duration_seconds:
        Math.max(
          0,

          Number(
            durationMinutes,
          )
          ||
          0,
        )
        *
        60,


      audio_url:
        null,


      transcript:
        transcript
          .trim(),


      participants:
        validParticipants,
    };


    try {
      setLoading(
        true,
      );


      const createdMeeting =
        await createMeeting(
          meetingData,
        );


      router.push(
        `/meetings/${
          createdMeeting.id
        }`,
      );
    }

    catch (
      requestError
    ) {
      console.error(
        "Meeting upload failed:",
        requestError,
      );


      setError(
        requestError
          instanceof
          Error

          ? requestError
              .message

          : "Unable to create the meeting.",
      );
    }

    finally {
      setLoading(
        false,
      );
    }
  }


  return (
    <main className="upload-page">

      <div
        className="
          upload-page-glow
          upload-glow-one
        "
      />


      <div
        className="
          upload-page-glow
          upload-glow-two
        "
      />


      <div className="upload-page-container">

        <Link
          href="/"

          className="upload-back-link"
        >
          <ArrowLeft
            size={17}
          />

          Back to meetings
        </Link>


        <header className="upload-header">

          <div className="upload-header-icon">
            <Sparkles
              size={25}
            />
          </div>


          <div>

            <span>
              MEETING
              INTELLIGENCE
            </span>


            <h1>
              Upload a meeting
            </h1>


            <p>
              Upload an existing
              transcript and
              MeetMind will
              organize it into a
              searchable meeting
              workspace.
            </p>

          </div>

        </header>


        <form
          className="upload-form"

          onSubmit={
            handleSubmit
          }
        >

          {/* MEETING DETAILS */}

          <section className="upload-form-card">

            <div className="upload-card-heading">

              <div className="upload-step-number">
                01
              </div>


              <div>

                <h2>
                  Meeting details
                </h2>


                <p>
                  Add the basic
                  information for
                  this meeting.
                </p>

              </div>

            </div>


            <div className="upload-field-grid">

              <label
                className="
                  upload-field
                  upload-field-wide
                "
              >

                <span>
                  Meeting title
                </span>


                <input
                  type="text"

                  value={
                    title
                  }

                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event
                        .target
                        .value,
                    )
                  }

                  placeholder="
                    e.g. Product strategy
                    and Q3 roadmap
                  "
                />

              </label>


              <label className="upload-field">

                <span>
                  Meeting date
                </span>


                <div className="upload-input-icon">

                  <CalendarDays
                    size={17}
                  />


                  <input
                    type="datetime-local"

                    value={
                      meetingDate
                    }

                    onChange={(
                      event,
                    ) =>
                      setMeetingDate(
                        event
                          .target
                          .value,
                      )
                    }
                  />

                </div>

              </label>


              <label className="upload-field">

                <span>
                  Duration
                </span>


                <div className="duration-input">

                  <input
                    type="number"

                    min="0"

                    value={
                      durationMinutes
                    }

                    onChange={(
                      event,
                    ) =>
                      setDurationMinutes(
                        event
                          .target
                          .value,
                      )
                    }

                    placeholder="42"
                  />


                  <small>
                    minutes
                  </small>

                </div>

              </label>

            </div>

          </section>


          {/* TRANSCRIPT */}

          <section className="upload-form-card">

            <div className="upload-card-heading">

              <div className="upload-step-number">
                02
              </div>


              <div>

                <h2>
                  Meeting
                  transcript
                </h2>


                <p>
                  Upload a TXT,
                  VTT, or JSON
                  transcript.
                </p>

              </div>

            </div>


            {!uploadedFile ? (

              <div
                className={
                  `transcript-dropzone ${
                    dragging
                      ? "dragging"
                      : ""
                  }`
                }

                onDragEnter={(
                  event,
                ) => {
                  event
                    .preventDefault();


                  setDragging(
                    true,
                  );
                }}

                onDragOver={(
                  event,
                ) =>
                  event
                    .preventDefault()
                }

                onDragLeave={() =>
                  setDragging(
                    false,
                  )
                }

                onDrop={
                  handleDrop
                }

                onClick={() =>
                  fileInputRef
                    .current
                    ?.click()
                }
              >

                <input
                  ref={
                    fileInputRef
                  }

                  type="file"

                  accept="
                    .txt,
                    .vtt,
                    .json
                  "

                  onChange={
                    handleFileChange
                  }

                  hidden
                />


                <div className="dropzone-icon">

                  <UploadCloud
                    size={29}
                  />

                </div>


                <h3>
                  Drop your
                  transcript here
                </h3>


                <p>
                  or click to
                  browse files
                  from your
                  computer
                </p>


                <div className="accepted-file-types">

                  <span>
                    .TXT
                  </span>


                  <span>
                    .VTT
                  </span>


                  <span>
                    .JSON
                  </span>

                </div>

              </div>

            ) : (

              <div className="uploaded-file-card">

                <div className="uploaded-file-icon">

                  {
                    getFileExtension(
                      uploadedFile
                        .name,
                    )
                    ===
                    "json"

                      ? (
                        <FileJson
                          size={
                            23
                          }
                        />
                      )

                      : (
                        <FileText
                          size={
                            23
                          }
                        />
                      )
                  }

                </div>


                <div className="uploaded-file-info">

                  <strong>
                    {
                      uploadedFile
                        .name
                    }
                  </strong>


                  <span>

                    {
                      (
                        uploadedFile
                          .size
                        /
                        1024
                      )
                      .toFixed(
                        1,
                      )
                    }

                    {" "}

                    KB · Transcript
                    ready

                  </span>

                </div>


                <div className="file-success">

                  <Check
                    size={16}
                  />

                </div>


                <button
                  type="button"

                  className="remove-file-button"

                  onClick={
                    removeFile
                  }

                  aria-label="
                    Remove transcript
                  "
                >

                  <X
                    size={17}
                  />

                </button>

              </div>

            )}


            {
              transcript
              && (

                <div className="transcript-preview">

                  <div>

                    <strong>
                      Transcript
                      preview
                    </strong>


                    <span>

                      {
                        transcript
                          .length
                      }

                      {" "}

                      characters

                    </span>

                  </div>


                  <p>

                    {
                      transcript
                        .slice(
                          0,
                          500,
                        )
                    }


                    {
                      transcript
                        .length
                      >
                      500

                        ? "..."

                        : ""
                    }

                  </p>

                </div>

              )
            }

          </section>


          {/* PARTICIPANTS */}

          <section className="upload-form-card">

            <div
              className="
                upload-card-heading
                upload-participant-heading
              "
            >

              <div className="upload-card-heading-left">

                <div className="upload-step-number">
                  03
                </div>


                <div>

                  <h2>
                    Participants
                  </h2>


                  <p>
                    Add participant
                    information if
                    available.
                  </p>

                </div>

              </div>


              <button
                type="button"

                className="add-participant-button"

                onClick={
                  addParticipant
                }
              >

                <Plus
                  size={16}
                />

                Add participant

              </button>

            </div>


            <div className="participant-form-list">

              {
                participants
                  .map(
                    (
                      participant,
                      index,
                    ) => (

                      <div
                        className="participant-form-row"

                        key={
                          participant
                            .id
                        }
                      >

                        <div className="participant-form-avatar">

                          <UserRound
                            size={
                              18
                            }
                          />

                        </div>


                        <label className="upload-field">

                          <span>
                            Name
                          </span>


                          <input
                            type="text"

                            value={
                              participant
                                .name
                            }

                            onChange={(
                              event,
                            ) =>
                              updateParticipant(
                                participant
                                  .id,

                                "name",

                                event
                                  .target
                                  .value,
                              )
                            }

                            placeholder={
                              `Participant ${
                                index
                                +
                                1
                              }`
                            }
                          />

                        </label>


                        <label className="upload-field">

                          <span>
                            Email
                          </span>


                          <input
                            type="email"

                            value={
                              participant
                                .email
                            }

                            onChange={(
                              event,
                            ) =>
                              updateParticipant(
                                participant
                                  .id,

                                "email",

                                event
                                  .target
                                  .value,
                              )
                            }

                            placeholder="
                              name@example.com
                            "
                          />

                        </label>


                        <button
                          type="button"

                          className="remove-participant-button"

                          onClick={() =>
                            removeParticipant(
                              participant
                                .id,
                            )
                          }

                          aria-label="
                            Remove participant
                          "
                        >

                          <X
                            size={
                              17
                            }
                          />

                        </button>

                      </div>

                    ),
                  )
              }


              {
                participants
                  .length
                ===
                0
                && (

                  <div className="participants-empty">

                    No participants
                    added. This is
                    optional.

                  </div>

                )
              }

            </div>

          </section>


          {
            error
            && (

              <div className="upload-error-message">

                {
                  error
                }

              </div>

            )
          }


          <div className="upload-form-actions">

            <Link
              href="/"

              className="upload-cancel-button"
            >
              Cancel
            </Link>


            <button
              type="submit"

              className="process-meeting-button"

              disabled={
                loading
              }
            >

              {
                loading

                  ? (
                    <>

                      <LoaderCircle
                        className="spinner"

                        size={
                          18
                        }
                      />

                      Processing
                      meeting...

                    </>
                  )

                  : (
                    <>

                      <Sparkles
                        size={
                          18
                        }
                      />

                      Process
                      meeting

                    </>
                  )
              }

            </button>

          </div>

        </form>

      </div>

    </main>
  );
}