"use client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AWS_S3_URL, backend_api } from "@/utils/api";
import {
  Button,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  DialogContentText,
  Typography,
} from "@mui/material";
import { GetApp, Twitter } from "@mui/icons-material";
import Carousel from "react-material-ui-carousel";
import axios from "axios";
import ForwardIcon from "@mui/icons-material/Forward";
import ScratchCard from "@/components/SecretCard";
import { useSearchParams } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";

function captureVideoFrame(videoUrl, time, callback) {
  const video = document.createElement("video");
  video.src = videoUrl;

  video.addEventListener("loadedmetadata", function () {
    video.currentTime = time;
  });

  video.addEventListener("seeked", function () {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(callback);
  });

  video.load();
}
const EndFanMeetingPage = () => {
  /* route query */
  const router = useRouter();
  const { userName, fanMeetingId } = router.query;
  const searchParams = useSearchParams();
  const winner = searchParams?.get("winner");

  /* States */
  const [contents, setContents] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [showSecretCard, setShowSecretCard] = useState(false);
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    async function init() {
      if (
        userName &&
        userName !== undefined &&
        fanMeetingId &&
        fanMeetingId !== "undefined" &&
        winner &&
        winner !== undefined
      ) {
        // fanMeetingId가 유효한 경우에만 API 호출 수행
        if (fanMeetingId && fanMeetingId !== "undefined") {
          await backend_api()
            .get(`/captures/${fanMeetingId}`)
            .then((res) => {
              if (res.data.data.length > 0) {
                const captureUrls: string[] = res.data.data.map(
                  (captureData) => `${AWS_S3_URL}/${captureData.captureUrl}`,
                );
                console.log("captureUrls", captureUrls);
                setContents((prev) => [...prev, ...captureUrls]);
              }
            })
            .catch((error) => {
              console.error("Error fetching captures:", error);
            });
        }

        await backend_api()
          .post(`recording-java/api/recordings/get`, {
            fanMeetingId: fanMeetingId,
            fan: userName,
          })
          .then((res) => {
            if (Object.values(res.data).length > 0) {
              const videoUrls: string[] = Object.values(res.data).map(
                // @ts-ignore
                (video) => video.url,
              );
              console.log("videoUrls", videoUrls);
              setContents((prev) => [...prev, ...videoUrls]);
            }
          })
          .catch((error) => {
            console.error("Error fetching videos:", error);
          });

        if (winner === "true") {
          setShowSecretCard(true);
        }
      }
    }

    init();
  }, [fanMeetingId]);

  const generateThumbnails = (videoUrls) => {
    videoUrls.forEach((url) => {
      captureVideoFrame(url, 10, (blob) => {
        const thumbnailUrl = URL.createObjectURL(blob);
        setThumbnails((prevThumbnails) => ({
          ...prevThumbnails,
          [url]: thumbnailUrl,
        }));
      });
    });
  };

  useEffect(() => {
    // 썸네일 생성은 동영상 URL들이 로드된 후에만 수행됩니다.
    const videoUrls = contents.filter(
      (url) =>
        url !== null && url !== undefined && url !== "" && url.endsWith(".mp4"),
    );
    generateThumbnails(videoUrls);
  }, [contents]);

  const handleDownload = async (fileUrl) => {
    if (fileUrl === null || fileUrl === undefined || fileUrl === "") {
      return;
    }

    const {
      data: { type, arrayBuffer },
    } = await axios.get("/api/file", { params: { url: fileUrl } });

    const blob = await new Blob([Uint8Array.from(arrayBuffer)], { type });
    // <a> 태그의 href 속성값으로 들어갈 다운로드 URL
    const objectURL = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectURL;
    const fileName = fileUrl.endsWith(".mp4") ? "download.mp4" : "download.png";
    a.download = fileName; // 다운로드할 파일명 설정
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Optionally revoke the Object URL to free up resources
    URL.revokeObjectURL(objectURL);
  };

  const joinMemoryRoom = async () => {
    await router.push(`/my-page/${userName}/${fanMeetingId}`);
  };

  const shareTwitter = (imageUrl) => {
    const sendText = "💜 돌돌밋 공유";
    const sendUrl = imageUrl; // 이미지 URL
    window.open(
      `https://twitter.com/intent/tweet?text=${sendText}&url=${sendUrl}`,
    );
  };

  return (
    <Grid container alignItems={"center"}>
      <Grid item xs={5}>
        <Stack
          direction={"column"}
          justifyContent="flex-start"
          sx={{ marginLeft: 10 }}
        >
          <Typography
            variant={"h2"}
            sx={{
              zIndex: 300,
              lineHeight: 2,
              color: "#212121",
            }}
          >
            팬미팅이 종료되었습니다. <br />
            함께 찍은 사진과 영상을 공유해보세요 ☺️
          </Typography>
          <Button
            variant={"contained"}
            sx={{
              zIndex: 300,
              width: 200,
              height: 50,
              marginTop: 3,
              borderRadius: 3,
            }}
            endIcon={<ForwardIcon />}
          >
            <Typography
              variant={"button"}
              sx={{ letterSpacing: 1.5, fontWeight: 600, fontSize: 16 }}
              onClick={joinMemoryRoom}
            >
              추억보관함 가기
            </Typography>
          </Button>
        </Stack>
      </Grid>
      <Grid item xs={7}>
        <Carousel
          sx={{
            height: "70vh",
            minWidth: "40%",
          }}
          animation={"fade"}
          duration={1500}
        >
          {contents.map((url, index) => {
            if (url !== null && url !== undefined && url !== "") {
              const isVideo = url.endsWith(".mp4");
              return isVideo ? (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    height: "70vh",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                  onMouseOver={() => setIsHovering(true)}
                  onMouseOut={() => setIsHovering(false)}
                >
                  {isVideo ? (
                    <video
                      id={url}
                      key={index}
                      style={{
                        display: "flex",
                        width: "88%",
                        marginTop: "auto",
                        marginBottom: "auto",
                      }}
                      controls
                      poster={thumbnails[url]} // 썸네일 URL 사용
                    >
                      <source src={url} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={url}
                      alt={"banner"}
                      style={{
                        width: "88%",
                        maxHeight: "70vh",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <Stack
                    direction="row"
                    spacing={4}
                    sx={{
                      position: "absolute",
                      top: "45%",
                      left: "35%",
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      display: isHovering ? "flex" : "none",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "28%",
                      height: "12%",
                      borderRadius: 10,
                    }}
                  >
                    <IconButton
                      onClick={() => handleDownload(url)}
                      size="large"
                      sx={{
                        color: "#FFFFFF",
                        transform: "scale(1.5)",
                        "&:hover": {
                          color: "#FFAFCC",
                        },
                      }}
                    >
                      <GetApp fontSize={"inherit"} />
                    </IconButton>
                    <IconButton
                      onClick={() => shareTwitter(url)}
                      sx={{
                        color: "#FFFFFF",
                        transform: "scale(1.5)",
                        "&:hover": {
                          color: "#FFAFCC",
                        },
                      }}
                    >
                      <Twitter />
                    </IconButton>
                  </Stack>
                </div>
              ) : (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                  }}
                  onMouseOver={() => setIsHovering(true)}
                  onMouseOut={() => setIsHovering(false)}
                >
                  <img
                    key={index}
                    src={url}
                    alt={"banner"}
                    style={{
                      width: "88%",
                      maxHeight: "70vh",
                      objectFit: "cover",
                    }}
                  />
                  <Stack
                    direction="row"
                    spacing={4}
                    sx={{
                      position: "absolute",
                      top: "45%",
                      left: "35%",
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      display: isHovering ? "flex" : "none",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "28%",
                      height: "12%",
                      borderRadius: 10,
                    }}
                  >
                    <IconButton
                      onClick={() => handleDownload(url)}
                      size="large"
                      sx={{
                        color: "#FFFFFF",
                        transform: "scale(1.5)",
                        "&:hover": {
                          color: "#FFAFCC",
                        },
                      }}
                    >
                      <GetApp fontSize={"inherit"} />
                    </IconButton>
                    <IconButton
                      onClick={() => shareTwitter(url)}
                      sx={{
                        color: "#FFFFFF",
                        transform: "scale(1.5)",
                        "&:hover": {
                          color: "#FFAFCC",
                        },
                      }}
                    >
                      <Twitter />
                    </IconButton>
                  </Stack>
                </div>
              );
            }
          })}
        </Carousel>
      </Grid>
      {showSecretCard && (
        <Dialog
          open={showSecretCard}
          onClose={() => setShowSecretCard(false)}
          PaperProps={{
            style: {
              width: "550px", // 모달 창의 너비
              height: "700px", // 모달 창의 높이는 내용에 따라 자동 조정
              backgroundColor: "#fff", // 배경색
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", // 그림자 스타일
              // borderRadius: "20px", // 모달 창의 모서리 둥글게
              padding: "20px", // 내부 패딩
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <DialogContentText>
            <ScratchCard
              imageSrc="/majong.jpeg"
              brushSize={20}
              revealPercent={30}
            />
          </DialogContentText>
          <DialogTitle style={{ textAlign: "center" }}>
            🎉마종스 미공개 포카에 당첨되셨습니다.🎉
          </DialogTitle>
          <DialogContentText style={{ textAlign: "center" }}>
            마종스 미공개 포카를 확인하시려면 이미지를 스크래치 해주세요.
          </DialogContentText>
          <DialogContentText style={{ textAlign: "center", fontSize: "10px" }}>
            -당첨된 포카는 추억보관함에서 확인하실 수 있습니다.-
          </DialogContentText>
        </Dialog>
      )}
    </Grid>
  );
};

export default EndFanMeetingPage;
