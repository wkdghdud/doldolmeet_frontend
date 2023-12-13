"use client";
import React, { useEffect, useRef } from "react";
import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import { Typography } from "@mui/material";

interface Props {
  name: string | undefined;
  streamManager: StreamManager | Publisher | Subscriber;
  left: boolean;
  showOverlay: boolean;
  motionType: string | undefined | null;
}

const OpenViduVideoView = ({
  name,
  streamManager,
  left,
  showOverlay,
  motionType,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
      videoRef.current.volume = 1;
    }
  }, [streamManager]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {name && (
        <Typography
          variant="h5"
          sx={{
            position: "absolute",
            top: 25,
            left: 20,
            color: "white",
            zIndex: 300,
            backgroundColor: "rgba(117,117,117,0.7)",
            py: 0.5,
            px: 1,
            borderRadius: 1,
          }}
        >
          {name}
        </Typography>
      )}

      <div
        style={{
          transform: "rotateY(180deg)",
          WebkitTransform: "rotateY(180deg)",
          width: "95%",
          margin: "auto",
        }}
      >
        <video
          id={left ? "idol-video-container" : "fan-video-container"}
          autoPlay={true}
          ref={videoRef}
          style={{
            borderRadius: 20,
            maxWidth: "100%",
            height: "68vh",
            objectFit: "cover",
          }}
        />
      </div>
      {showOverlay && (
        <img
          src={
            motionType === "bigHeart"
              ? "/big_heart.png"
              : motionType === "halfHeart"
              ? left
                ? "/left_heart.png"
                : "/right_heart.png"
              : undefined
          }
          alt="overlay"
          style={{
            position: "absolute",
            top: "50%", // 중앙에서 시작하도록 조정
            left: left ? "50%" : "auto", // 왼쪽 이미지일 경우 왼쪽 하트의 오른쪽 끝이 중앙에 오도록 조정
            right: left ? "auto" : "50%", // 오른쪽 이미지일 경우 오른쪽 하트의 왼쪽 끝이 중앙에 오도록 조정
            transform: left ? "translateX(-100%)" : "translateX(0)", // 왼쪽 이미지일 경우 왼쪽으로 100% 이동하여 하트가 화면 중앙에서 시작하도록 함
            width: "50%", // 화면의 절반을 차지하도록 설정
            height: "auto", // 자동으로 높이 조정
            objectFit: "contain", // 비율을 유지하면서 요소에 맞게 조정
            zIndex: 300,
          }}
        />
      )}
      <canvas hidden={true} id={left ? "idol-canvas" : "fan-canvas"} />
    </div>
  );
};

export default OpenViduVideoView;
