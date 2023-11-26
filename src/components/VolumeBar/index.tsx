import { Box } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";

const VolumeBar = ({ volume }: { volume: number }) => {
  const n = 8;
  const gapHeight = 0.4;
  const videoHeight = 420;

  const barHeight = videoHeight / n - gapHeight; // 볼륨 바의 높이 계산

  const bars = Array.from({ length: n }, (_, index) => {
    const isColored = volume / 8 > 7 - index;

    return (
      <Box
        key={index}
        sx={{
          width: "100%",
          height: `${barHeight}px`, // 비디오 세로 크기에 따라 높이 조정
          borderRadius: "5rem",
          backgroundColor: isColored ? "#4ADE80" : "rgba(255, 255, 255, 0.3)",
          marginBottom: index === n - 1 ? 0 : `${gapHeight}px`,
        }}
      />
    );
  });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "0.4rem",
          backgroundColor: "#FFF",
          padding: "0.5rem",
          borderRadius: "0.5rem",
        }}
      >
        {bars}
      </Box>
    </Box>
  );
};

export default VolumeBar;
