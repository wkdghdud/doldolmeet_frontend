"use client";
import { useEffect, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { Publisher } from "openvidu-browser";

interface Props {
  publisher: Publisher | undefined;
  micInit: boolean;
  cameraInit: boolean;
}

const SmallDeviceControlButton = ({
  publisher,
  micInit,
  cameraInit,
}: Props) => {
  const [mic, setMic] = useState(micInit);
  const [camera, setCamera] = useState(cameraInit);

  useEffect(() => {
    setMic(micInit);
    setCamera(cameraInit);
  }, [micInit, cameraInit]);

  useEffect(() => {
    publisher?.publishVideo(camera);
    publisher?.publishAudio(mic);
  }, [mic, camera]);

  return (
    <ToggleButtonGroup
      orientation="vertical"
      sx={{ backgroundColor: "#FFFFFF", marginRight: 3 }}
    >
      <ToggleButton
        value="underlined"
        aria-label="underlined"
        onClick={() => setMic(!mic)}
      >
        {mic ? (
          <MicIcon sx={{ color: "#FFAFCC" }} />
        ) : (
          <MicOffIcon sx={{ color: "#bdbdbd" }} />
        )}
      </ToggleButton>
      <ToggleButton
        value="italic"
        aria-label="italic"
        onClick={() => setCamera(!camera)}
      >
        {camera ? (
          <VideocamIcon sx={{ color: "#FFAFCC" }} />
        ) : (
          <VideocamOffIcon sx={{ color: "#bdbdbd" }} />
        )}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default SmallDeviceControlButton;
