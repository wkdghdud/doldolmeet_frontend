"use client";
import html2canvas from "html2canvas";
import { backend_api } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { ToggleButton } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useEffect, useState } from "react";
import PhotoFrame from "@/components/PhotoFrame";

const Capture = () => {
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");
  const audio = new Audio("/mp3/camera9.mp3");
  const [idolImgSrc, setidolImgSrc] = useState<string>("");
  const [fanImgSrc, setFanImgSrc] = useState<string>("");

  const onCapture = async () => {
    const idolElement: HTMLVideoElement = document.getElementById(
      "idol-video-container",
    ) as HTMLVideoElement;
    const fanElement: HTMLVideoElement = document.getElementById(
      "fan-video-container",
    ) as HTMLVideoElement;

    const idolCanvas: HTMLCanvasElement = document.getElementById(
      "idol-canvas",
    ) as HTMLCanvasElement;
    const fanCanvas: HTMLCanvasElement = document.getElementById(
      "fan-canvas",
    ) as HTMLCanvasElement;

    if (idolElement && fanElement) {
      // 아이돌 캔버스에 캡처 이미지 넣기
      idolCanvas.width = idolElement.videoWidth;
      idolCanvas.height = idolElement.videoHeight;
      idolCanvas
        .getContext("2d")
        ?.drawImage(
          idolElement,
          0,
          0,
          idolElement.videoWidth,
          idolElement.videoHeight,
        );

      // 팬 캔버스에 캡처 이미지 넣기
      fanCanvas.width = fanElement.videoWidth;
      fanCanvas.height = fanElement.videoHeight;
      fanCanvas
        .getContext("2d")
        ?.drawImage(
          fanElement,
          0,
          0,
          fanElement.videoWidth,
          fanElement.videoHeight,
        );

      audio.play(); // 찰칵 소리
      const idolImageDataUrl = idolCanvas.toDataURL("image/png");
      setidolImgSrc(idolImageDataUrl);

      const fanImageDataUrl = fanCanvas.toDataURL("image/png");
      setFanImgSrc(fanImageDataUrl);
    } else {
      console.error("Target element not found");
    }
  };

  useEffect(() => {
    if (fanImgSrc === "" || idolImgSrc === "") {
      return;
    }

    const photoFrameElement = document.getElementById("photo-frame");

    if (photoFrameElement) {
      html2canvas(photoFrameElement, {
        onclone: function (cloned) {
          // @ts-ignore
          cloned.getElementById("photo-frame").style.display = "block";
        },
      })
        .then((canvas) => {
          audio.play(); // 찰칵 소리
          const imageDataUrl = canvas.toDataURL("image/png");
          uploadImage(imageDataUrl);
        })
        .catch((error) => {
          console.error("html2canvas error:", error);
        });
    }
  }, [idolImgSrc, fanImgSrc]);

  const uploadImage = (imageDataUrl) => {
    const blobImage = dataURLtoBlob(imageDataUrl);
    // Blob을 파일로 변환
    const imageFile = new File([blobImage], "image.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", imageFile);

    if (fanMeetingId) {
      backend_api()
        .post(`/captures/upload/${fanMeetingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("Image uploaded successfully:", response.data);
        })
        .catch((error) => {
          console.error("Image upload failed:", error);
        });
    }
  };

  function dataURLtoBlob(dataURL) {
    let arr = dataURL.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  return (
    <>
      <ToggleButton
        value="underlined"
        aria-label="underlined"
        onClick={onCapture}
      >
        <CameraAltIcon sx={{ color: "#FFAFCC" }} />
      </ToggleButton>
      <PhotoFrame fanImgSrc={fanImgSrc} idolImgSrc={idolImgSrc} />
    </>
  );
};

export default Capture;
