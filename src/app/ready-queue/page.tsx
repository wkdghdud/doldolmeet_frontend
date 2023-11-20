"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Typography } from "@mui/material";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "http://43.201.87.133:8080/"
    : "http://localhost:8080/";

const ReadyQueue = () => {
  const [waiters, setWaiters] = useState<any[]>([]);

  // 세션 생성 후 토큰 획득하기
  const getToken = async () => {
    const token = await createToken("Session_A");
    setWaiters((prev) => [...prev, token]);
  };

  /*
   * Token 생성
   * 참여자가 세션에 접속하려면 토큰이 반드시 필요하다.
   * 토큰은 Connection을 생성함으로써 획득할 수 있다.
   * 토큰은 참여자에 대한 metadata를 제공할 수 있다.
   * */
  const createToken = async (sessionId) => {
    /*
     * Connection:
     * 커넥션은 세션에 참여하고 있는 하나의 참여자를 의미한다.
     * 이 커넥션은 application server (즉, 우리의 Spring 서버)에서 초기화되어야 한다.
     * 그리고 커넥션을 초기화해서 생성된 application client (즉, 우리의 React 프론트)에 전달되어야 한다.
     * 이 토큰은 unauthorized 사용자가 세션에 접속하지 못하도록 막아준다.
     * 한 번 커넥션을 획득한 클라이언트는 쭉 세션의 참여자로 인식된다.
     * */
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  };

  useEffect(() => {
    // 10초 간격으로 함수 실행
    const intervalId = setInterval(getToken, 5000);

    // 컴포넌트가 언마운트될 때 clearInterval 호출하여 메모리 누수 방지
    return () => clearInterval(intervalId);
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 마운트될 때만 실행되도록 함

  useEffect(() => {
    console.log(waiters); // 업데이트된 배열 확인
  }, [waiters]);
  return (
    <div style={{ marginTop: 100 }}>
      {waiters.map((waiter) => (
        <Typography key={waiter}>{waiter}</Typography>
      ))}
    </div>
  );
};

export default ReadyQueue;
