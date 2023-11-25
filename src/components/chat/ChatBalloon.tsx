import React, { useMemo } from "react";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import SmallAvatar from "@/components/avatar/SmallAvatar";

export default function ChatBalloon({
  sender,
  message,
  profile,
}: {
  sender: string;
  message: any;
  profile?: string;
}) {
  const createMarkup = useMemo(() => {
    return (text) => {
      const youtubeRegex =
        /(https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
      const replacedText = text.replace(
        youtubeRegex,
        '<iframe width="100%" height="auto" src="https://www.youtube.com/embed/$2" frameborder="0" allowfullscreen></iframe>',
      );

      const imageRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|gif|jpeg))/g;
      const finalText = replacedText.replace(
        imageRegex,
        '<img src="$1" alt="Image" style="max-width: 100%; height: auto;">',
      );

      return { __html: finalText };
    };
  }, []);

  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={0.5}
      sx={{ width: "auto", marginBottom: 1 }}
    >
      <SmallAvatar imgSrc={profile} />
      <Stack direction="column">
        <Typography variant="caption" sx={{ color: "#9e9e9e", marginLeft: 1 }}>
          {sender}
        </Typography>
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: 3,
            maxWidth: "260px",
          }}
        >
          <Typography
            variant="subtitle1"
            style={{ wordWrap: "break-word" }}
            dangerouslySetInnerHTML={createMarkup(message)}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
