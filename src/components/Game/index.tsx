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
  const [isModalOpen, setIsModalOpen] = useState(true); // 모달 상태
  const [score, setScore] = useState(0); // 점수
  const correctAnswer = "최애의 아이돌"; // 정답

  // 정답 제출 함수
  const handleSubmit = (answer) => {
    if (answer === correctAnswer) {
      alert("정답을 맞췄습니다!"); // 정답 알림
      setScore(score + 1); // 점수 증가
      handleclose();
      backend_api()
        .post(`/fanMeetings/${fanMeetingId}/gameScore`)
        .then((res) => {
          console.log(res);
        });
    } else {
      alert("틀렸습니다."); // 오답 알림
    }
  };

  const audio = new Audio("/mp3/idolsong1.mp3");

  useEffect(() => {
    if (open) {
      audio.play();
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogActions>
        <div>
          <h1>노래 맞추기 게임</h1>
          <div className="modal">
            {/*<audio src={`/mp3/idolsong1.mp3`} controls autoPlay muted />*/}
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
  );
};

export default Game;
