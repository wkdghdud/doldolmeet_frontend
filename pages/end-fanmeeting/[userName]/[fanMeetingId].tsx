"use client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AWS_S3_URL, backend_api } from "@/utils/api";
import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import { GetApp, Twitter } from "@mui/icons-material";
import Carousel from "react-material-ui-carousel";
import axios from "axios";
import ForwardIcon from "@mui/icons-material/Forward";

const EndFanMeetingPage = () => {
  /* route query */
  const router = useRouter();
  const { userName, fanMeetingId } = router.query;

  /* States */
  const [contents, setContents] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    async function init() {
      if (
        userName &&
        userName !== undefined &&
        fanMeetingId &&
        fanMeetingId !== "undefined"
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
      }
    }

    init();
  }, [fanMeetingId]);

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
            if (url !== null || url !== undefined || url !== "") {
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
                  >
                    <source src={url} type="video/mp4" />
                  </video>
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
      <div
        style={{
          backgroundImage: "url('/album_poster.jpg')",
          position: "absolute",
          top: 0,
          width: "100vw",
          height: "100vh",
        }}
      />
    </Grid>
  );
};

export default EndFanMeetingPage;
