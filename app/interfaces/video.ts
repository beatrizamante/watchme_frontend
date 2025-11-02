export default interface Video {
  id: string;
  user_id: string;
  path: string;
}

export type VideoWithoutId = Omit<Video, "id">;
