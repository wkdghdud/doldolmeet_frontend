import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import { Button, Grid, IconButton, Paper, Typography } from "@mui/material";
import { GetApp, Twitter } from "@mui/icons-material";
import GradientButton from "@/components/GradientButton";

const EndFanMeetingPage = () => {
  const router = useRouter();
  const { userName, fanMeetingId } = router.query;
  const [user, setUser] = useState(null);
  const [captures, setCaptures] = useState([]);

  const s3Addr = "https://s3.ap-northeast-2.amazonaws.com/doldolmeet.test/";

  const joinMemoryRoom = async () => {
    await router.push(`/my-page/${userName}/${fanMeetingId}`);
  };

  useEffect(() => {
    // fanMeetingId가 유효한 경우에만 API 호출 수행
    if (fanMeetingId && fanMeetingId !== "undefined") {
      backend_api()
        .get(`/captures/${fanMeetingId}`)
        .then((res) => {
          setCaptures(res.data.data);
        })
        .catch((error) => {
          console.error("Error fetching captures:", error);
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

  const shareTwitter = (imageUrl) => {
    const sendText = "이미지 공유";
    const sendUrl = imageUrl; // 이미지 URL
    window.open(
      `https://twitter.com/intent/tweet?text=${sendText}&url=${sendUrl}`,
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h1" align="center" gutterBottom>
          팬미팅이 종료되었습니다.
        </Typography>
        <GradientButton
          variant="contained"
          disableElevation
          sx={{ px: 3, borderRadius: 10 }}
          onClick={joinMemoryRoom}
        >
          추억 보관함
        </GradientButton>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h2" align="center" gutterBottom>
          녹화된 영상
        </Typography>
        <Grid container spacing={1}>
          {captures.length > 0 /* Todo: captures를 videos로 변경해야됨 */ ? (
            captures.map((cap, i) => (
              <Grid item xs={6} sm={6} key={i}>
                <Paper elevation={3} style={{ padding: "10px" }}>
                  <div>
                    <video width="100%" controls>
                      <source
                        src="https://youngeui-in-jungle.store/openvidu/recordings/b563a3d2-2300-412a-b7ca-b06b0df972ea/b563a3d2-2300-412a-b7ca-b06b0df972ea.mp4"
                        // src={`https://youngeui-in-jungle.store/openvidu/recordings/${cap.videoId}/${cap.videoId}.mp4`}
                        type="video/mp4"
                      />
                    </video>
                    <IconButton onClick={() => imgDownLoad(cap.captureUrl)}>
                      <GetApp />
                    </IconButton>
                    <IconButton
                      onClick={() => shareTwitter(s3Addr + cap.captureUrl)}
                    >
                      <Twitter />
                    </IconButton>
                  </div>
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">
              No captures found for this fanMeetingId.
            </Typography>
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h2" align="center" gutterBottom>
          캡쳐된 이미지
        </Typography>
        <Grid container spacing={1}>
          {captures.length > 0 ? (
            captures.map((cap, i) => (
              <Grid item xs={6} sm={6} key={i}>
                <Paper elevation={3} style={{ padding: "10px" }}>
                  <div>
                    {/*<Typography variant="body1">*/}
                    {/*  Capture ID: {cap.captureId}*/}
                    {/*</Typography>*/}
                    <div>
                      <img
                        src={s3Addr + cap.captureUrl}
                        alt={`Capture ${i}`}
                        style={{
                          width: "100%",
                          height: "auto",
                          marginBottom: "33px",
                          maxHeight: "150px",
                        }}
                      />
                      <IconButton onClick={() => imgDownLoad(cap.captureUrl)}>
                        <GetApp />
                      </IconButton>
                      <IconButton
                        onClick={() => shareTwitter(s3Addr + cap.captureUrl)}
                      >
                        <Twitter />
                      </IconButton>
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">
              No captures found for this fanMeetingId.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default EndFanMeetingPage;
