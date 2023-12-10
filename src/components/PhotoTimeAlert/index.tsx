"use client";
import Paper from "@mui/material/Paper";
import { Fade, Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  motionType: "bigHeart" | "halfHeart";
}

const PhotoTimeAlert = ({ open, motionType }: Props) => {
  const [audio, setAudio] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudio(new Audio("/mp3/photo_alert.mp3"));
    }
  }, []);

  useEffect(() => {
    if (open && audio) {
      audio.play();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [open, audio]);

  return (
    <Fade in={open} timeout={2000}>
      <Paper
        elevation={10}
        sx={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          py: 5,
          zIndex: 1000,
        }}
      >
        <Grid container justifyContent={"center"} alignItems={"center"}>
          <Grid item xs={12}>
            <Typography
              variant="h1"
              align={"center"}
              sx={{ width: "100%", marginBottom: 1 }}
            >
              📸 모션 인식 포토 타임!
            </Typography>
            <Typography variant="h5" align={"center"} sx={{ width: "100%" }}>
              {motionType === "bigHeart"
                ? "머리 위로 큰 하트를 만들어주세요."
                : "아이돌과 함께 하나의 하트를 만들어주세요."}
              <br />
              돌돌밋이 모션을 인식해서 사진을 찍어드려요.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <img
              src={
                motionType === "bigHeart"
                  ? "/big_heart_pose.jpeg"
                  : "/half_heart_pose.jpeg"
              }
              alt="photo_time"
              width="300"
              style={{ display: "block", margin: "auto" }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
};

export default PhotoTimeAlert;
