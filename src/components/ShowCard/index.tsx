import { Card, CardContent, IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";
import CardMedia from "@mui/material/CardMedia";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";

interface Props {
  title: string;
  date: string;
}

export default function ShowCard({ title, date }: Props) {
  return (
    <Card sx={{ display: "flex", justifyContent: "center" }}>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image="https://image.jtbcplus.kr/data/contents/ham_photo/202309/01/5a6c79d0-b93e-423e-be69-ce10fcd55bc6.jpg"
        alt="Live from space album cover"
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography component="div" variant="h5">
            {title}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            {date}
          </Typography>
        </CardContent>
        <Box sx={{ display: "flex", alignItems: "center", pl: 1, pb: 1 }}>
          <IconButton aria-label="previous">
            <SkipNextIcon />
          </IconButton>
          <IconButton aria-label="play/pause">
            <PlayArrowIcon sx={{ height: 38, width: 38 }} />
          </IconButton>
          <IconButton aria-label="next">
            <SkipNextIcon />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
