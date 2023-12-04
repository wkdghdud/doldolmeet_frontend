"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { backend_api, openvidu_api } from "@/utils/api";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";

interface Quiz {
  id: number;
  title: string;
  choice1: string;
  choice2: string;
}

interface Props {
  username: string;
  sessionId: string | null | undefined;
  role: string | undefined;
  partnerChoices: string[]; // 수정: 각 퀴즈별 상대방의 선택
  open: boolean;
}
const audioFileUrl = "/mp3/game.mp3";

const GameSecond = ({
  open,
  username,
  sessionId,
  role,
  partnerChoices,
}: Props) => {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [gameCountdown, setGameCountdown] = useState(5); // 게임 제한 시간
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizes, setQuizes] = useState<Quiz[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const audioRef = useRef(new Audio(audioFileUrl));

  useEffect(() => {
    if (showGameModal) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [showGameModal]);

  useEffect(() => {
    if (gameCountdown === 0) {
      handleNextQuiz();
    }
  }, [gameCountdown]);

  useEffect(() => {
    backend_api()
      .get(`/game/sameminds`)
      .then((res) => {
        setQuizes(res.data.data);
      });
  }, []);

  useEffect(() => {
    if (open) {
      startCountdown();
    }
  }, [open]);

  const startCountdown = () => {
    setShowCountdownModal(true);
    setCountdown(3);
    setGameCountdown(5);
  };

  useEffect(() => {
    let timer;
    if (showCountdownModal && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      clearInterval(timer);
      setShowCountdownModal(false);
      setShowGameModal(true);
    }
    return () => clearInterval(timer);
  }, [showCountdownModal, countdown]);

  const signalChoiceDetected = useCallback(
    async (choice) => {
      if (username !== "") {
        try {
          await openvidu_api.post(`/openvidu/api/signal`, {
            session: sessionId,
            type: "signal:choice_detected",
            data: JSON.stringify({
              choice: choice,
              username: username,
            }),
          });
        } catch (error) {
          console.error("Error sending signal", error);
        }
      }
    },
    [username, sessionId],
  );

  const handleUserChoice = (choice) => {
    signalChoiceDetected(choice);
    setUserChoice(choice);
    setSelectedChoices((prev) => [...prev, choice]);
    if (partnerChoices[currentQuizIndex] === choice) {
      setScore((prev) => prev + 1);
    }
    if (currentQuizIndex < quizes.length - 1) {
      setCurrentQuizIndex((index) => index + 1);
      setGameCountdown(5);
    } else {
      setShowGameModal(false);
      setShowResultModal(true);
    }
  };

  const handleNextQuiz = () => {
    const nextIndex = currentQuizIndex + 1;
    if (nextIndex < quizes.length) {
      setCurrentQuizIndex(nextIndex);
      setGameCountdown(5);
    } else {
      setShowGameModal(false);
      setShowResultModal(true);
    }
  };

  return (
    <div>
      {/* 카운트다운 모달 */}
      {showCountdownModal && (
        <Dialog open={showCountdownModal} maxWidth="sm" fullWidth>
          <DialogTitle>게임 시작 카운트다운</DialogTitle>
          <DialogContent>
            <Typography variant="h2" align="center">
              {countdown}초 후에 게임이 시작됩니다...
            </Typography>
          </DialogContent>
        </Dialog>
      )}

      {/* 게임 모달 */}
      {showGameModal && quizes.length > 0 && (
        <Dialog
          open={showGameModal}
          onClose={() => setShowGameModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{quizes[currentQuizIndex].title}</DialogTitle>
          <DialogContent>
            <div style={{ textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  handleUserChoice(quizes[currentQuizIndex].choice1)
                }
                sx={{ m: 1 }}
              >
                {quizes[currentQuizIndex].choice1}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() =>
                  handleUserChoice(quizes[currentQuizIndex].choice2)
                }
                sx={{ m: 1 }}
              >
                {quizes[currentQuizIndex].choice2}
              </Button>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                제한 시간: {gameCountdown}초
              </Typography>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowGameModal(false)}>게임 종료</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* 결과 모달 */}
      {showResultModal && (
        <Dialog
          open={showResultModal}
          onClose={() => setShowResultModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>게임 결과</DialogTitle>
          <DialogContent>
            {quizes.map((quiz, index) => (
              <Paper key={quiz.id} sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6">{quiz.title}</Typography>
                <Typography
                  sx={{
                    color:
                      selectedChoices[index] === quiz.choice1 ? "green" : "red",
                  }}
                >
                  당신의 선택: {selectedChoices[index]}
                </Typography>
                <Typography
                  sx={{
                    color:
                      partnerChoices[index] === quiz.choice1 ? "green" : "red",
                  }}
                >
                  상대방의 선택: {partnerChoices[index]}
                </Typography>
              </Paper>
            ))}
            <Typography variant="h5" sx={{ mt: 2, textAlign: "center" }}>
              총 점수: {score}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResultModal(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default GameSecond;
