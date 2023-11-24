"use client";
import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Button, Paper, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import useJwtToken from "@/hooks/useJwtToken";
import { WS_STOMP_URL } from "@/utils/api";

const ShowChat = () => {
  const roomId = "460d7533-6db5-4486-b75c-89f28159cf6d";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sender, setSender] = useState<string | null>("");
  const [sock, setSock] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  const messagesRef = useRef(null);
  const token = useJwtToken();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setSock(
      new SockJS(WS_STOMP_URL, null, {
        transports: ["websocket"],
        withCredentials: true,
      }),
    );
  }, []);

  useEffect(() => {
    if (sock) {
      setStompClient(Stomp.over(sock));
    }
  }, [sock]);

  useEffect(() => {
    token.then((res) => {
      setUserId(res?.sub ?? "");
      setSender(res?.sub ?? "");
    });
  }, [token]);

  useEffect(() => {
    connect();

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [stompClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connect = () => {
    if (stompClient) {
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
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (stompClient && message && message.trim() !== "") {
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
  };

  const scrollToBottom = () => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      sendMessage(event);
    }
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
          {messages.map(
            (msg, index) =>
              msg.message &&
              msg.message.trim() !== "" && (
                <li key={index} style={{ marginBottom: "8px" }}>
                  <Typography variant="body1" style={{ fontWeight: "bold" }}>
                    {msg.sender}: {msg.message}
                  </Typography>
                </li>
              ),
          )}
        </ul>
      </Paper>
      <Paper
        elevation={3}
        style={{ padding: "20px", maxWidth: "400px", width: "100%" }}
      >
        <div style={{ display: "flex" }}>
          <TextField
            label="메시지 입력"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
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
