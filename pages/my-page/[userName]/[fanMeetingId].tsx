"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useJwtToken from "@/hooks/useJwtToken";
import { backend_api } from "@/utils/api";
import { Typography, CircularProgress, Button } from "@mui/material";

const MyPageDetail = () => {
  const router = useRouter();
  const { userName, fanMeetingId } = router.query;
  const [user, setUser] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useJwtToken();

  const s3Addr = "https://s3.ap-northeast-2.amazonaws.com/doldolmeet.test/";

  useEffect(() => {
    // 사용자 정보 가져오기
    token.then((res) => {
      setUser(res);
    });
  }, [token]);

  useEffect(() => {
    // 사용자 정보가 로드되면 권한 검사 수행
    if (user && user.sub !== userName) {
      // 주인이 아니면 리다이렉션 또는 에러 처리
      router.push("/error-page"); // 또는 다른 페이지로 리다이렉션
    }
  }, [user, userName]);

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

  return (
    <div>
      <Typography variant="h1">My Page Detail</Typography>
      <Typography variant="body1">UserName: {userName}</Typography>
      <Typography variant="body1">FanMeetingId: {fanMeetingId}</Typography>
      {/* 페이지 컨텐츠 */}
      {loading ? (
        <CircularProgress /> // 로딩 중일 때 로딩 스피너 표시
      ) : // fanMeetingId에 따라 가져온 captures를 매핑하여 표시
      captures.length > 0 ? (
        captures.map((cap, i) => (
          <div key={i}>
            <Typography variant="body1">Capture ID: {cap.captureId}</Typography>
            <Typography variant="body1">
              Capture Name:{" "}
              <Button onClick={() => imgDownLoad(cap.captureUrl)}>
                {s3Addr + cap.captureUrl}
              </Button>
            </Typography>
            {/* 다른 필요한 속성들을 추가로 표시 */}
          </div>
        ))
      ) : (
        <Typography variant="body1">
          No captures found for this fanMeetingId.
        </Typography>
      )}
    </div>
  );
};

export default MyPageDetail;
