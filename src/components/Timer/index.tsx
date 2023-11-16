import { useEffect, useState } from "react";

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

  useEffect(() => {
    const countDownUntilZero = () => {
      setTime((prevTime) => {
        if (prevTime <= 0 && index <= exitValue) {
          handleTimeout();
          setIndex(index + 1);
          setTime(TIME_IN_MILISECONDS_TO_COUNTDOWN);
          setReferenceTime(Date.now());
          return 0;
        }

        const now = Date.now();
        const interval = now - referenceTime;
        setReferenceTime(now);
        return prevTime - interval > 0 ? prevTime - interval : 0;
      });
    };

    setTimeout(countDownUntilZero, INTERVAL_IN_MILISECONDS);
  }, [time]);

  return <>{(time / 1000).toFixed(0)}s</>;
};

export default Timer;
