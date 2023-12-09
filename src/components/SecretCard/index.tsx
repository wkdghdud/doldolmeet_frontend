import React, { useRef, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import GradientButton from "@/components/GradientButton";

const ScratchCanvas = styled("canvas")(({ cursorUrl }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 400,
  cursor: `url(${cursorUrl}), auto`,
}));

const ScratchCard = ({ imageSrc, brushSize, revealPercent }) => {
  const scratchCanvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const pencilCursorUrl = "/coin.png"; // 이미지 경로 확인 필요

  useEffect(() => {
    if (scratchCanvasRef.current) {
      const scratchCanvas = scratchCanvasRef.current;
      const scratchContext = scratchCanvas.getContext("2d");

      scratchContext.fillStyle = "#AAAAAA";
      scratchContext.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

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
      };

      scratchCanvas.addEventListener("mousemove", scratch);

      return () => {
        scratchCanvas.removeEventListener("mousemove", scratch);
      };
    }
  }, [brushSize, revealPercent]);

  const revealImage = () => {
    setIsRevealed(true);
    if (scratchCanvasRef.current) {
      scratchCanvasRef.current.style.display = "none";
    }
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
      <ScratchCanvas
        ref={scratchCanvasRef}
        width={510}
        height={620}
        cursorUrl={pencilCursorUrl}
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
