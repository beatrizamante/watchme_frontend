export default interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
}

export type UserWithoutId = Omit<User, "id">;
