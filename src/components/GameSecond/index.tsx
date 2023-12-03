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
}

const GameSecond = ({ username, sessionId, role, partnerChoice }: Props) => {
  const [userChoice, setUserChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const options = ["짜장", "짬뽕"];

  const signalChoiceDetected = useCallback(
    async (choice) => {
      console.log("🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶", username);
      if (username !== "") {
        await openvidu_api.post(`/openvidu/api/signal`, {
          session: sessionId,
          type: "signal:choice_detected",
          data: JSON.stringify({
            choice: choice,
            username: username,
          }),
        });
        if (role === Role.FAN) {
          setUserChoice(choice);
        }
      }
    },
    [username, sessionId, role],
  );

  const handleUserChoice = (choice) => {
    signalChoiceDetected(choice);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (partnerChoice !== undefined) {
      setIsModalOpen(true); // 파트너의 선택이 있으면 모달을 엽니다.
    }
  }, [partnerChoice]);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>이심전심 게임 시작</button>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>이심전심 게임</DialogTitle>
        <DialogContent>
          <div>
            {options.map((option, idx) => (
              <button key={option} onClick={() => handleUserChoice(option)}>
                {option}
              </button>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <div>
            <p>당신의 선택: {userChoice}</p>
            <p>아이돌의 선택: {partnerChoice}</p>
            <p>점수: {score}</p>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GameSecond;
