"use client";
import React, { useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Button } from "@mui/material";

const ShowChat = () => {
  const roomId = "ca37eb4e-2494-44c0-ae1a-7da8d45ef179";
  const sender = "park";

  const [message, setMessage] = useState("");

  const sock = new SockJS("http://localhost:8080/ws-stomp");
  const stompClient = Stomp.over(sock);
  let room = "";

  // axios.get("/chat/room/" + roomId).then((response) => {
  //   room = response.data;
  // });

  connect();

  function connect() {
    stompClient.connect(
      {},
      function (frame) {
        console.log("Connected: " + frame);

        // 특정 토픽 구독
        stompClient.subscribe(`/sub/chat/room/${roomId}`, function (message) {
          console.log("Received message: " + message.body);
          // 여기에서 수신한 메시지를 처리하는 로직을 추가할 수 있습니다.
        });
        stompClient.send(
          "/pub/chat/message",
          {},
          JSON.stringify({ type: "ENTER", roomId: roomId, sender: sender }),
        );
      },
      function (error) {
        console.log("Error: " + error);
      },
    );
  }

  return (
    <>
      <input type="text" />
      <Button
        onClick={() => {
          console.log(123);
        }}
      >
        클릭
      </Button>
    </>
  );
};

export default ShowChat;
