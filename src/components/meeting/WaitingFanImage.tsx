import React from "react";
import { TypographyOnImage } from "@/components/Typography";

const WaitingFanImage = () => {
  return (
    <>
      <TypographyOnImage variant="h4">
        곧 팬이 들어올 예정이에요.
        <br />
        조금만 기다려주세요 ☺️
      </TypographyOnImage>
      <img
        src={"/fan.webp"}
        alt="조금만 기다려주세요"
        style={{
          maxWidth: "95%",
          height: "70vh",
          borderRadius: 20,
          objectFit: "cover",
          position: "relative",
          zIndex: 0,
        }}
      />
    </>
  );
};

export default WaitingFanImage;
