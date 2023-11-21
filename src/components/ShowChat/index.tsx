"use client";
import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Button, Paper, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ShowChat = () => {
  const roomId = "460d7533-6db5-4486-b75c-89f28159cf6d";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sender, setSender] = useState<string | null>("");
  const sock = new SockJS("https://api.doldolmeet.shop/ws-stomp", null, {
    transports: ["websocket"],
    withCredentials: true,
  });
  const stompClient = Stomp.over(sock);

  const messagesRef = useRef(null);

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages change
    scrollToBottom();
  }, [messages]);

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

  const scrollToBottom = () => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          maxWidth: "400px",
          width: "100%",
          height: "65vh", // Increase the height here
          marginBottom: "20px",
        }}
      >
        <Typography variant="h4" gutterBottom>
          채팅방
        </Typography>
        <ul ref={messagesRef} style={{ overflowY: "auto", maxHeight: "500px" }}>
          {" "}
          {/* Adjust maxHeight here */}
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
        style={{ padding: "20px", maxWidth: "400px", width: "100%" }}
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
