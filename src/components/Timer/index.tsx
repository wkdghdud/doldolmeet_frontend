import { useEffect, useState } from "react";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { openvidu_api } from "@/utils/api";

const TIME_IN_MILISECONDS_TO_COUNTDOWN = 10 * 1000;
const INTERVAL_IN_MILISECONDS = 100;

interface Props {
  exitValue: number;
  handleTimeout: () => void;
}

const Timer = ({ handleTimeout, exitValue }: Props) => {
  const [time, setTime] = useState(TIME_IN_MILISECONDS_TO_COUNTDOWN);
  const [referenceTime, setReferenceTime] = useState(Date.now());
  const [index, setIndex] = useState(0);
  const [hasAlert, setHasAlert] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  useEffect(() => {
    const secondsLeft = (time / 1000).toFixed(0);

    if (secondsLeft === "10" && !hasAlert) {
      setSnackbarOpen(true);
      setHasAlert(true);

      openvidu_api
        .post(
          "/openvidu/api/signal", // TODO: URL 수정 필요
          {
            session: "Session_A", // TODO: 세션 아이디를 props로 받도록 수정 필요
            type: "signal_timeout",
            data: "This is my signal data",
          },
        )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.error(error));
    }

    const countDownUntilZero = () => {
      setTime((prevTime) => {
        if (prevTime <= 0 && index <= exitValue) {
          handleTimeout();
          setIndex(index + 1);
          setTime(TIME_IN_MILISECONDS_TO_COUNTDOWN);
          setReferenceTime(Date.now());
          setHasAlert(false);
          return 0;
        }

        const now = Date.now();
        const interval = now - referenceTime;
        setReferenceTime(now);
        return prevTime - interval > 0 ? prevTime - interval : 0;
      });
    };

    const intervalId = setInterval(countDownUntilZero, INTERVAL_IN_MILISECONDS);

    return () => clearInterval(intervalId); // Cleanup function to clear the interval when the component unmounts
  }, [time]);

  return (
    <>
      <p>{(time / 1000).toFixed(0)}s</p>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: 8 }}
      >
        <Alert
          icon={<NotificationsActiveIcon fontSize="inherit" />}
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          variant="filled"
          sx={{ width: "100%" }}
        >
          <AlertTitle>팬미팅이 종료되기까지 10초가 남았어요!</AlertTitle>
          아쉽지만 통화를 마무리할 준비를 해주세요.
        </Alert>
      </Snackbar>
    </>
  );
};

export default Timer;
