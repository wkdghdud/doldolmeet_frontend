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
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

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

  const [role, setRole] = useState<Role>(Role.FAN);
  const [imgSrc, setImgSrc] = useState<string>("");

  const token = useJwtToken();

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
      }
    });
  }, [token]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(todayMeeting !== null && todayMeeting !== undefined);
    setImgSrc(todayMeeting?.data?.imgUrl);
  }, [todayMeeting]);

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
      <IconButton
        aria-label="close"
        onClick={() => setOpen(false)}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      {role === Role.FAN && (
        <>
          <DialogContent
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={imgSrc}
              alt="이미지"
              style={{ height: "100%", width: "auto" }}
              onError={() => setImgSrc("/images/fanmeeting/riize_cover.jpeg")}
            />
          </DialogContent>
          <DialogTitle style={{ textAlign: "center" }}>
            시작시간이 {todayMeeting?.data?.startTime} 입니다.
          </DialogTitle>
          <DialogContentText style={{ textAlign: "center" }}>
            당신의 아이돌을 만나기 위해{" "}
            <span style={{ color: "#ed6ea0" }}>이동하기</span> 버튼을
            눌러주세요.
          </DialogContentText>
          <DialogTitle style={{ textAlign: "center" }}></DialogTitle>
          <DialogActions style={{ justifyContent: "space-between" }}>
            <GradientButton sx={{ width: "100%", height: 40 }}>
              <Link
                href={`/waitingroom?id=${todayMeeting?.data?.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                이동하기
              </Link>
            </GradientButton>
          </DialogActions>
        </>
      )}
      {role === Role.IDOL && (
        <>
          <DialogContent
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={imgSrc}
              alt="이미지"
              style={{ width: "300px", height: "200px" }}
              onError={() => setImgSrc("/images/fanmeeting/riize_cover.jpeg")}
            />
          </DialogContent>
          <DialogContentText style={{ textAlign: "center" }}>
            오늘의 팬미팅이 시작되었습니다.
          </DialogContentText>
          <DialogTitle style={{ textAlign: "center" }}>
            시작시간이 {todayMeeting?.data?.startTime} 입니다.
          </DialogTitle>
          <DialogContentText style={{ textAlign: "center" }}>
            팬미팅을 시작하시겠습니까?
          </DialogContentText>
          <DialogActions style={{ justifyContent: "space-between" }}>
            <GradientButton sx={{ width: "100%", height: 40 }}>
              <Link
                href={`/idol-fanmeeting?id=${todayMeeting?.data?.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                이동하기
              </Link>
            </GradientButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
