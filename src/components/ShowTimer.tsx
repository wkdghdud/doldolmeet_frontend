import React, { useState, useEffect } from "react";
import { LinearProgress, Stack } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";

const LinearTimerBar = () => {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => (prevSeconds > 1 ? prevSeconds - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const progressStyle = {
    width: "100%",
    height: 10,
    borderRadius: 10,
  };

  return (
    <div style={{ width: "40%" }}>
      {seconds <= 10 && (
        <Stack
          direction={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          spacing={2}
        >
          {seconds <= 10 ? (
            seconds % 2 === 1 ? (
              <HourglassBottomIcon sx={{ color: "#FFAFCC" }} />
            ) : (
              <HourglassTopIcon sx={{ color: "#FFAFCC" }} />
            )
          ) : null}
          <LinearProgress
            variant="determinate"
            value={(seconds / 10) * 100}
            sx={progressStyle}
          />
        </Stack>
      )}
    </div>
  );
};

export default LinearTimerBar;
