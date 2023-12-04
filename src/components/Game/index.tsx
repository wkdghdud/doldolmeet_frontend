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
  //첫번째 노래 맞추기 게임
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const correctAnswer = "최애의 아이돌";
  const [timeLeft, setTimeLeft] = useState(5); // 5초 제한 시간

  //가사보고 노래 맞추기 게임
  const [showQuizGame, setShowQuizGame] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);

  const quizQuestions = [
    {
      question: "React는 어떤 종류의 라이브러리인가요?",
      options: ["데이터베이스", "UI", "보안", "네트워킹"],
      answer: "UI",
    },
    // 추가 문제들...
  ];

  useEffect(() => {
    if (!showGameModal && open) {
      setShowQuizGame(true);
    }
  }, [showGameModal, open]);

  const handleQuizAnswer = (option) => {
    if (option === quizQuestions[quizQuestionIndex].answer) {
      alert("정답입니다!");
    } else {
      alert("틀렸습니다!");
    }
    if (quizQuestionIndex < quizQuestions.length - 1) {
      setQuizQuestionIndex(quizQuestionIndex + 1);
    } else {
      setShowQuizGame(false); // 마지막 문제이면 퀴즈 게임 종료
      handleclose(); // 게임 전체를 종료
    }
  };

  // 제한 시간 카운트다운 로직
  useEffect(() => {
    let timer;
    if (showGameModal) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 1) {
            clearInterval(timer);
            alert("시간 초과!");
            handleclose();
            setShowGameModal(false); // 게임 모달 닫기
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [showGameModal]);
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
              <p>남은 시간: {timeLeft}초</p>
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
      {showQuizGame && (
        <Dialog open={showQuizGame}>
          <DialogActions>
            <div>
              <h1>퀴즈 게임</h1>
              <p>{quizQuestions[quizQuestionIndex].question}</p>
              {quizQuestions[quizQuestionIndex].options.map((option, index) => (
                <button key={index} onClick={() => handleQuizAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Game;
