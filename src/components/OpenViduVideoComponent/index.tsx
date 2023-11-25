"use client";
import { useEffect, useRef } from "react";
import { Publisher, StreamManager } from "openvidu-browser";

const OpenViduVideoComponent = ({
  streamManager,
}: {
  streamManager: StreamManager | Publisher;
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  return (
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
  );
};

export default OpenViduVideoComponent;
