"use client";
import { useEffect, useRef, useState } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import GradientButton from "@/components/GradientButton";
import VolumeBar from "@/components/VolumeBar";
import MicIcon from "@mui/icons-material/Mic";

const audioContext = (stream: MediaStream) => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);
  microphone.connect(analyser);
  analyser.fftSize = 256; // 256 ~ 2048
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  return { analyser, bufferLength, dataArray };
};

const audioFrequency = (dataArray, bufferLength) => {
  let total = 0;
  for (let i = 0; i < bufferLength; i += 1) {
    total += dataArray[i];
  }
  return total / bufferLength;
};

const PreWaitingRoomPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [vol, setVol] = useState<number>(0);
  const [setting, setSetting] = useState<boolean>(true);
  const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(
    null,
  ); // 추가

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setUserMediaStream(stream); // 수정: MediaStream 상태 업데이트
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices: ", error);
      }
    };
    getMedia();
  }, []);

  useEffect(() => {
    let myInterval;
    if (userMediaStream) {
      // 수정: userMediaStream 확인
      const { analyser, bufferLength, dataArray } =
        audioContext(userMediaStream); // 수정: userMediaStream 전달
      if (setting) {
        myInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const vol = audioFrequency(dataArray, bufferLength);
          setVol(Math.floor((vol / 256) * 100));
        }, 30);
      }
    }
    return () => clearInterval(myInterval);
  }, [setting, userMediaStream]); // 수정: userMediaStream 추가

  return (
    <Stack spacing={2} direction="row" alignItems="center">
      {/* Stack for video and content */}
      <Stack spacing={2} justifyContent="center" alignItems="center">
        <Typography variant={"h2"}>
          나의 아이돌을 만나기전 오디오, 화면 체크
        </Typography>
        <video autoPlay={true} ref={videoRef} style={{ borderRadius: 30 }} />
        <GradientButton
          // onClick={onClickEntrance}
          sx={{ padding: 1, py: 2, borderRadius: 3, width: "100%" }}
        >
          <Typography variant={"button"} sx={{ fontWeight: 700, fontSize: 20 }}>
            입 장 하 기
          </Typography>
        </GradientButton>
      </Stack>
      {/* Volume bar */}
      <Stack direction="column" alignItems="center">
        <VolumeBar volume={vol} />
        {/* Mic icon */}
        <MicIcon sx={{ fontSize: 30, color: "#4ADE80" }} />
      </Stack>
    </Stack>
  );
};

export default PreWaitingRoomPage;
