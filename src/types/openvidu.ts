import { StreamManager } from "openvidu-browser";

export enum ConnectType {
  "remote" = "remote",
  "local" = "local",
}

export interface UserModel {
  connectionId: string | undefined;
  audioActive: boolean;
  videoActive: boolean;
  screenShareActive: boolean;
  nickname: string | undefined;
  streamManager: StreamManager | undefined;
  type: ConnectType;
}
