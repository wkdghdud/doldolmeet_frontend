"use client";
import { useEffect, useRef } from "react";
import { StreamManager } from "openvidu-browser";
import { Grid } from "@mui/material";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import Typography from "@mui/material/Typography";

interface Props {
  fanStream: StreamManager | undefined;
}
const OneIdolWaitingRoom = ({ fanStream }: Props) => {
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
