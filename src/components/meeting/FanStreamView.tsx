import React, { useEffect, useRef } from "react";
import { Typography } from "@mui/material";
import { Publisher, StreamManager, Subscriber } from "openvidu-browser";

interface Props {
  name: string | undefined;
  streamManager: StreamManager | Publisher | Subscriber;
}

const FanStreamView = ({ name, streamManager }: Props) => {
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
          variant="h6"
          sx={{
            position: "absolute",
            top: 15,
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
          autoPlay={true}
          ref={videoRef}
          style={{
            borderRadius: 20,
            width: "100%",
            height: "20vh",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
};

export default FanStreamView;
