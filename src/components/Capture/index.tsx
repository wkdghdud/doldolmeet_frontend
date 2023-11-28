import html2canvas from "html2canvas";
import { backend_api } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { ToggleButton } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const Capture = () => {
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  const onCapture = () => {
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
    <ToggleButton
      value="underlined"
      aria-label="underlined"
      onClick={onCapture}
    >
      <CameraAltIcon sx={{ color: "#FFAFCC" }} />
    </ToggleButton>
  );
};

export default Capture;
