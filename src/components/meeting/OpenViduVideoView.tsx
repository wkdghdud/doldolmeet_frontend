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

  // Adjusted overlay positioning and size
  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: left ? 0 : "auto", // Align left image to the left and right image to the right
    right: left ? "auto" : 0, // Align right image to the right
    width: "50%", // Set width to 50% to fit half of the screen
    height: "100%",
    objectFit: "cover",
    zIndex: 300,
  };

  return (
    <div style={{ position: "relative" }}>
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
          style={overlayStyle} // Use the adjusted overlay style
        />
      )}
      <canvas hidden={true} id={left ? "idol-canvas" : "fan-canvas"} />
    </div>
  );
};

export default OpenViduVideoView;
