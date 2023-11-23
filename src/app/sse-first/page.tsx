"use client";
import React, { useEffect, useRef, useState } from "react";
import { Grid, TextField } from "@mui/material";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import Typography from "@mui/material/Typography";
import { OpenVidu, StreamManager } from "openvidu-browser";
import { backend_api, openvidu_api } from "@/utils/api";
import GradientButton from "@/components/GradientButton";

const SSE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.doldolmeet.shop/sse/"
    : "http://localhost:8080/sse/";

const SseFan = () => {
  const [userName, setUserName] = useState<number>(9);
  const [idolStream, setIdolStream] = useState<StreamManager>();
  const [fanStream, setFanStream] = useState<StreamManager>();
  const [sessionName, setSessionName] = useState<string>(
    Math.floor(Math.random() * 100),
  );

  const joinSession = async () => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        console.log("👀 아이돌 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        setIdolStream(subscriber);
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
      await mySession.connect(token, {
        clientData: userName.toString(),
      });

      const newPublisher = await ov.initPublisherAsync(undefined, {});
      mySession.publish(newPublisher);
      setFanStream(newPublisher);

      await fetchSSE();
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const fetchSSE = () => {
    const eventSource = new EventSource(SSE_URL + userName);

    eventSource.onopen = () => {
      console.log("SSE에 연결되었습니다.");
    };

    eventSource.onmessage = async (e) => {
      const res = await e.data;
      // const parsedData = JSON.parse(res);
      console.log("데이터가 도착했습니다.");
      // console.log(parsedData);
      // joinSession();

      // 받아오는 data로 할 일
      // eventSource.close();
    };

    eventSource.onerror = (e: any) => {
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
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  // OpenVidu 세션 연결 전 보여줄 카메라 비디오
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

  // useEffect(() => {
  //   console.log("let met see");
  //   fetchSSE();
  // }, []);

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

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={12}>
        <TextField
          value={sessionName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSessionName(event.target.value);
          }}
          sx={{ width: "20vw" }}
        />
        <TextField
          value={userName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setUserName(event.target.value);
          }}
          sx={{ width: "20vw" }}
        />
        <GradientButton onClick={joinSession}>입장하기</GradientButton>
      </Grid>
      <Grid item xs={6} style={{ position: "relative" }}>
        {idolStream ? (
          <OpenViduVideoComponent streamManager={idolStream} />
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
          </>
        )}
      </Grid>
      <Grid item xs={6} style={{ position: "relative" }}>
        {fanStream ? (
          <OpenViduVideoComponent streamManager={fanStream} />
        ) : (
          <video autoPlay={true} ref={videoRef} style={{ borderRadius: 30 }} />
        )}
      </Grid>
    </Grid>
  );
};

export default SseFan;
