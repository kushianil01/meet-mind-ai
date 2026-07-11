"use client";

import {
  useParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  LoaderCircle,
} from "lucide-react";

import {
  MeetingDetailView,
} from "@/components/meeting-detail";

import {
  getMeeting,
} from "@/lib/api";

import {
  MeetingDetail,
} from "@/lib/types";

export default function MeetingPage() {
  const params = useParams();

  const meetingId =
    params.id as string;

  const [
    meeting,
    setMeeting,
  ] = useState<MeetingDetail | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    async function loadMeeting() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMeeting(
            meetingId,
          );

        setMeeting(data);
      } catch (
        requestError
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load the meeting.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  if (loading) {
    return (
      <main className="detail-loading-page">
        <LoaderCircle
          className="spinner"
          size={34}
        />

        <h2>
          Preparing meeting intelligence
        </h2>

        <p>
          Loading the transcript,
          summary, chapters, and action
          items.
        </p>
      </main>
    );
  }

  if (
    error ||
    !meeting
  ) {
    return (
      <main className="detail-loading-page">
        <h2>
          Meeting unavailable
        </h2>

        <p>
          {error ||
            "The requested meeting could not be loaded."}
        </p>

        <a href="/">
          Return to meetings
        </a>
      </main>
    );
  }

  return (
    <MeetingDetailView
      meeting={meeting}
    />
  );
}