export enum Role {
  FAN = "FAN",
  IDOL = "IDOL",
  ADMIN = "ADMIN",
}

export interface BackendResponse<T> {
  message: string;
  data: T;
}

export enum RoomType {
  waitingRoom = "waitingRoom",
  idolRoom = "idolRoom",
}
