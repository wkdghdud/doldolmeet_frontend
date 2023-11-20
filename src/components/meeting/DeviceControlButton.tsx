"use client";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

interface Props {
  toggleDevice: (audio, video) => void;
}

const DeviceControlButton = ({ toggleDevice }: Props) => {
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);

  useEffect(() => {
    toggleDevice(mic, camera);
  }, [mic, camera]);

  return (
    <>
      {/* TODO: 마이크 껐다 켰다 하는 아이콘 버튼 추가하고, 음성이 껐다 켜지는지 확인 필요 */}
      {mic ? (
        <IconButton aria-label="mic" size="large" onClick={() => setMic(!mic)}>
          <MicIcon fontSize="inherit" />
        </IconButton>
      ) : (
        <IconButton
          aria-label="mic-off"
          size="large"
          onClick={() => setMic(!mic)}
        >
          <MicOffIcon fontSize="inherit" />
        </IconButton>
      )}
      {camera ? (
        <IconButton
          aria-label="video"
          size="large"
          onClick={() => setCamera(!camera)}
        >
          <VideocamIcon fontSize="inherit" />
        </IconButton>
      ) : (
        <IconButton
          aria-label="video-off"
          size="large"
          onClick={() => setCamera(!camera)}
        >
          <VideocamOffIcon fontSize="inherit" />
        </IconButton>
      )}
    </>
  );
};

export default DeviceControlButton;
