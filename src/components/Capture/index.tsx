import html2canvas from "html2canvas";
import { useCallback } from "react";
import { backend_api } from "@/utils/api";

const Capture = () => {
  const onCapture = () => {
    console.log("onCapture");
    const targetElement = document.getElementById("video-container");
    if (targetElement) {
      html2canvas(targetElement)
        .then((canvas) => {
          // onSavaAs(canvas.toDataURL("image/png"), "image-download.png");
          const imageDataUrl = canvas.toDataURL("image/png");
          uploadImage(imageDataUrl);
        })
        .catch((error) => {
          console.error("html2canvas error:", error);
        });
    } else {
      console.error("Target element not found");
    }
  };

  const uploadImage = (imageDataUrl) => {
    console.log("🎲🎲🎲🎲🎲🎲🎲", imageDataUrl);

    const blobImage = dataURLtoBlob(imageDataUrl);
    // Blob을 파일로 변환
    const imageFile = new File([blobImage], "image.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("multipartFile", imageFile);
    backend_api()
      .post("/s3/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Image uploaded successfully:", formData);
      })
      .catch((error) => {
        console.error("Image upload failed:", error);
      });
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

  const onSavaAs = (uri, filename) => {
    console.log("onSavaAs");
    var link = document.createElement("a");
    document.body.appendChild(link);
    link.href = uri;
    link.download = filename;
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button onClick={onCapture}>Capture</button>
    </div>
  );
};

export default Capture;
