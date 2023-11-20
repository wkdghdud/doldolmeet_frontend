"use client";
import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Button, Paper, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ShowChat = () => {
  const roomId = "11beccc3-7712-4238-bc89-39aa442c353c";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sender, setSender] = useState<string | null>("");
  const sock = new SockJS("http://localhost:8080/ws-stomp");
  const stompClient = Stomp.over(sock);

  useEffect(() => {
    connect();
  }, []);

  function connect() {
    stompClient.connect(
      {},
      function (frame) {
        stompClient.subscribe(`/sub/chat/room/${roomId}`, function (message) {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          console.log(messages);
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

  function sendMessage(e) {
    e.preventDefault();
    stompClient.send(
      "/pub/chat/message",
      {},
      JSON.stringify({
        type: "TALK",
        roomId: roomId,
        sender: sender,
        message: message,
      }),
    );
    setMessage("");
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          maxWidth: "600px",
          width: "100%",
          height: "40%",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h4" gutterBottom>
          채팅방
        </Typography>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((msg, index) => (
            <li key={index} style={{ marginBottom: "8px" }}>
              <Typography variant="body1" style={{ fontWeight: "bold" }}>
                {msg.sender}: {msg.message}
              </Typography>
            </li>
          ))}
        </ul>
      </Paper>
      <Paper
        elevation={3}
        style={{ padding: "20px", maxWidth: "600px", width: "100%" }}
      >
        <div style={{ display: "flex" }}>
          <TextField
            label="아이디"
            variant="outlined"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <TextField
            label="메시지 입력"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={sendMessage}
          >
            전송
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default ShowChat;
