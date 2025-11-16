import { Video } from "expo-av";
import Person from "../../../../app/interfaces/person";

export interface FindPersonInVideoResponse {
  person: Person;
  video: Video;
  matches: any[];
}
