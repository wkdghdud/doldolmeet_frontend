import { StreamManager } from "openvidu-browser";
import { Button, Stack, Typography } from "@mui/material";
import DeviceControlButton from "./DeviceControlButton";
import { useAtom } from "jotai/react";
import { currSessionIdAtom } from "@/atom";
import { useEffect } from "react";
import UserVideoComponent from "@/components/UserVideoComponent";
import { useSearchParams } from "next/navigation";

interface Props {
  joinSession: (role: string) => void;
  leaveSession: () => void;
  toggleDevice: (audio, video) => void;
  publisher: StreamManager;
  subscribers: StreamManager[];
  idol: StreamManager;
  fan: StreamManager;
}

const MeetingRoom = ({
  joinSession,
  leaveSession,
  toggleDevice,
  publisher,
  subscribers,
  idol,
  fan,
}: Props) => {
  const [mySessionId, setMySessionId] = useAtom(currSessionIdAtom);

  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  /* 세션 아이디가 변경될 때마다 새로운 세션에 연결하게*/
  useEffect(() => {
    if (role === "fan") {
      joinSession(role);
    }
  }, [mySessionId]);

  return (
    <>
      <Typography variant={"h2"}>{mySessionId}</Typography>
      <Stack direction={"row"} spacing={3} sx={{ marginTop: 2 }}>
        <p>idol</p>
        <UserVideoComponent
          key="idol-video"
          streamManager={role === "idol" ? publisher : subscribers[0]}
        />
        <p>fan</p>
        <UserVideoComponent
          key="fan-video"
          streamManager={role === "idol" ? subscribers[0] : publisher}
        />
      </Stack>
      <Button variant={"contained"} onClick={leaveSession}>
        방 나가기
      </Button>
      <DeviceControlButton toggleDevice={toggleDevice} />
    </>
  );
};

export default MeetingRoom;
