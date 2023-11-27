import React, { useEffect, useRef } from "react";
import { Typography } from "@mui/material";

interface Props {
  name: string | undefined;
}

const LocalCameraView = ({ name }: Props) => {
  /* Video Ref */
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stream이 undefined인 경우 보여줄 비디오
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // 미디어 스트림을 비디오 요소에 할당
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices: ", error);
      }
    };

    getMedia();

    // 컴포넌트가 언마운트될 때 미디어 스트림 해제
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    };
  }, []);

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
    </div>
  );
};

export default LocalCameraView;
