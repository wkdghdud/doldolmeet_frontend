"use client";
import React, { useState, useEffect, useCallback } from "react";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { backend_api, openvidu_api } from "@/utils/api";
import GradientButton from "@/components/GradientButton";
import { Role } from "@/types";

interface Props {
  username: string;
  sessionId: string | null | undefined;
  open: boolean;
  handleclose: () => void;
  fanMeetingId: string | undefined | null;
  role: string | undefined | null;
  replaynum: number;
  clickAnswer: number;
}

const Game = ({
  open,
  handleclose,
  fanMeetingId,
  role,
  username,
  sessionId,
  replaynum,
  clickAnswer,
}: Props) => {
  //첫번째 노래 맞추기 게임
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const correctAnswer = "마종스 - 하입 보이";
  const [timeLeft, setTimeLeft] = useState(500); // 5초 제한 시간

  //가사보고 노래 맞추기 게임
  const [showQuizGame, setShowQuizGame] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [firstGameCompleted, setFirstGameCompleted] = useState(false);

  const [musicTime, setMusicTime] = useState(false);

  const [resultGameModal, setResultGameModal] = useState(false);

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
          if (prevTime === 5) {
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

  //게임 시작 카운트 다운
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

  const send_replay = useCallback(async () => {
    if (username !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:send_replay",
        data: JSON.stringify({
          username: username,
        }),
      });
    }
  }, [username, sessionId]);

  const handleAnswer = useCallback(
    async (isAnswer) => {
      if (username !== "") {
        await openvidu_api.post(`/openvidu/api/signal`, {
          session: sessionId,
          type: "signal:click_answer",
          data: JSON.stringify({
            username: username,
            isAnswer: isAnswer,
          }),
        });
        setResultGameModal(true);
        // setShowQuizGame(true);
      }
    },
    [username, sessionId],
  );

  useEffect(() => {
    if (clickAnswer === 1) {
      alert("정답을 맞췄습니다!");
      setScore(score + 1);
      setResultGameModal(true);
      setFirstGameCompleted(true);
      handleclose();
      backend_api()
        .post(`/fanMeetings/${fanMeetingId}/gameScore`)
        .then((res) => {
          console.log(res);
        });
      setShowGameModal(false); // 게임 모달 닫기
    } else if (clickAnswer === -1) {
      alert("틀렸습니다.");
      setResultGameModal(true);
    }
  }, [clickAnswer]);

  useEffect(() => {
    if (replaynum >= 1) {
      audio.play();
      setTimeout(() => {
        audio.pause();
      }, 1000);
    }
  }, [replaynum]);

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
            {role === Role.IDOL && (
              <>
                <GradientButton onClick={send_replay}>
                  다시 들려주기
                </GradientButton>
                <GradientButton onClick={() => handleAnswer(1)}>
                  정답
                </GradientButton>
                <GradientButton onClick={() => handleAnswer(-1)}>
                  오답
                </GradientButton>
              </>
            )}
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

      {resultGameModal && (
        <Dialog open={resultGameModal}>
          <DialogTitle>노래 맞추기 게임 결과</DialogTitle>
          <DialogContent>
            <Typography variant="h2" align="center" sx={{ my: 5 }}>
              정답은 : 마종스 하입보이였습니다.
            </Typography>
            <Typography variant="h2" align="center" sx={{ my: 5 }}>
              {score}점을 획득하셨습니다!
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Game;
