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
  languageTarget: string;
}

const SpeechRecog = ({
  active,
  sessionId,
  partnerVoice,
  username,
  languageTarget,
}: Props) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [translatedText, setTranslatedText] = useState("");

  const sendSignal = async (text) => {
    try {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:voice_detected",
        data: JSON.stringify({
          username: username,
          translatedText: text,
        }),
      });
    } catch (err) {
      console.error("Error in signal:voice_detected:", err);
    }
  };

  useEffect(() => {
    if (active) {
      SpeechRecognition.startListening({
        continuous: true,
      });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [active]);

  const fetchData = async (partnerVoice: string) => {
    try {
      const res = await backend_api()
        .post(`/translate?target=${languageTarget}`, {
          text: partnerVoice,
        })
        .then((res) => {
          const translated = res.data.translatedText || ""; // Use an empty string if translatedText is undefined
          setTranslatedText(translated); // 있어야 되나?
          sendSignal(translatedText);
        });
    } catch (error) {
      console.error("Error fetching translation:", error);
    }
  };

  useEffect(() => {
    if (transcript) {
      fetchData(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // 일정 시간(예: 5000ms, 5초)이 지난 후에 자동으로 새로고침
      setTranslatedText("");
      resetTranscript();
    }, 5000); // 5초마다 새로고침

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시에 타이머 정리
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      <Grid item xs={12}>
        {partnerVoice !== null && (
          <Typography
            color="secondary"
            align={"center"}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              color: "#000000",
              padding: 15,
              borderRadius: "8px",
              marginTop: "5px",
              width: "95%",
              fontSize: 20,
              fontWeight: 600,
              minHeight: 24,
            }}
          >
            {partnerVoice}
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default SpeechRecog;
