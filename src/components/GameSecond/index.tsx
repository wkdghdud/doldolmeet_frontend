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
  const [quizes, setQuizes] = useState({});

  useEffect(() => {
    backend_api()
      .get(`/game/sameminds`)
      .then((res) => {
        setQuizes(res.data);
        console.log("😈😈😈😈😈😈😈", res.data);
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
      {showGameModal && (
        <Dialog
          open={showGameModal}
          onClose={() => setShowGameModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>이심전심 게임</DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 2, my: 2, textAlign: "center" }}>
              {options.map((option) => (
                <Button
                  key={option}
                  variant="contained"
                  color="primary"
                  onClick={() => handleUserChoice(option)}
                  sx={{ m: 1 }}
                >
                  {option}
                </Button>
              ))}
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                제한 시간 {gameCountdown}초 안에 골라주세요 !
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
