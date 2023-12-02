"use client";
import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Button, IconButton, MenuItem, Select, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import useJwtToken from "@/hooks/useJwtToken";
import { backend_api, WS_STOMP_URL } from "@/utils/api";
import ChatBalloon from "@/components/chat/ChatBalloon";
import { Box } from "@mui/system";
import { Theme, useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";

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
const names = [
  "Oliver Hansen",
  "Van Henry",
  "April Tucker",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder",
];

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const SUPPORTED_TARGETS = [
  { code: "ja", label: "Japanese" },
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
];
const ShowChat = ({ roomId }: { roomId: string | undefined }) => {
  const [message, setMessage] = useState<any>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sender, setSender] = useState<string | null>("");
  const [sock, setSock] = useState<any>(null);
  const [stompClient, setStompClient] = useState<any>(null);
  const [text, setText] = useState("");

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

  const [target, setTarget] = useState("ko"); // 기본값은 "ko"
  const toggleTarget = () => {
    // 현재 target의 인덱스를 찾아서 다음 target으로 변경
    const currentIndex = SUPPORTED_TARGETS.findIndex(
      (item) => item.code === target,
    );
    const nextIndex = (currentIndex + 1) % SUPPORTED_TARGETS.length;
    setTarget(SUPPORTED_TARGETS[nextIndex].code);
  };

  const theme = useTheme();
  const [personName, setPersonName] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
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
      <Select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        variant="standard"
        style={{ marginTop: "8px" }}
      >
        {SUPPORTED_TARGETS.map((item) => (
          <MenuItem key={item.code} value={item.code}>
            {item.label}
          </MenuItem>
        ))}
      </Select>

      <div>
        <FormControl sx={{ m: 1, width: 300, mt: 3 }}>
          <Select
            displayEmpty
            value={personName}
            onChange={handleChange}
            input={<OutlinedInput />}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <em>Placeholder</em>;
              }

              return selected.join(", ");
            }}
            MenuProps={MenuProps}
            inputProps={{ "aria-label": "Without label" }}
          >
            <MenuItem disabled value="">
              <em>Placeholder</em>
            </MenuItem>
            {names.map((name) => (
              <MenuItem
                key={name}
                value={name}
                style={getStyles(name, personName, theme)}
              >
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

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
                isLanaguage={target}
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
      {/*<Button onClick={toggleTarget}>Toggle Target</Button>*/}
    </Box>
  );
};

export default ShowChat;
