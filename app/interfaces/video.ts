export default interface Video {
  id: string;
  user_id: string;
  path: string;
  duration: number;
}

export type VideoWithoutId = Omit<Video, "id">;
