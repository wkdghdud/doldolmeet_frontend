"use client";
import React, { useEffect, useRef } from "react";
import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import { Typography } from "@mui/material";

interface Props {
  name: string | undefined;
  streamManager: StreamManager | Publisher | Subscriber;
  mirror?: boolean;
}

const OpenViduVideoView = ({ name, streamManager, mirror }: Props) => {
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
      {mirror ? (
        <video
          autoPlay={true}
          ref={videoRef}
          style={{
            borderRadius: 20,
            maxWidth: "95%",
            height: "70vh",
            objectFit: "cover",
            transform: "rotateY(180deg)",
          }}
        />
      ) : (
        <video
          autoPlay={true}
          ref={videoRef}
          style={{
            borderRadius: 20,
            maxWidth: "95%",
            height: "70vh",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
};

export default OpenViduVideoView;
