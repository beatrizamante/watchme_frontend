enum JobStatus {
  WAITING = "waiting",
  ACTIVATE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  DELAYED = "delayed",
}

export interface FindPersonInVideoResponse {
  message: string;
  jobId: string;
  status: JobStatus;
  estimatedTime: string;
}

interface Match {
  bbox: Array<{ x: number; y: number; w: number; h: number }>;
  distance: number;
  confidence: number;
  frame_number: number;
  timestamp: number;
  time_formatted: string;
}

export interface FindPersonInVideoJobResponse {
  jobId: string;
  progress: number;
  status: JobStatus;
  createdAt: number;
  result: {
    person: { id: number; name: string };
    video: { id: number; path: string };
    matches: Match[];
  };
}
