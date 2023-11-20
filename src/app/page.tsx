"use client";
import Banner from "@/components/Banner";
import { Button, Grid, Stack, Typography, Box } from "@mui/material";
import ForwardIcon from "@mui/icons-material/Forward";
import { useMeetings } from "@/hooks/useMeetings";
import GradientButton from "@/components/GradientButton";
import PostCard, { Post } from "@/components/PostCard";
import ShowDialog from "../components/ShowDialog";
import { useEffect, useState } from "react";
import axios from "axios";
export default function Home() {
  const { data } = useMeetings(1);

  const [isFanMeeting, setIsFanMeeting] = useState<boolean>(true);

  // useEffect(() => {
  //   // Home 컴포넌트가 실행되면 백엔드 서버에서 데이터를 가져온다. axios
  // }, []);

  const post: Post = {
    cover: "/cover_1.jpeg",
    title: "정국 GOLDEN 발매 기념 팬미팅",
    view: 100,
    comment: 100,
    share: 100,
    author: {
      name: "홍영의",
      avatarUrl: "/singer_1.jpeg",
    },
    createdAt: "05 Mar 2023",
  };

  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoomId = localStorage.getItem("wschat.roomId");
      if (storedRoomId) {
        setRoomId(storedRoomId);
      }
    }
  }, []);

  const [room, setRoom] = useState({});

  // const [sender, setSender] = useState(
  //     localStorage.getItem("wschat.sender") || "",
  // );
  // const [message, setMessage] = useState("");
  // const [messages, setMessages] = useState([]);
  // const [ws, setWs] = useState(null);
  // const [reconnect, setReconnect] = useState(0);
  //

  const name = "abcabc001";

  const moveWaitingRoom = (e) => {
    e.preventDefault();

    axios
      .post(
        "http://localhost:8080/chat/room",
        { name },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        console.log(response);
        // setRoom(response.data);
      })
      .catch((error) => {
        console.error(error.message);
        // setError(error.message);
      });
  };

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      maxWidth="lg"
      spacing={2}
    >
      <Grid item xs={12} sx={{ marginTop: 1 }}>
        <Banner />
      </Grid>

      {isFanMeeting && (
        <Grid item xs={12}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{
              marginTop: 4,
              bgcolor: "yellow",
              height: "120px",
              borderRadius: "10px",
            }}
          >
            <Typography variant="h3" sx={{ color: "#ed6ea0", fontWeight: 800 }}>
              팬미팅 예정
            </Typography>
            <GradientButton
              variant="contained"
              endIcon={<ForwardIcon />}
              borderRadius={"10px"}
              onClick={moveWaitingRoom}
            >
              MY PAGE 입장
            </GradientButton>
          </Stack>
        </Grid>
      )}

      <Grid item xs={12}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ marginTop: 2 }}
        >
          <Typography variant="h3" sx={{ color: "#ed6ea0", fontWeight: 800 }}>
            OPEN
          </Typography>
          <GradientButton
            variant="contained"
            endIcon={<ForwardIcon />}
            borderRadius={"10px"}
          >
            전체보기
          </GradientButton>
        </Stack>
      </Grid>
      {data?.map((meeting, i) => (
        <Grid key={i} item xs={3}>
          <PostCard post={post} index={1} />
        </Grid>
      ))}
      <ShowDialog />
    </Grid>
  );
}
