"use client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useJwtToken from "@/hooks/useJwtToken";
import { backend_api } from "@/utils/api";
import {
  Typography,
  CircularProgress,
  Button,
  Grid,
  CardHeader,
  IconButton,
  CardContent,
  CardActions,
  Collapse,
  Tabs,
  Tab,
} from "@mui/material";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import CardMedia from "@mui/material/CardMedia";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import { marginBottom } from "html2canvas/dist/types/css/property-descriptors/margin";

const MyPageDetail = () => {
  const router = useRouter();
  const { userName, fanMeetingId } = router.query;
  const [user, setUser] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("photos");
  const [videos, setVideos] = useState<string[]>([]);

  const token = useJwtToken();

  const s3Addr = "https://s3.ap-northeast-2.amazonaws.com/doldolmeet.test/";

  useEffect(() => {
    // 사용자 정보 가져오기
    token.then((res) => {
      setUser(res);
    });
  }, []);

  useEffect(() => {
    // 사용자 정보가 로드되면 권한 검사 수행
    if (user && user.sub !== userName) {
      // 주인이 아니면 리다이렉션 또는 에러 처리
      router.push("/error-page"); // 또는 다른 페이지로 리다이렉션
    }
  }, [user, userName, router]);

  useEffect(() => {
    // fanMeetingId가 유효한 경우에만 API 호출 수행
    if (fanMeetingId && fanMeetingId !== "undefined") {
      backend_api()
        .get(`/captures/${fanMeetingId}`)
        .then((res) => {
          setCaptures(res.data.data);
          setLoading(false); // 데이터 로딩 완료
        })
        .catch((error) => {
          console.error("Error fetching captures:", error);
          setLoading(false); // 에러 발생 시에도 로딩 완료
        });
    }
  }, [fanMeetingId]);

  const imgDownLoad = (imgUrl) => {
    const fileName = imgUrl;

    // Axios를 사용하여 파일 다운로드 요청
    backend_api()
      .get(`s3/file/download?fileName=${fileName}`, {
        responseType: "blob", // 파일 다운로드를 위해 responseType을 'blob'으로 설정
      })
      .then((response) => {
        // 파일 다운로드를 위해 Blob 형식으로 받은 응답을 처리
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);

        // 생성된 URL을 사용하여 다운로드 링크 생성
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);

        // 링크 클릭하여 파일 다운로드
        document.body.appendChild(link);
        link.click();

        // 필요 없는 링크 제거
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleChange = (event, newValue: string) => {
    setValue(newValue);
  };

  const [title, setTitle] = useState<string>("");
  const [fanMeetingTime, setFanMeetingTime] = useState("");

  useEffect(() => {
    async function getFanMeetingTitle() {
      if (!fanMeetingId || fanMeetingId === "undefined") {
        return;
      }
      try {
        const response = await backend_api().get(
          `/fanMeetings/${fanMeetingId}`,
        );
        setTitle(response?.data.data.title);
        setFanMeetingTime(response?.data.data.startTime);
      } catch (error) {
        console.error("Error fetching fan meeting details:", error);
      }
    }

    getFanMeetingTitle();
  }, [fanMeetingId]);

  useEffect(() => {
    async function getVideos() {
      if (
        userName &&
        userName !== undefined &&
        fanMeetingId &&
        fanMeetingId !== "undefined"
      ) {
        await backend_api()
          .post(`recording-java/api/recordings/get`, {
            fanMeetingId: fanMeetingId,
            fan: userName,
            // idol: "karina",
          })
          .then((res) => {
            setVideos(res.data);
          })
          .catch((error) => {
            console.error("Error fetching videos:", error);
          });
      }
    }

    getVideos();
  }, [fanMeetingId]);

  const formatDate = (dateTimeString) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };
    return new Date(dateTimeString).toLocaleDateString("ko-KR", options);
  };

  return (
    <Grid>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          alignItems="center"
          sx={{
            backgroundSize: "cover",
            width: "100%",
            height: "120px",
            borderRadius: "10px",
            position: "relative",
            backgroundImage: `url('/banner.jpeg')`,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: 800,
              position: "absolute",
              textAlign: "center",
              width: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            여러분과 함께한 추억은 영원히 간직될 것입니다.
          </Typography>
          {/*<Typography variant="body1" sx={{ fontSize: "1rem" }}>*/}
          {/*  {title}*/}
          {/*</Typography>*/}
        </Box>
        <Box sx={{ marginBottom: "1%" }}>
          <Tabs value={value} onChange={handleChange} centered>
            <Tab value="photos" label="사진" />
            <Tab value="videos" label="동영상" />
          </Tabs>
        </Box>
        <Grid
          container
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          {value === "photos"
            ? captures.map((cap, i) => (
                <Grid key={i} item xs={12} sm={6} md={4}>
                  <Card
                    sx={{ width: "100%", maxWidth: 500, minHeight: "100%" }}
                  >
                    <CardHeader
                      title={cap.captureId}
                      subheader={formatDate(fanMeetingTime)}
                    />
                    <CardMedia
                      component="img"
                      height="320vh"
                      image={s3Addr + cap.captureUrl}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                      alt=""
                    />
                  </Card>
                </Grid>
              ))
            : Object.values(videos).map((video, i) => (
                <Grid key={i} item xs={12} sm={6} md={4}>
                  <Card sx={{ maxWidth: 700 }}>
                    <CardHeader
                      // title={video.url}
                      subheader={formatDate(fanMeetingTime)}
                    />
                    <video
                      id={video.url}
                      style={{
                        display: "flex",
                        width: "100%",
                        marginTop: "auto",
                        marginBottom: "auto",
                      }}
                      controls
                      // poster={thumbnails[video.url]} // 썸네일 URL 사용
                    >
                      <source src={video.url} type="video/mp4" />
                    </video>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MyPageDetail;
