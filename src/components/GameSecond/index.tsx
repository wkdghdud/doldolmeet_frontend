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
  partnerChoice: string | null | undefined;
  open: boolean;
}
const audioFileUrl = "/mp3/game.mp3";

const GameSecond = ({
  open,
  username,
  sessionId,
  role,
  partnerChoice,
}: Props) => {
  const [userChoice, setUserChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  // const options = ["짜장", "짬뽕"];
  const [gameCountdown, setGameCountdown] = useState(5); // 게임 제한 시간
  const decisionTimeLimit = 5; // 제한 시간 (5초)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0); // 현재 문제 인덱스
  const [quizes, setQuizes] = useState<Quiz[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<string[] | undefined>(
    [],
  );
  const [showResultModal, setShowResultModal] = useState(false);
  const audioRef = useRef(new Audio(audioFileUrl));

  useEffect(() => {
    // 게임 모달이 열릴 때마다 오디오를 재생합니다.
    if (showGameModal) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [showGameModal]);

  useEffect(() => {
    // 제한 시간이 만료되면 다음 문제로 이동하거나 결과 모달을 표시합니다.
    if (gameCountdown === 0) {
      const nextIndex = currentQuizIndex + 1;
      setSelectedChoices((prev) => [...prev, userChoice]); // 사용자 선택 기록
      if (nextIndex < quizes.length) {
        setCurrentQuizIndex(nextIndex); // 다음 문제로 이동
        setGameCountdown(5); // 시간 초기화
      } else {
        setShowGameModal(false); // 게임 모달 닫기
        setShowResultModal(true); // 결과 모달 열기
      }
    }
  }, [gameCountdown, currentQuizIndex, quizes.length, userChoice]);

  useEffect(() => {
    backend_api()
      .get(`/game/sameminds`)
      .then((res) => {
        setQuizes(res.data.data); // data 프로퍼티에 접근하여 상태를 업데이트합니다.
      });
  }, []);

  useEffect(() => {
    if (open) {
      setShowCountdownModal(true);
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount === 1) {
            clearInterval(timer);
            setShowCountdownModal(false);
            setShowGameModal(true);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
  }, [open]);

  useEffect(() => {
    let timer;
    if (showGameModal && gameCountdown > 0) {
      timer = setTimeout(() => {
        setGameCountdown((prev) => prev - 1);
      }, 1000);
    } else if (gameCountdown === 0) {
      setShowGameModal(false); // 시간이 만료되면 모달을 닫습니다.
      if (userChoice && partnerChoice) {
        if (userChoice === partnerChoice) {
          alert("둘의 마음이 통했습니다.!");
          setScore((prevScore) => prevScore + 1);
        } else {
          alert("둘의 마음이 통하지 않았습니다.!");
        }
      }
    }
    return () => clearTimeout(timer);
  }, [showGameModal, gameCountdown, userChoice, partnerChoice]);

  const signalChoiceDetected = useCallback(
    async (choice) => {
      if (username !== "") {
        await openvidu_api.post(`/openvidu/api/signal`, {
          session: sessionId,
          type: "signal:choice_detected",
          data: JSON.stringify({
            choice: choice,
            username: username,
          }),
        });
        setUserChoice(choice);
        setTimeout(() => {
          if (partnerChoice === choice) {
            setScore((prevScore) => prevScore + 1);
          }
        }, decisionTimeLimit * 1000);
      }
    },
    [username, sessionId, role, partnerChoice],
  );

  const handleUserChoice = (choice) => {
    signalChoiceDetected(choice);
    setUserChoice(choice);

    // 현재 문제에 대한 처리가 끝났다면 다음 문제로 넘어갑니다.
    // 마지막 문제였다면 게임 모달을 닫습니다.
    if (currentQuizIndex < quizes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setShowGameModal(false);
    }
  };

  return (
    <div>
      {/* 카운트다운 모달 */}
      {showCountdownModal && (
        <Dialog open={showCountdownModal}>
          <DialogTitle>게임 시작 카운트다운</DialogTitle>
          <DialogContent>
            <Typography variant="h2" align="center" sx={{ my: 5 }}>
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
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>이심전심 게임</DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 2, my: 2, textAlign: "center" }}>
              {/* 현재 인덱스의 문제를 렌더링합니다. */}
              <div key={quizes[currentQuizIndex].id}>
                <Typography variant="h6">
                  {quizes[currentQuizIndex].title}
                </Typography>
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
              </div>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                제한 시간 {gameCountdown}초 안에 골라주세요!
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Typography variant="h6" sx={{ mx: "auto" }}>
              점수: {score}
            </Typography>
          </DialogActions>
        </Dialog>
      )}
      {/* 결과 모달 */}
      {showResultModal && (
        <Dialog
          open={showResultModal}
          onClose={() => setShowResultModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>게임 결과</DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              {quizes.map((quiz, index) => (
                <div key={quiz.id}>
                  <Typography variant="h6">{quiz.title}</Typography>
                  <Typography
                    sx={{
                      color:
                        selectedChoices[index] === quiz.choice1
                          ? "green"
                          : "red",
                    }}
                  >
                    당신의 선택: {selectedChoices[index]}
                  </Typography>
                  <Typography
                    sx={{
                      color: partnerChoice === quiz.choice1 ? "green" : "red",
                    }}
                  >
                    상대방의 선택: {partnerChoice}
                  </Typography>
                </div>
              ))}
            </Paper>
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
