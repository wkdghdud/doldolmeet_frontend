"use client";
import { OpenVidu, StreamManager } from "openvidu-browser";
import { openvidu_api } from "@/utils/api";
import { Grid, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import GradientButton from "@/components/GradientButton";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";

const OneToOnePage = () => {
  /* Video Ref */
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sessionName, setSessionName] = useState<string>("test-idol-session-1");
  const [fanNumber, setFanNumber] = useState<string>();
  const [idolStream, setIdolStream] = useState<StreamManager>();
  const [fanStream, setFanStream] = useState<StreamManager>();
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);

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

      try {
        await createSession();
      } catch (e) {}

      mySession.on("streamCreated", (event) => {
        console.log("👀 팬 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        setFanStream(subscriber);
      });

      // mySession.on("signal:invite", (event) => {
      //   const nextSessionId = event.data;
      //   console.log("🚀 새로운 방으로 들어오세요~ ", nextSessionId);
      //   if (nextSessionId) {
      //     setNextSessionId(nextSessionId);
      //     setPopupOpen(true);
      //   }
      // });

      const { token } = await createToken();
      console.log(token);
      await mySession.connect(token, {
        clientData: "카리나",
      });

      const newPublisher = await ov.initPublisherAsync(undefined, {});
      mySession.publish(newPublisher);
      setIdolStream(newPublisher);
      setFanStream(newPublisher);
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

    setInvite(true);
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
    return response.data; // The token
  };

  const getConnectionInfo = async () => {
    const info = await openvidu_api.get(
      `/openvidu/api/sessions/${sessionName}/connection`,
    );
    console.log("🚀 커넥션 정보: ", info);
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
        <Grid item xs={6} style={{ position: "relative" }}>
          {fanStream ? (
            <OpenViduVideoComponent streamManager={fanStream} />
          ) : (
            <>
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
            </>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default OneToOnePage;
