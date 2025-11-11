export default interface Person {
  id: string;
  user_id: string;
  name: string;
  embedding: Buffer;
}

export interface PersonDetection {
  timestamp: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type PersonWithoutId = Omit<Person, "id" | "embedding">;
