"use client";
import { Connection, OpenVidu, Session, StreamManager } from "openvidu-browser";
import { openvidu_api } from "@/utils/api";
import { Grid, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import GradientButton from "@/components/GradientButton";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import {
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";

const OneToOnePage = () => {
  /* Video Ref */
  const videoRef = useRef<HTMLVideoElement>(null);

  /* OpenVidu Session Info*/
  const [session, setSession] = useState<Session | undefined>();
  const [sessionName, setSessionName] = useState<string>("test-idol-session-1");
  const [fanNumber, setFanNumber] = useState<string>();

  /* OpenVidu Stream */
  const [idolStream, setIdolStream] = useState<StreamManager>();
  const [fanStream, setFanStream] = useState<StreamManager>();
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);

  /* OpenVidu Connection */
  const [myConnection, setMyConnection] = useState<Connection | undefined>();

  // OpenVidu 세션 연결 전 보여줄 카메라 비디오
  useEffect(() => {
    async function init() {
      await joinSession();
    }

    init();

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

    // 컴포넌트가 언마운트될 때 미디어 스트림 해제
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    };
  }, []);

  const joinSession = async () => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      await createOpenViduSession(sessionName);

      mySession.on("streamCreated", (event) => {
        console.log("👀 팬 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
      });

      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      const connection = await createOpenViduConnection(sessionName);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: "카리나",
      });

      await ov.getUserMedia({
        audioSource: undefined,
        videoSource: undefined,
      });
      var devices = await ov.getDevices();
      var videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const newPublisher = await ov.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: videoDevices[0].deviceId,
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
      });
      mySession.publish(newPublisher);
      setSession(mySession);
      setIdolStream(newPublisher);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const signalInvite = async () => {
    await openvidu_api
      .post("/openvidu/api/signal", {
        session: sessionName + "waiting_room",
        type: "signal:invite",
        // data: JSON.stringify({
        //   fan_number: "fanNumber",
        //   sessionId: currSessionId,
        // }),
        data: fanNumber,
        // to: [inviteFan?.stream.connection.connectionId],
      })
      .then((response) => {
        console.log("👋 팬에게 성공적으로 초대 시그널을 보냈습니다.", response);
      })
      .catch((error) => console.error(error));
  };

  const createSession = async () => {
    const response = await openvidu_api.post(
      `/openvidu/api/sessions`,
      { customSessionId: sessionName.toString() },
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  };

  const createToken = async () => {
    const response = await openvidu_api.post(
      `/openvidu/api/sessions/${sessionName}/connection`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log("🚀 토큰 생성: ", response);
    return response.data; // The token
  };

  const getConnectionInfo = async () => {
    const info = await openvidu_api.get(
      `/openvidu/api/sessions/${sessionName}/connection`,
    );
    console.log("🚀 커넥션 정보: ", info);
    console.log("🚀 내 커넥션 아이디: ", myConnection?.connectionId);
  };

  const leaveSession = async () => {
    if (session) {
      await session.disconnect();
    }

    // state 초기화
    setIdolStream(undefined);
    setFanStream(undefined);
    setSubscribers([]);
    setMyConnection(undefined);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [leaveSession]);

  const closeSession = async () => {
    await openvidu_api.delete(`/openvidu/api/sessions/${sessionName}`);
  };

  /* Subscriber 삭제 */
  const deleteSubscriber = (streamManager) => {
    let newSubscribers = subscribers.filter((sub) => sub !== streamManager);
    setSubscribers(newSubscribers);
  };

  return (
    <Stack
      direction={"column"}
      spacing={2}
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant={"h2"}>
        👋 아이돌 {sessionName}의 방입니다. 👋
      </Typography>
      <Stack
        direction={"row"}
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <TextField
          value={fanNumber}
          onChange={(e) => setFanNumber(e.target.value)}
        />
        <GradientButton onClick={signalInvite}>초대하기</GradientButton>
        <GradientButton onClick={getConnectionInfo}>커넥션 정보</GradientButton>
        <GradientButton onClick={closeSession}>세션 삭제</GradientButton>
      </Stack>

      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={6}>
          {idolStream ? (
            <OpenViduVideoComponent streamManager={idolStream} />
          ) : (
            <video
              autoPlay={true}
              ref={videoRef}
              style={{ borderRadius: 30 }}
            />
          )}
        </Grid>

        {subscribers.length > 0 ? (
          <Grid xs={12}>
            {subscribers.map((subscriber, i) => (
              <Stack key={i} direction={"column"}>
                <OpenViduVideoComponent streamManager={subscriber} />
              </Stack>
            ))}
          </Grid>
        ) : (
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
              곧 팬이 들어올 예정이에요.
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
              src={"/fan.webp"}
              alt="조금만 기다려주세요"
              style={{
                maxWidth: "100%",
                height: "60vh",
                borderRadius: 20,
                objectFit: "cover",
                position: "relative",
                zIndex: 0,
              }}
            />
          </Grid>
        )}
      </Grid>
    </Stack>
  );
};

export default OneToOnePage;
