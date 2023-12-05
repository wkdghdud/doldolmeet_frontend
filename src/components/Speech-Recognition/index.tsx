"use client";
import React, { useCallback, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { backend_api, openvidu_api } from "@/utils/api";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";

interface Props {
  active: boolean;
  sessionId: string | null | undefined;
  partnerVoice: string | null | undefined;
  username: string;
}

const SpeechRecog = ({ active, sessionId, partnerVoice, username }: Props) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [translatedText, setTranslatedText] = useState("");
  const [isLanguage, setIsLanguage] = useState("en");

  const signalVoicesDetected = useCallback(
    async (text) => {
      if (username !== "") {
        await openvidu_api
          .post(`/openvidu/api/signal`, {
            session: sessionId,
            type: "signal:voice_detected",
            data: JSON.stringify({
              username: username,
              translatedText: text,
            }),
          })
          .catch((err) =>
            console.error("Error in signal:voice_detected:", err),
          );
      }
    },
    [username, sessionId],
  );

  useEffect(() => {
    if (active) {
      SpeechRecognition.startListening({
        continuous: true,
      });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [active]);

  const fetchData = async () => {
    try {
      if (transcript.trim() !== "") {
        const res = await backend_api().post(
          `/translate?target=${isLanguage}`,
          {
            text: transcript,
          },
        );
        const translatedText = res.data.translatedText || ""; // Use an empty string if translatedText is undefined
        signalVoicesDetected(translatedText);
        setTranslatedText(translatedText);
      }
    } catch (error) {
      console.error("Error fetching translation:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [transcript, isLanguage]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // 일정 시간(예: 5000ms, 5초)이 지난 후에 자동으로 새로고침
      setTranslatedText("");
      resetTranscript();
    }, 5000); // 5초마다 새로고침

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시에 타이머 정리
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <span>브라우저가 음성 인식을 지원하지 않습니다.</span>;
  }

  return (
    <>
      <Grid item xs={11}>
        {translatedText !== null && (
          <Typography
            variant="subtitle1"
            color="secondary"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              color: "#000000",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            번역된 텍스트: {partnerVoice}
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default SpeechRecog;
