"use client";
import { useEffect, useState } from "react";
import { Session, StreamManager } from "openvidu-browser";
import { Grid } from "@mui/material";
import Image from "next/image";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import Typography from "@mui/material/Typography";
import { joinSession } from "@/utils/openvidu";

interface Props {
  fanStream: StreamManager;
}
const OneIdolWaitingRoom = ({ fanStream }: Props) => {
  return (
    <Grid container>
      <Grid item xs={6}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          곧 통화가 연결될 예정이에요.
        </Typography>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          조금만 기다려주세요 ☺️
        </Typography>
        <img
          src={"/singer_1.jpeg"}
          alt="조금만 기다려주세요"
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Grid>
      <Grid item xs={6}>
        {fanStream ? (
          <OpenViduVideoComponent streamManager={fanStream} />
        ) : (
          <>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              정상적이지 않은 연결입니다 😭
            </Typography>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              다시 접속해주세요.
            </Typography>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default OneIdolWaitingRoom;
