"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  const audio = new Audio("/mp3/game.mp3");

  useEffect(() => {
    if (showCountdownModal) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [showCountdownModal]);

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

  // useEffect(() => {
  //   let timer;
  //
  //   if (showGameModal && gameCountdown > 0) {
  //     timer = setTimeout(() => {
  //       setGameCountdown((prev) => prev - 1);
  //     }, 1000);
  //   }
  //   else if (gameCountdown === 0) {
  //     setShowGameModal(false); // 시간이 만료되면 모달을 닫습니다.
  //
  //     if (userChoice && partnerChoice) {
  //       if (userChoice === partnerChoice) {
  //         alert("둘의 마음이 통했습니다.!");
  //         setScore((prevScore) => prevScore + 1);
  //       }
  //
  //       else {
  //         alert("둘의 마음이 통하지 않았습니다.!");
  //       }
  //     }
  //   }
  //
  //   return () => clearTimeout(timer);
  // }, [showGameModal, gameCountdown, userChoice, partnerChoice]);

  useEffect(() => {
    // 게임이
    // 5초 지나면 정산
    let timer;

    // 타이머 실행
    if (showGameModal && gameCountdown > 0) {
      timer = setTimeout(() => {
        setGameCountdown((prev) => prev - 1);
      }, 1000);
    }

    // 시간 다되면 한 퀴즈에 대한 결과 보여주기
    else if (gameCountdown === 0) {
      if (userChoice && partnerChoice) {
        if (userChoice === partnerChoice) {
          alert("둘의 마음이 통했습니다.!");
          setScore((prevScore) => prevScore + 1);
        } else {
          alert("둘의 마음이 통하지 않았습니다.!");
        }
      }

      // 아직 문제 남았으면 다음 문제로 인덱스 변경
      if (currentQuizIndex < quizes.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1);
        // 시간 초기화
        setGameCountdown(5);
      }
      //마지막 문제였다면 게임 모달을 닫습니다.
      else {
        setShowGameModal(false);
        setGameCountdown(5);
        alert("결과창 띄워주기");
      }
    }

    return () => clearTimeout(timer);

    //
  }, [showGameModal, gameCountdown]);

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

    // 마지막 문제였다면 게임 모달을 닫습니다.
    // if (currentQuizIndex < quizes.length - 1) {
    // setCurrentQuizIndex(currentQuizIndex + 1);
    // } else {
    // setShowGameModal(false);
    // }
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
    </div>
  );
};

export default GameSecond;
