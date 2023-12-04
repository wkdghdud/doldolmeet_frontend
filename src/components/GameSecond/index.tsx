"use client";

import React, { useCallback, useEffect, useState } from "react";
import { openvidu_api } from "@/utils/api";
import { Role } from "@/types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  const options = ["짜장", "짬뽕"];
  const [gameCountdown, setGameCountdown] = useState(5); // 게임 제한 시간
  const decisionTimeLimit = 5; // 제한 시간 (5초)

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
          alert("정답을 맞췄습니다!");
          setScore((prevScore) => prevScore + 1);
        } else {
          alert("다른 것을 선택했습니다!");
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
    // if (choice === partnerChoice) {
    //   alert("정답을 맞췄습니다!");
    //   setScore(score + 1);
    //   setShowGameModal(false);
    // }
  };

  return (
    <div>
      {showCountdownModal && (
        <Dialog open={showCountdownModal}>
          <DialogTitle>게임 시작 카운트다운</DialogTitle>
          <DialogContent>
            <h2>{countdown}초 후에 게임이 시작됩니다...</h2>
          </DialogContent>
        </Dialog>
      )}

      {showGameModal && (
        <Dialog open={showGameModal} onClose={() => setShowGameModal(false)}>
          <DialogTitle>이심전심 게임</DialogTitle>
          <DialogContent>
            <div>
              {options.map((option, idx) => (
                <button key={option} onClick={() => handleUserChoice(option)}>
                  {option}
                </button>
              ))}
            </div>
            <p>제한 시간: {gameCountdown}초</p>
          </DialogContent>
          <DialogActions>
            <div>
              <p>당신의 선택: {userChoice}</p>
              <p>아이돌의 선택: {partnerChoice}</p>
              <p>점수: {score}</p>
            </div>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default GameSecond;
