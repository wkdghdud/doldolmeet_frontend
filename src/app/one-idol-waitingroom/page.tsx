"use client";
import { useEffect, useRef, useState } from "react";
import { OpenVidu, StreamManager } from "openvidu-browser";
import { Grid } from "@mui/material";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";
import {
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";
import { Role, RoomType } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";

interface Props {
  fanStream: StreamManager | undefined;
}
const OneIdolWaitingRoom = ({ fanStream }: Props) => {
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("fanMeetingId");
  const sessionId = searchParams?.get("sessionId");
  const [role, setRole] = useState<Role>(Role.FAN);
  const [userName, setUserName] = useState<string>("");
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
    console.log("🤡 fanMeetingId", fanMeetingId);
    console.log("🤡 sessionId", sessionId);
    if (sessionId) {
      joinSession(sessionId);
    }
  }, []);

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      // setOV(ov);

      const mySession = ov.initSession();

      await createOpenViduSession(sessionId);

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

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} style={{ position: "relative" }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
            fontWeight: 700,
            color: "#ffffff",
            fontSize: "2rem",
          }}
        >
          곧 통화가 연결될 예정이에요.
        </Typography>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            position: "absolute",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
            fontWeight: 700,
            color: "#ffffff",
            fontSize: "2rem",
          }}
        >
          조금만 기다려주세요 ☺️
        </Typography>
        <img
          src={"/hi.gif"}
          alt="조금만 기다려주세요"
          style={{
            maxWidth: "100%",
            height: "65vh",
            borderRadius: 20,
            objectFit: "cover",
            position: "relative",
            zIndex: 0,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        {fanStream ? (
          <OpenViduVideoComponent streamManager={fanStream} />
        ) : (
          <video
            autoPlay={true}
            ref={videoRef}
            style={{ borderRadius: 20, height: "65vh" }}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default OneIdolWaitingRoom;
