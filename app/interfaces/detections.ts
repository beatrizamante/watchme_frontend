export interface Detections {
  person: PersonResponse;
  video: VideoResponse;
  userId: number;
  matches: Match[];
}

export interface Match {
  bbox: [number, number, number, number];
  bbox_format: string;
  coordinate_info: CoordinateInfo;
  distance: number;
  frame_number: number;
  timestamp: number;
  time_formatted: string;
}

interface CoordinateInfo {
  format: string;
  origin: string;
  image_width: number;
  image_height: number;
  yolo_processed_size: string;
}

interface PersonResponse {
  id: number;
  name: string;
}

interface VideoResponse {
  id: number;
  path: string;
}
