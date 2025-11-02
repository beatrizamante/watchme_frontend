import Person from "../../../../app/interfaces/person";

export interface FindPersonInVideoResponse {
  person: Person;
  video: {
    id: number;
    path: string;
  };
  matches: any[];
}
