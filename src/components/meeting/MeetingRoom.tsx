import { StreamManager } from "openvidu-browser";
import { Button, Stack, Typography } from "@mui/material";
import DeviceControlButton from "./DeviceControlButton";
import UserVideoComponent from "../UserVideoComponent";
import { useAtom } from "jotai/react";
import { currSessionIdAtom } from "@/atom";
import { useEffect } from "react";

interface Props {
  joinSession: () => void;
  leaveSession: () => void;
  toggleDevice: (audio, video) => void;
  idol: StreamManager;
  fan: StreamManager;
}

const MeetingRoom = ({
  joinSession,
  leaveSession,
  toggleDevice,
  idol,
  fan,
}: Props) => {
  const [mySessionId, setMySessionId] = useAtom(currSessionIdAtom);

  /* 세션 아이디가 변경될 때마다 새로운 세션에 연결하게*/
  useEffect(() => {
    joinSession();
  }, [mySessionId]);

  return (
    <>
      <Typography variant={"h2"}>{mySessionId}</Typography>
      <Stack direction={"row"} spacing={3} sx={{ marginTop: 2 }}>
        <UserVideoComponent key="idol-video" streamManager={idol} />
        <UserVideoComponent key="fan-video" streamManager={fan} />
      </Stack>
      <Button variant={"contained"} onClick={leaveSession}>
        방 나가기
      </Button>
      <DeviceControlButton toggleDevice={toggleDevice} />
    </>
  );
};

export default MeetingRoom;
