"use client";
import React, { useState, useEffect } from "react";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import { Button, Dialog, Grid, Paper, Typography } from "@mui/material";
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
  const correctAnswer = "마종스 - 하입 보이";
  const [timeLeft, setTimeLeft] = useState(5); // 5초 제한 시간

  //가사보고 노래 맞추기 게임
  const [showQuizGame, setShowQuizGame] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [firstGameCompleted, setFirstGameCompleted] = useState(false);

  const quizQuestions = [
    {
      question: "ㄴㄱ ㅁㄷ ㅋㅋ?",
      options: [
        "마종스 - 쿠키",
        "마종스 - 슈퍼샤이",
        "마종스 - 디토",
        "마종스 - 하입 보이",
      ],
      answer: "마종스 - 쿠키",
    },
    // 추가 문제들...
  ];

  useEffect(() => {
    if (!showGameModal && firstGameCompleted) {
      setShowQuizGame(true);
    }
  }, [showGameModal, firstGameCompleted]);

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
      setFirstGameCompleted(false);
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
      setFirstGameCompleted(true);
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
      {showGameModal && (
        <Dialog open={showGameModal} PaperComponent={Paper}>
          <Grid
            container
            spacing={2}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <Grid item>
              <Typography variant="h5" gutterBottom>
                노래 맞추기 게임
              </Typography>
            </Grid>
            <Grid item>
              <Typography gutterBottom>남은 시간: {timeLeft}초</Typography>
            </Grid>
            <Grid item container spacing={1}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleSubmit("마종스 - 최애의 아이돌")}
                >
                  마종스 - 최애의 아이돌
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => handleSubmit("마종스 - 쿠키")}
                >
                  마종스 - 쿠키
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => handleSubmit("마종스 - 하입 보이")}
                >
                  마종스 - 하입 보이
                </Button>
              </Grid>
            </Grid>
            <Grid item>
              <Typography>현재 점수: {score}</Typography>
            </Grid>
          </Grid>
        </Dialog>
      )}

      {showQuizGame && (
        <Dialog open={showQuizGame} PaperComponent={Paper}>
          <Grid
            container
            spacing={2}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <Grid item>
              <Typography variant="h5" gutterBottom>
                퀴즈 게임
              </Typography>
            </Grid>
            <Grid item>
              <Typography gutterBottom>
                {quizQuestions[quizQuestionIndex].question}
              </Typography>
            </Grid>
            {quizQuestions[quizQuestionIndex].options.map((option, index) => (
              <Grid item xs={12} key={index}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuizAnswer(option)}
                >
                  {option}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Dialog>
      )}
    </div>
  );
};

export default Game;
