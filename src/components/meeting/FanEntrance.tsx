import { Stack, TextField, Typography } from "@mui/material";
import GradientButton from "@/components/GradientButton";
import { useEffect, useState } from "react";

interface Props {
  joinSession: () => void;
}

const FanEntrance = ({ joinSession }: Props) => {
  const [userName, setUserName] = useState(Math.floor(Math.random() * 100));

  const fetchSSE = () => {
    const eventSource = new EventSource(
      "http://localhost:8080/sse/" + userName,
    );

    eventSource.onopen = () => {
      console.log("연결되었습니다.");
    };

    eventSource.onmessage = async (e) => {
      const res = await e.data;
      // const parsedData = JSON.parse(res);
      console.log("데이터가 도착했습니다.");
      // console.log(parsedData);
      joinSession();

      // 받아오는 data로 할 일
      // eventSource.close();
    };

    eventSource.onerror = (e: any) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("error");
      console.log(e);
      eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };
  };

  useEffect(() => {
    console.log("let met see");
    fetchSSE();
  }, []);

  return (
    <>
      <Typography variant={"h2"}>‍🥰 난 팬~ 영상통화 들어가기</Typography>
      <Stack spacing={2} sx={{ marginTop: 3 }}>
        <TextField
          placeholder={"닉네임"}
          onChange={(e) => setUserName(e.target.value)}
        >
          {userName}
        </TextField>
        <GradientButton
          onClick={joinSession}
          sx={{ padding: 1, py: 2, borderRadius: 2 }}
        >
          <Typography variant={"button"} sx={{ fontWeight: 800 }}>
            입장하기
          </Typography>
        </GradientButton>
      </Stack>
    </>
  );
};

export default FanEntrance;
