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
  TextField,
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
  const [showCountdownModal2, setShowCountdownModal2] = useState(false);

  //띵곡 받아쓰기 게임
  const [lyricsInput, setLyricsInput] = useState("");
  const [isLyricsCorrect, setIsLyricsCorrect] = useState(false);
  const audio2 = new Audio("/mp3/idolsong2.mp3");
  const audio3 = new Audio("/mp3/startgame.mp3");
  const lyrics = [
    "I'm super shy, super shy",
    "But wait a minute while I make you mine make you mine",
    "떨리는 지금도 you're on my mind all the time",
    "I wanna tell you but I'm super shy, super shy",
    "이 부분 가사를 받아쓰기 해 주세요!",
  ];
  const [lyricsIndex, setLyricsIndex] = useState(0);

  const handleLyricsChange = (e) => {
    setLyricsInput(e.target.value);
  };

  const checkLyrics = () => {
    // 여기서는 예시로 간단한 문자열 비교를 사용합니다
    // 실제로는 더 정교한 비교 로직이 필요할 수 있습니다
    if (lyricsInput.trim() === "I'm super shy, super shy") {
      setIsLyricsCorrect(true);
      setScore(score + 1);
      alert("정답입니다!");
    } else {
      alert("틀렸습니다.");
    }
  };

  useEffect(() => {
    if (showQuizGame) {
      // 노래 시작
      audio2.play();

      // 13초 후에 노래 멈추고 게임 시작 효과음 재생
      const pauseMusicTimeout = setTimeout(() => {
        audio2.pause();
        audio3.play();

        // 게임 시작 효과음 재생 완료 후 노래 재개 (효과음 재생 시간을 고려하여 설정)
        setTimeout(() => {
          audio2.currentTime = 13; // 노래를 13초 지점부터 다시 시작
          audio2.play();
        }, 3000); // 예를 들어 게임 시작 효과음이 3초간 재생된다고 가정
      }, 13000); // 노래가 13초 동안 재생되었다고 가정

      // lyricsChangeAfter 로직은 그대로 유지
      lyricsChangeAfter(2000, 3000, 4000);

      return () => {
        clearTimeout(pauseMusicTimeout);
        audio2.pause();
        audio3.pause();
        audio2.currentTime = 0;
        audio3.currentTime = 0;
      };
    }
  }, [showQuizGame]);

  const lyricsChangeAfter = (first, second, third) => {
    setTimeout(() => {
      setLyricsIndex(1);
    }, first);

    setTimeout(() => {
      setLyricsIndex(2);
    }, first + second);

    setTimeout(
      () => {
        setLyricsIndex(3);
      },
      first + second + third,
    );

    setTimeout(
      () => {
        setLyricsIndex(4);
      },
      first + second + third + 3000,
    );
  };

  // const quizQuestions = [
  //   {
  //     question: "ㄴㄱ ㅁㄷ ㅋㅋ?",
  //     options: [
  //       "마종스 - 쿠키",
  //       "마종스 - 슈퍼샤이",
  //       "마종스 - 디토",
  //       "마종스 - 하입 보이",
  //     ],
  //     answer: "마종스 - 쿠키",
  //   },
  //   // 추가 문제들...
  // ];

  // const handleQuizAnswer = (option) => {
  //   if (option === quizQuestions[quizQuestionIndex].answer) {
  //     alert("정답입니다!");
  //   } else {
  //     alert("틀렸습니다!");
  //   }
  //   if (quizQuestionIndex < quizQuestions.length - 1) {
  //     setQuizQuestionIndex(quizQuestionIndex + 1);
  //   } else {
  //     setShowQuizGame(false); // 마지막 문제이면 퀴즈 게임 종료
  //     handleclose(); // 게임 전체를 종료
  //   }
  // };

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
            // setCountdown(3);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
  }, [open]);

  useEffect(() => {
    if (resultGameModal) {
      setTimeout(() => {
        setResultGameModal(false);
        setShowCountdownModal2(true);
      }, 3000);
    }
  }, [resultGameModal]);

  useEffect(() => {
    if (showCountdownModal2) {
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount === 1) {
            clearInterval(timer);
            setShowCountdownModal2(false);
            setShowQuizGame(true);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
  }, [showCountdownModal2]);

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
        setFirstGameCompleted(true);
        setShowGameModal(false); // 게임 모달 닫기
        // setShowCountdownModal2(true);
        setResultGameModal(true);
      }
    },
    [username, sessionId],
  );

  useEffect(() => {
    if (firstGameCompleted) {
      // 첫 번째 게임이 완료되면 count를 3으로 다시 설정
      setCountdown(3);
    }
  }, [firstGameCompleted]);

  useEffect(() => {
    if (clickAnswer === 1) {
      // alert("정답을 맞췄습니다!");
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
      // alert("틀렸습니다.");
      setShowGameModal(false); // 게임 모달 닫기
      setShowCountdownModal2(true);
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
      {showCountdownModal2 && (
        <Dialog open={showCountdownModal2}>
          <DialogTitle>띵곡 받아 쓰기 게임 시작</DialogTitle>
          <DialogContent>
            <Typography variant="h2" align="center" sx={{ my: 5 }}>
              {countdown}초 후에 게임이 시작됩니다...
            </Typography>
          </DialogContent>
        </Dialog>
      )}
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
        <Dialog open={showQuizGame} PaperComponent={Paper} sx={{ p: 3 }}>
          <DialogTitle>띵곡 받아쓰기 게임</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} direction="column" alignItems="center">
              <Grid item>
                <TextField
                  fullWidth
                  label="가사를 입력하세요"
                  variant="outlined"
                  value={lyricsInput}
                  onChange={handleLyricsChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  현재 가사:
                  <Typography
                    component="span"
                    sx={{
                      color:
                        lyricsIndex === lyrics.length - 1 ? "red" : "inherit", // 마지막 가사의 내용일 때만 빨간색으로 설정
                    }}
                  >
                    {lyrics[lyricsIndex]}
                  </Typography>
                </Typography>
                {lyricsIndex < lyrics.length - 1 && (
                  <Typography variant="subtitle1" gutterBottom>
                    다음 가사: {lyrics[lyricsIndex + 1]}
                  </Typography>
                )}
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={checkLyrics}
                  sx={{ mt: 2, mb: 1, fontSize: "1rem" }}
                >
                  가사 제출
                </Button>
              </Grid>
              <Grid item>
                <Typography variant="h5" sx={{ color: "secondary.main" }}>
                  현재 점수: {score}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}

      {resultGameModal && (
        <Dialog open={resultGameModal}>
          <DialogTitle>노래 맞추기 게임 결과</DialogTitle>
          <DialogContent>
            {clickAnswer === 1 && (
              <Typography variant="h2" align="center" sx={{ my: 5 }}>
                맞았습니다 .정답은 : 마종스 하입보이였습니다.
              </Typography>
            )}
            {clickAnswer === -1 && (
              <Typography variant="h2" align="center" sx={{ my: 5 }}>
                틀렸습니다.정답은 : 마종스 하입보이였습니다.
              </Typography>
            )}
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
