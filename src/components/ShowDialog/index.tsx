"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Link from "next/link";
import { useTodayFanmeeting } from "@/hooks/useTodayFanmeeting";
import GradientButton from "@/components/GradientButton";

export interface TodayFanMeeting {
  id: number;
  imgUrl: string;
  title: string;
  startTime: string;
}

interface Props {
  todayfanMeeting: TodayFanMeeting | null;
  popupOpen: boolean;
}

export default function ShowDialog() {
  const { data: todayMeeting } = useTodayFanmeeting();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(todayMeeting !== null && todayMeeting !== undefined);
  }, [todayMeeting]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        style: {
          width: "30%",
          height: "55%",
        },
      }}
    >
      <DialogTitle style={{ textAlign: "center" }}>
        {todayMeeting?.data?.title}
      </DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={todayMeeting?.data?.imgUrl}
          alt="이미지"
          style={{ width: "300px", height: "200px" }}
        ></img>
      </DialogContent>
      <DialogTitle style={{ textAlign: "center" }}>
        시작시간이 {todayMeeting?.data?.startTime} 입니다.
      </DialogTitle>
      <DialogContentText style={{ textAlign: "center" }}>
        당신의 아이돌을 만나기 위해{" "}
        <span style={{ color: "#ed6ea0" }}>이동</span>버튼을 눌러주세요.
      </DialogContentText>
      <DialogTitle style={{ textAlign: "center" }}></DialogTitle>
      <DialogActions style={{ justifyContent: "space-between" }}>
        <GradientButton onClick={() => setOpen(false)}>닫기</GradientButton>
        <GradientButton>
          <Link
            href="/waitingroom"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            이동
          </Link>
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
}
