import React, { useEffect, useMemo, useState } from "react";
import { Button, Divider, Typography, MenuItem, Select } from "@mui/material";
import { Box, Stack } from "@mui/system";
import SmallAvatar from "@/components/avatar/SmallAvatar";
import { backend_api } from "@/utils/api";

const SUPPORTED_TARGETS = [
  { code: "ja", label: "Japanese" },
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
];

export default function ChatBalloon({
  sender,
  message,
  profile,
  isLanaguage,
}: {
  sender: string;
  message: any;
  profile?: string;
  isLanaguage: string;
}) {
  const createMarkup = useMemo(() => {
    return (text) => {
      const youtubeRegex =
        /https:\/\/www\.youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
      const replacedText = text.replace(
        youtubeRegex,
        '<iframe width="100%" height="auto" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>',
      );

      const imageRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|gif|jpeg|webp))/g;
      const finalText = replacedText.replace(
        imageRegex,
        '<img src="$1" alt="Image" style="max-width: 100%; height: auto;">',
      );

      return { __html: finalText };
    };
  }, []);

  const [text, setText] = useState("");
  const [showDivider, setShowDivider] = useState(false);
  const [target, setTarget] = useState("ko"); // 기본값은 "ko"

  const handleChat = () => {
    backend_api()
      .post(`/translate?target=${isLanaguage}`, {
        text: message,
      })
      .then((res) => {
        setText(res.data.translatedText);
        setShowDivider(true); // 버튼 클릭 시 Divider 보이기
      });
  };

  useEffect(() => {
    console.log("@@@@@@@@@@@@@@@@@@", profile);
  }, []);

  // const toggleTarget = () => {
  //   // 현재 target의 인덱스를 찾아서 다음 target으로 변경
  //   const currentIndex = SUPPORTED_TARGETS.findIndex(
  //     (item) => item.code === target,
  //   );
  //   const nextIndex = (currentIndex + 1) % SUPPORTED_TARGETS.length;
  //   setTarget(SUPPORTED_TARGETS[nextIndex].code);
  // };

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
          <Button onClick={handleChat}>
            <Typography
              variant="subtitle1"
              style={{ wordWrap: "break-word" }}
              dangerouslySetInnerHTML={createMarkup(message)}
            />
          </Button>
          {showDivider && (
            <Divider
              variant="middle"
              sx={{ height: 1.1, bgcolor: "#000", margin: "8px 0" }}
            />
          )}
          <Typography
            variant="subtitle1"
            style={{ wordWrap: "break-word", textAlign: "center" }}
          >
            {text}
          </Typography>
          {/*<Select*/}
          {/*  value={target}*/}
          {/*  onChange={(e) => setTarget(e.target.value)}*/}
          {/*  variant="standard"*/}
          {/*  style={{ marginTop: "8px" }}*/}
          {/*>*/}
          {/*  {SUPPORTED_TARGETS.map((item) => (*/}
          {/*    <MenuItem key={item.code} value={item.code}>*/}
          {/*      {item.label}*/}
          {/*    </MenuItem>*/}
          {/*  ))}*/}
          {/*</Select>*/}
          {/*<Button onClick={toggleTarget}>Toggle Target</Button>*/}
        </Box>
      </Stack>
    </Stack>
  );
}
