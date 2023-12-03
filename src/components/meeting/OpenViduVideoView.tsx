"use client";
import React, { useEffect, useRef } from "react";
import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import { Typography } from "@mui/material";

interface Props {
  name: string | undefined;
  streamManager: StreamManager | Publisher | Subscriber;
  left: boolean;
  showOverlay: boolean;
}

const OpenViduVideoView = ({
  name,
  streamManager,
  left,
  showOverlay,
}: Props) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
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
            height: "70vh",
            objectFit: "cover",
          }}
        />
      </div>
      {showOverlay && (
        <img
          src={left ? "/left_heart.png" : "/right_heart.png"}
          alt="gradient"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "95%",
            height: "100%",
            objectFit: "cover",
            zIndex: 300,
          }}
        />
      )}
      <canvas hidden={true} id={left ? "idol-canvas" : "fan-canvas"} />
    </div>
  );
};

export default OpenViduVideoView;
