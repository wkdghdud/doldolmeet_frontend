"use client";
import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { IconButton, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import useJwtToken from "@/hooks/useJwtToken";
import { WS_STOMP_URL } from "@/utils/api";
import ChatBalloon from "@/components/chat/ChatBalloon";
import { Box } from "@mui/system";

const ShowChat = ({ roomId }: { roomId: string | undefined }) => {
  const [message, setMessage] = useState<any>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sender, setSender] = useState<string | null>("");
  const [sock, setSock] = useState<any>(null);
  const [stompClient, setStompClient] = useState<any>(null);

  const messagesRef = useRef<HTMLElement | null>(null);
  const token = useJwtToken();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const initWebSocket = () => {
      const sock = new SockJS(WS_STOMP_URL);
      const stompClient = Stomp.over(sock);
      setStompClient(stompClient);

      stompClient.connect({}, (frame) => {
        // Subscribe
        stompClient.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
        // Send
        stompClient.send(
          "/pub/chat/message",
          {},
          JSON.stringify({ type: "ENTER", roomId: roomId, sender: sender }),
        );
      });

      return () => {
        stompClient.disconnect();
      };
    };

    if (roomId) {
      initWebSocket();
    }
  }, [roomId]);

  useEffect(() => {
    token.then((res) => {
      setUserId(res?.sub ?? "");
      setSender(res?.sub ?? "");
    });
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      sendMessage(event);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "500px",
        height: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 2,
      }}
    >
      <Box
        ref={messagesRef}
        sx={{
          width: "auto",
          height: "85%",
          overflowY: "auto",
          padding: 2,
        }}
      >
        {messages.map(
          (msg, index) =>
            msg.message &&
            msg.message.trim() !== "" && (
              <ChatBalloon
                key={index}
                sender={msg.sender}
                message={msg.message}
              />
            ),
        )}
      </Box>
      <TextField
        label="메시지 입력"
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleEnter}
        sx={{
          width: "95%",
          margin: "auto",
          marginTop: 1,
          marginBottom: 1,
          "& label": {
            color: "#bdbdbd",
          },
          "& label.Mui-focused": {
            color: "#ff8fab",
          },
          // focused color for input with variant='outlined'
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#eeeeee",
            },
            "&:hover fieldset": {
              borderColor: "#e0e0e0",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ff8fab",
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          ),
        }}
      />
    </Box>
  );
};

export default ShowChat;
