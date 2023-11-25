"use client";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import { StreamManager } from "openvidu-browser";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useEffect, useRef } from "react";

interface Props {
  idolStream: StreamManager | undefined;
  fanStream: StreamManager | undefined;
}

const TwoPersonMeetingPage = ({ idolStream, fanStream }: Props) => {
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

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
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

export default TwoPersonMeetingPage;
