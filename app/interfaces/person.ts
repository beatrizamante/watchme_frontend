export default interface Person {
  id: string;
  user_id: string;
  name: string;
  embedding: Buffer;
}

export type PersonWithoutId = Omit<Person, "id" | "embedding">;
