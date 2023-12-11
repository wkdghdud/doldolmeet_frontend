"use client";
import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {
  IconButton,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import useJwtToken from "@/hooks/useJwtToken";
import { WS_STOMP_URL } from "@/utils/api";
import ChatBalloon from "@/components/chat/ChatBalloon";
import { Box } from "@mui/system";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useAtom } from "jotai/react";
import { languageTargetAtom } from "@/atom";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const SUPPORTED_TARGETS = [
  { code: "ja", label: "Japanese" },
  { code: "en", label: "English" },
  { code: "zh-CN", label: "Chinese" },
  { code: "ko", label: "Korean" },
];

const ShowChat = ({ roomId }: { roomId: string | undefined }) => {
  const [message, setMessage] = useState<any>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sender, setSender] = useState<string | null>("");
  const [imgUrl, setImgUrl] = useState<string | undefined>("");

  const [stompClient, setStompClient] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const messagesRef = useRef<HTMLElement | null>(null);
  const token = useJwtToken();

  const [langTarget, setLangTarget] = useAtom(languageTargetAtom);

  useEffect(() => {
    const initWebSocket = async () => {
      if (stompClient && subscription) return;

      const sock = new SockJS(WS_STOMP_URL);
      const _stompClient = Stomp.over(sock);
      setStompClient(_stompClient);

      await _stompClient.connect({}, async (frame) => {
        // Subscribe
        const _subscription = _stompClient.subscribe(
          `/sub/chat/room/${roomId}`,
          (message) => {
            const receivedMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          },
        );
        setSubscription(_subscription);
        console.log("💚 subcribe: ", roomId);

        // Send
        await _stompClient.send(
          "/pub/chat/message",
          {},
          JSON.stringify({
            type: "ENTER",
            roomId: roomId,
            sender: sender,
          }),
        );
      });

      return () => {
        subscription.unsubscribe();
        _stompClient.disconnect();
      };
    };

    if (roomId) {
      initWebSocket();
    }

    // 정리 함수
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (stompClient) {
        stompClient.disconnect();
        setStompClient(null);
      }
    };
  }, [roomId]);

  useEffect(() => {
    token.then((res) => {
      setSender(res?.sub ?? "");
      setImgUrl(res?.profileImgUrl ?? "");
    });
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!stompClient || !message.trim()) return;

    const newMessage = message.trim();
    stompClient.send(
      "/pub/chat/message",
      {},
      JSON.stringify({
        type: "TALK",
        roomId: roomId,
        sender: sender,
        message: newMessage,
        profileImg: imgUrl,
      }),
    );

    setMessage("");
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
        position: "relative",
      }}
    >
      {/* 번역 언어 선택 박스 */}
      <FormControl
        sx={{
          position: "absolute",
          left: "65%",
          minWidth: 120,
          mt: 3,
          zIndex: 1,
        }}
        size="small"
      >
        {/* 언어 선택용 Select */}
        <Select
          labelId="demo-select-small-label"
          id="demo-select-small"
          value={langTarget}
          onChange={(e) => setLangTarget(e.target.value)}
          style={{ textAlign: "center" }}
        >
          <MenuItem disabled value="">
            <em>언어 선택</em>
          </MenuItem>
          {SUPPORTED_TARGETS.map((item) => (
            <MenuItem
              key={item.code}
              value={item.code}
              sx={{ textAlign: "right" }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 채팅 메시지 출력 부분 */}
      <Box
        ref={messagesRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          marginTop: "45px", // 조정 필요
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
                isLanaguage={langTarget}
                profile={msg.profileImg}
              />
            ),
        )}
      </Box>

      {/* 메시지 입력 창 */}
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
