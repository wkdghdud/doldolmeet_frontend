"use client";
import React, { useRef, useEffect, useState } from "react";
import "./styles/global.css";
import GradientButton from "@/components/GradientButton";

const ScratchCard = ({ imageSrc, brushSize, revealPercent }) => {
  const scratchCanvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [audio, setAudio] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudio(new Audio("/mp3/clap.mp3"));
    }
  }, []);

  useEffect(() => {
    const scratchCanvas = scratchCanvasRef.current;
    const scratchContext = scratchCanvas.getContext("2d");

    // 가리개 레이어 초기화
    scratchContext.fillStyle = "#AAAAAA";
    scratchContext.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    // 스크래치 효과 함수
    const scratch = (e) => {
      const rect = scratchCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      scratchContext.globalCompositeOperation = "destination-out";
      scratchContext.beginPath();
      scratchContext.arc(x, y, brushSize, 0, Math.PI * 2);
      scratchContext.fill();

      updateScratchPercentage();
    };

    // 스크래치된 영역의 비율 계산
    const updateScratchPercentage = () => {
      const imageData = scratchContext.getImageData(
        0,
        0,
        scratchCanvas.width,
        scratchCanvas.height,
      );
      const pixels = imageData.data;
      let transparentPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) {
          transparentPixels++;
        }
      }
      const percentage = (transparentPixels / (pixels.length / 4)) * 100;
      setScratchPercentage(percentage);

      if (percentage > revealPercent && !isRevealed) {
        revealImage();
      }
    };

    const changeCursor = () => {
      scratchCanvas.style.cursor = `url('/coin.png'), auto`;
    };

    // 마우스 커서 원래대로 돌리는 함수
    const revertCursor = () => {
      scratchCanvas.style.cursor = "default";
    };

    // 이벤트 리스너 추가
    scratchCanvas.addEventListener("mousemove", scratch);
    scratchCanvas.addEventListener("mouseenter", changeCursor);
    scratchCanvas.addEventListener("mouseleave", revertCursor);

    return () => {
      // 이벤트 리스너 제거
      scratchCanvas.removeEventListener("mousemove", scratch);
      scratchCanvas.removeEventListener("mouseenter", changeCursor);
      scratchCanvas.removeEventListener("mouseleave", revertCursor);
    };
  }, [brushSize, revealPercent]);

  // 이미지 회전 및 가리개 제거 함수
  const revealImage = () => {
    if (isRevealed) {
      return;
    }
    // 오디오 재생
    if (audio) {
      audio.play().catch((error) => {
        console.error("Audio playback failed", error);
      });
    }
    setIsRevealed(true);
    scratchCanvasRef.current.style.display = "none";
  };

  return (
    <div style={{ position: "relative" }}>
      <img
        src={imageSrc}
        alt="Scratch Image"
        style={{
          width: "510px",
          height: "620px",
          animation: isRevealed ? "spin 3s linear" : "none",
        }}
      />
      <canvas
        ref={scratchCanvasRef}
        width={510}
        height={620}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      {scratchPercentage > revealPercent && !isRevealed && (
        <GradientButton onClick={revealImage} style={{ marginTop: "10px" }}>
          이미지 확인하기
        </GradientButton>
      )}
    </div>
  );
};

export default ScratchCard;
