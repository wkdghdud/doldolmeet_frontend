"use client";
import React, { useState, useEffect } from "react";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import { Dialog } from "@mui/material";
import { backend_api } from "@/utils/api";

interface Props {
  open: boolean;
  handleclose: () => void;
  fanMeetingId: string | undefined | null;
}

const Game = ({ open, handleclose, fanMeetingId }: Props) => {
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const correctAnswer = "최애의 아이돌";

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

  // 정답 제출 함수
  const handleSubmit = (answer) => {
    if (answer === correctAnswer) {
      alert("정답을 맞췄습니다!");
      setScore(score + 1);
      handleclose();
      backend_api()
        .post(`/fanMeetings/${fanMeetingId}/gameScore`)
        .then((res) => {
          console.log(res);
        });
      setShowGameModal(false); // 게임 모달 닫기
    } else {
      alert("틀렸습니다.");
    }
  };

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

  return (
    <div>
      {showCountdownModal && (
        <Dialog open={showCountdownModal}>
          <h2>{countdown}초 후에 노래 맞추기 게임이 시작됩니다...</h2>
        </Dialog>
      )}

      {showGameModal && (
        <Dialog open={showGameModal}>
          <DialogActions>
            <div>
              <h1>노래 맞추기 게임</h1>
              <div className="modal">
                <button onClick={() => handleSubmit("최애의 아이돌")}>
                  최애의 아이돌
                </button>
                <button onClick={() => handleSubmit("다른 선택지")}>
                  다른 선택지
                </button>
                <button onClick={() => handleSubmit("다른 선택지")}>
                  다른 선택지
                </button>
              </div>
              <p>현재 점수: {score}</p>
            </div>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Game;
