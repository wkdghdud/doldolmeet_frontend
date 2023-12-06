"use client";

import React, { useCallback, useEffect, useState } from "react";
import { backend_api, openvidu_api } from "@/utils/api";
import { Role } from "@/types";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import GradientButton from "@/components/GradientButton";

interface Props {
  fanMeetingId: string | undefined | null;
  sessionId: string | undefined | null;
  allIdolEntered: boolean;
  userName: string | undefined | null;
  replaynum: number;
  gameStart: boolean;
  role: string | undefined;
}

const SingGamePage = ({
  allIdolEntered,
  sessionId,
  fanMeetingId,
  replaynum,
  userName,
  role,
  gameStart,
}: Props) => {
  const [showAllIdolEnteredmodal, setShowAllIdolEnteredmodal] =
    useState<boolean>(false);
  const [showGameModal, setShowGameModal] = useState<boolean>(false);
  const [showGameResultModal, setShowGameResultModal] =
    useState<boolean>(false);
  const [notshowAllIdolEnteredmodal, setnotShowAllIdolEnteredmodal] =
    useState(true);
  const [gameButtonActive, setGameButtonActive] = useState<boolean>(false);

  /* 정답맞춘사람 */
  const [winner, setWinner] = useState<string | undefined | null>();

  /* 정답 확인 */
  const isAnswer = "내 루돌프";
  const [answer, setAnswer] = useState("");
  /* audio */
  const audio = new Audio("/mp3/idolsong1.mp3");

  useEffect(() => {
    if (showGameModal) {
      audio.play();
    }
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [showGameModal]);

  /* 다시 들려 주기 관련 */
  const send_replay = useCallback(async () => {
    if (userName !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:send_replay",
        data: JSON.stringify({
          username: userName,
        }),
      });
    }
  }, [userName, sessionId]);

  useEffect(() => {
    if (replaynum >= 1) {
      audio.play();
      setTimeout(() => {
        audio.pause();
      }, 1000);
    }
  }, [replaynum]);

  //만약 아이돌이 다들어왔으면 다 들어왔다고 모달창 띄우기
  useEffect(() => {
    if (allIdolEntered) {
      setShowAllIdolEnteredmodal(true);
      setGameButtonActive(true);
    }
  }, [allIdolEntered]);

  //아이돌이 다 왔다는 모달을 2초만 띄워주고 닫음
  useEffect(() => {
    if (showAllIdolEnteredmodal) {
      setTimeout(() => {
        setShowAllIdolEnteredmodal(false);
      }, 2000);
    }
  }, [showAllIdolEnteredmodal]);

  //모든 참가자들한테 게임 시작 시그널 보내기
  const startGame = useCallback(async () => {
    if (userName !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:gameStart",
        data: JSON.stringify({
          username: userName,
        }),
      });
    }
  }, [userName, sessionId]);

  useEffect(() => {
    if (gameStart) {
      setShowGameModal(true);
    }
  }, [gameStart]);

  //정답 제출
  const handleSubmit = (userAnswer) => {
    if (userAnswer === isAnswer) {
      alert("정답을 맞췄습니다!");
      setWinner(userName);
    } else {
      alert("틀렸습니다.");
    }
  };

  return (
    <Stack
      direction={"row"}
      spacing={1}
      justifyContent={"center"}
      alignItems={"center"}
      sx={{
        width: "100%",
        height: "38vh",
        backgroundColor: "#eeeeee",
        py: 2,
        px: 1,
        borderRadius: 5,
      }}
    >
      <Box sx={{ width: "100%", px: 2 }}>
        <Typography variant={"h3"} textAlign={"center"}>
          🎧 지금 나오는 노래의 제목을 맞춰주세요
        </Typography>
        {role === Role.IDOL && gameButtonActive && (
          <>
            <GradientButton onClick={startGame}>
              게임 시작 버튼 활성화
            </GradientButton>
            <GradientButton onClick={send_replay}>다시 들려주기</GradientButton>
          </>
        )}
      </Box>
      {showGameModal && (
        <Stack
          direction={"column"}
          spacing={1}
          alignItems={"center"}
          justifyContent={"center"}
          sx={{ width: "100%", px: 2, margin: "auto" }}
        >
          <Button
            variant={"contained"}
            startIcon={<LooksOneIcon />}
            sx={{ width: "50%" }}
          >
            내 루돌프
          </Button>
          <Button
            variant={"contained"}
            startIcon={<LooksTwoIcon />}
            sx={{ width: "50%" }}
          >
            Attention
          </Button>
          <Button
            variant={"contained"}
            startIcon={<Looks3Icon />}
            sx={{ width: "50%" }}
          >
            Dynamite
          </Button>
          <TextField
            label="노래 제목 입력"
            variant="outlined"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            sx={{ width: "50%" }}
          />
          <Button
            variant="contained"
            onClick={() => handleSubmit(answer)}
            sx={{ width: "50%", mt: 2 }}
          >
            정답 제출
          </Button>
        </Stack>
      )}
      {showAllIdolEnteredmodal && (
        <Dialog open={showAllIdolEnteredmodal}>
          <DialogContent>
            <Typography variant="h2" align="center" sx={{ my: 5 }}>
              아이돌 도착
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </Stack>
  );
};

export default SingGamePage;
