export interface Participant {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
}

export interface Topic {
  id: number;
  name: string;
  color: string;
}

export interface TranscriptSegment {
  id: number;
  speaker_name: string;
  speaker_label?: string | null;
  text: string;
  start_time: number;
  end_time: number;
  sentiment?: string | null;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  task: string;
  assignee: string | null;
  due_date: string | null;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface Chapter {
  id: number;
  title: string;
  start_time: number;
  end_time?: number | null;
  summary?: string | null;
}

export interface Soundbite {
  id: number;
  title: string;
  start_time: number;
  end_time: number;
  description?: string | null;
}

export interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  duration_seconds: number;
  audio_url: string | null;
  summary: string | null;
  summary_source: string;
  participants: Participant[];
  topics: Topic[];
  created_at: string;
  updated_at: string;
}

export interface MeetingDetail extends Meeting {
  transcript_segments: TranscriptSegment[];
  action_items: ActionItem[];
  chapters: Chapter[];
  soundbites: Soundbite[];
}