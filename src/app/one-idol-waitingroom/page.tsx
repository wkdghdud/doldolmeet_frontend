"use client";
import { useEffect, useRef, useState } from "react";
import { Connection, OpenVidu, StreamManager } from "openvidu-browser";
import { Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useRouter, useSearchParams } from "next/navigation";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import { Role, RoomType } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import JoinIdolRoomDialog from "@/components/InviteDialog/JoinIdolRoomDialog";
import { AWS_S3_URL } from "@/utils/api";

interface Props {
  fanStream: StreamManager | undefined;
}
const OneIdolWaitingRoom = ({ fanStream }: Props) => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("fanMeetingId");
  const sessionId = searchParams?.get("sessionId");
  const [role, setRole] = useState<Role>(Role.FAN);
  const [userName, setUserName] = useState<string>("");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");
  const [connection, setConnection] = useState<Connection | undefined>();
  const [popupImage, setPopupImage] = useState<string>("");
  const [nextIdolName, setNextIdolName] = useState<string>("");

  const token = useJwtToken();

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
        setUserName(res.sub);
      }
    });
  }, [token]);

  useEffect(() => {
    if (userName) {
      fetchSSE().then((res) => {
        if (res && sessionId) {
          joinSession(sessionId);
        }
      });
    }
  }, [userName]);

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      // setOV(ov);

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        // setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
      });

      mySession.on("streamDestroyed", (event) => {
        // deleteSubscriber(event.stream.streamManager);
      });

      const connection = await createOpenViduConnection(sessionId);
      // if (connection) {
      //   setMyConnection(connection);
      // }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: role,
          fanMeetingId: fanMeetingId,
          userName: userName,
          type: RoomType.waitingRoom,
        }),
      });

      // setSession(mySession);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const fetchSSE = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );
    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 연결되었습니다.");
    });

    eventSource.addEventListener(
      "moveToFirstIdolWaitRoom",
      (e: MessageEvent) => {
        console.log("🥹 moveToFirstIdolWaitRoom: ", JSON.parse(e.data));
        setNextRoomId(JSON.parse(e.data).nextRoomId);
        setPopupOpen(true);
      },
    );

    eventSource.addEventListener("moveToIdolRoom", (e: MessageEvent) => {
      console.log("🥹 moveToIdolRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      setPopupImage(JSON.parse(e.data).roomThumbnail);
      setNextIdolName(JSON.parse(e.data).idolNickName);
      setPopupOpen(true);
    });

    eventSource.onopen = () => {
      console.log("연결되었습니다.");
    };

    eventSource.onmessage = async (e) => {
      const res = await e.data;
      // const parsedData = JSON.parse(res);
      console.log("데이터가 도착했습니다.");
      // console.log(parsedData);
      joinSession("waitingRoom"); //
      // alert(res)
      // 받아오는 data로 할 일
      // eventSource.close();
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("error");
      console.log(e);
      eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };

    return true;
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // 미디어 스트림을 비디오 요소에 할당
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices: ", error);
      }
    };

    getMedia();
  }, []);

  const joinNextRoom = async () => {
    await leaveWaitingRoom();
    router.push(
      `/one-to-one?fanMeetingId=${fanMeetingId}&sessionId=${nextRoomId}&idolName=${nextIdolName}`,
    );
  };

  const leaveWaitingRoom = async () => {
    if (sessionId && connection?.connectionId) {
      await closeOpenViduConnection(sessionId, connection.connectionId);
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    setPopupOpen(false);
  };

  return (
    <>
      <Stack spacing={2} justifyContent="center" alignItems="center">
        <Typography variant={"h2"}>
          통화가 연결될 때까지 조금만 기다려주세요 ☺️
        </Typography>
        <video autoPlay={true} ref={videoRef} style={{ borderRadius: 30 }} />
      </Stack>
      <JoinIdolRoomDialog
        open={popupOpen}
        idolImgUrl={`${AWS_S3_URL}/${popupImage}`}
        handleClose={handleClose}
        handleEnter={joinNextRoom}
      />
    </>
  );
};

export default OneIdolWaitingRoom;
