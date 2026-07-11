import {
  ActionItem,
  Meeting,
  MeetingDetail,
} from "./types";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


interface MeetingFilters {
  search?: string;

  participant?: string;

  topic?: string;

  sortOrder?:
    | "asc"
    | "desc";
}


interface AskMeetingResponse {
  answer: string;
}


interface ValidationError {
  loc?: Array<
    string | number
  >;

  msg?: string;

  type?: string;
}


interface APIErrorResponse {
  detail?:
    | string
    | ValidationError[]
    | Record<
        string,
        unknown
      >;
}


/*
========================================
FORMAT API ERRORS
========================================
*/


function getErrorMessage(
  responseData:
    | APIErrorResponse
    | null,

  fallbackMessage: string,
): string {
  if (
    !responseData ||
    responseData.detail ===
      undefined ||
    responseData.detail ===
      null
  ) {
    return fallbackMessage;
  }


  const detail =
    responseData.detail;


  if (
    typeof detail ===
    "string"
  ) {
    return detail;
  }


  if (
    Array.isArray(
      detail,
    )
  ) {
    const messages =
      detail
        .map(
          (
            error,
          ) => {
            if (
              typeof error ===
              "string"
            ) {
              return error;
            }


            const field =
              error.loc
                ?.filter(
                  (
                    location,
                  ) =>
                    location !==
                    "body",
                )
                .join(
                  " → ",
                );


            const message =
              error.msg ??
              "Invalid value";


            if (
              field
            ) {
              return (
                `${field}: ${message}`
              );
            }


            return message;
          },
        )
        .filter(
          Boolean,
        );


    if (
      messages.length >
      0
    ) {
      return messages.join(
        "\n",
      );
    }


    return fallbackMessage;
  }


  if (
    typeof detail ===
    "object"
  ) {
    try {
      return JSON.stringify(
        detail,
      );
    }

    catch {
      return fallbackMessage;
    }
  }


  return fallbackMessage;
}


/*
========================================
GET ALL MEETINGS
========================================
*/


export async function getMeetings(
  filters:
    MeetingFilters = {},
): Promise<Meeting[]> {
  const params =
    new URLSearchParams();


  if (
    filters.search
      ?.trim()
  ) {
    params.set(
      "search",

      filters.search
        .trim(),
    );
  }


  if (
    filters.participant
      ?.trim()
  ) {
    params.set(
      "participant",

      filters.participant
        .trim(),
    );
  }


  if (
    filters.topic
      ?.trim()
  ) {
    params.set(
      "topic",

      filters.topic
        .trim(),
    );
  }


  params.set(
    "sort_order",

    filters.sortOrder ??
      "desc",
  );


  const response =
    await fetch(
      `${API_URL}/meetings?${params.toString()}`,

      {
        cache:
          "no-store",
      },
    );


  if (
    !response.ok
  ) {
    throw new Error(
      "Unable to load meetings from the API.",
    );
  }


  return response.json();
}


/*
========================================
GET ONE MEETING
========================================
*/


export async function getMeeting(
  meetingId:
    | string
    | number,
): Promise<MeetingDetail> {
  const response =
    await fetch(
      `${API_URL}/meetings/${meetingId}`,

      {
        cache:
          "no-store",
      },
    );


  if (
    !response.ok
  ) {
    if (
      response.status ===
      404
    ) {
      throw new Error(
        "This meeting could not be found.",
      );
    }


    throw new Error(
      "Unable to load this meeting.",
    );
  }


  return response.json();
}


/*
========================================
CREATE MEETING
========================================
*/


export interface CreateMeetingPayload {
  title: string;

  meeting_date: string;

  duration_seconds:
    number;

  audio_url:
    string | null;

  transcript: string;

  participants: {
    name: string;

    email:
      string | null;

    avatar_url?:
      string | null;

    avatar_color?:
      string | null;
  }[];
}


export async function createMeeting(
  meetingData:
    CreateMeetingPayload,
): Promise<MeetingDetail> {
  const response =
    await fetch(
      `${API_URL}/meetings`,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            meetingData,
          ),
      },
    );


  let responseData:
    | MeetingDetail
    | APIErrorResponse
    | null = null;


  try {
    responseData =
      await response
        .json();
  }

  catch {
    responseData =
      null;
  }


  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        responseData as
          APIErrorResponse,

        "Unable to create the meeting.",
      ),
    );
  }


  return (
    responseData as
      MeetingDetail
  );
}


/*
========================================
ASK MEETMIND
========================================
*/


export async function askMeeting(
  meetingId:
    | string
    | number,

  question:
    string,
): Promise<string> {
  const cleanedQuestion =
    question.trim();


  if (
    !cleanedQuestion
  ) {
    throw new Error(
      "Please enter a question.",
    );
  }


  const response =
    await fetch(
      `${API_URL}/meetings/${meetingId}/ask`,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            {
              question:
                cleanedQuestion,
            },
          ),
      },
    );


  let responseData:
    | AskMeetingResponse
    | APIErrorResponse
    | null = null;


  try {
    responseData =
      await response
        .json();
  }

  catch {
    responseData =
      null;
  }


  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        responseData as
          APIErrorResponse,

        "MeetMind could not answer the question.",
      ),
    );
  }


  if (
    !responseData ||

    !(
      "answer" in
      responseData
    ) ||

    !responseData.answer
  ) {
    throw new Error(
      "MeetMind returned an empty answer.",
    );
  }


  return (
    responseData.answer
  );
}


/*
========================================
DELETE MEETING
========================================
*/


export async function deleteMeeting(
  meetingId:
    | string
    | number,
): Promise<void> {
  const response =
    await fetch(
      `${API_URL}/meetings/${meetingId}`,

      {
        method:
          "DELETE",
      },
    );


  if (
    response.ok
  ) {
    return;
  }


  let responseData:
    | APIErrorResponse
    | null = null;


  try {
    responseData =
      await response.json();
  }

  catch {
    responseData =
      null;
  }


  throw new Error(
    getErrorMessage(
      responseData,

      "Unable to delete the meeting.",
    ),
  );
}


/*
========================================
ACTION ITEM TYPES
========================================
*/


export interface ActionItemPayload {
  task: string;

  assignee?:
    string | null;

  due_date?:
    string | null;
}


export interface ActionItemUpdatePayload {
  task?:
    string;

  assignee?:
    string | null;

  due_date?:
    string | null;

  completed?:
    boolean;
}


/*
========================================
CREATE ACTION ITEM
========================================
*/


export async function createActionItem(
  meetingId:
    | string
    | number,

  actionItem:
    ActionItemPayload,
): Promise<ActionItem> {
  const response =
    await fetch(
      `${API_URL}/meetings/${meetingId}/action-items`,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            actionItem,
          ),
      },
    );


  let responseData:
    | ActionItem
    | APIErrorResponse
    | null = null;


  try {
    responseData =
      await response.json();
  }

  catch {
    responseData =
      null;
  }


  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        responseData as
          APIErrorResponse,

        "Unable to add the action item.",
      ),
    );
  }


  return (
    responseData as
      ActionItem
  );
}


/*
========================================
UPDATE ACTION ITEM
========================================
*/


export async function updateActionItem(
  actionItemId:
    number,

  updates:
    ActionItemUpdatePayload,
): Promise<ActionItem> {
  const response =
    await fetch(
      `${API_URL}/meetings/action-items/${actionItemId}`,

      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            updates,
          ),
      },
    );


  let responseData:
    | ActionItem
    | APIErrorResponse
    | null = null;


  try {
    responseData =
      await response.json();
  }

  catch {
    responseData =
      null;
  }


  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        responseData as
          APIErrorResponse,

        "Unable to update the action item.",
      ),
    );
  }


  return (
    responseData as
      ActionItem
  );
}


/*
========================================
DELETE ACTION ITEM
========================================
*/


export async function deleteActionItem(
  actionItemId:
    number,
): Promise<void> {
  const response =
    await fetch(
      `${API_URL}/meetings/action-items/${actionItemId}`,

      {
        method:
          "DELETE",
      },
    );


  if (
    response.ok
  ) {
    return;
  }


  let responseData:
    | APIErrorResponse
    | null = null;


  try {
    responseData =
      await response.json();
  }

  catch {
    responseData =
      null;
  }


  throw new Error(
    getErrorMessage(
      responseData,

      "Unable to delete the action item.",
    ),
  );
}


/*
========================================
UPDATE MEETING METADATA
========================================
*/


export interface UpdateMeetingPayload {
  title: string;

  participants: {
    name: string;

    email:
      string | null;

    avatar_url?:
      string | null;

    avatar_color?:
      string | null;
  }[];
}


export async function updateMeeting(
  meetingId:
    | string
    | number,

  meetingData:
    UpdateMeetingPayload,
): Promise<MeetingDetail> {
  const response =
    await fetch(
      `${API_URL}/meetings/${meetingId}`,

      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            meetingData,
          ),
      },
    );


  let responseData:
    | MeetingDetail
    | APIErrorResponse
    | null = null;


  try {
    responseData =
      await response.json();
  }

  catch {
    responseData =
      null;
  }


  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        responseData as
          APIErrorResponse,

        "Unable to update the meeting.",
      ),
    );
  }


  if (
    !responseData ||

    !(
      "id" in
      responseData
    )
  ) {
    throw new Error(
      "The API returned an invalid meeting response.",
    );
  }


  return (
    responseData as
      MeetingDetail
  );
}