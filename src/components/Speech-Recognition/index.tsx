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

  useEffect(() => {
    if (transcript && username !== "") {
      const sendSignal = async () => {
        try {
          await openvidu_api.post(`/openvidu/api/signal`, {
            session: sessionId,
            type: "signal:voice_detected",
            data: JSON.stringify({
              username: username,
              translatedText: transcript,
            }),
          });
        } catch (err) {
          console.error("Error in signal:voice_detected:", err);
        }
      };
      sendSignal();
    }
  }, [transcript, username, sessionId]);

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
    console.log("🎸🎸🎸🎸🎸🎸🎸🎸", partnerVoice);
    try {
      const res = await backend_api()
        .post(`/translate?target=${languageTarget}`, {
          text: partnerVoice,
        })
        .then((res) => {
          console.log("🎲🎲🎲🎲🎲🎲🎲🎲", res.data.translatedText);
          const translatedText = res.data.translatedText || ""; // Use an empty string if translatedText is undefined
          setTranslatedText(translatedText); // 있어야 되나?
        });
    } catch (error) {
      console.error("Error fetching translation:", error);
    }
  };

  useEffect(() => {
    console.log("🧩🧩🧩🧩🧩🧩🧩", partnerVoice); // 출력 확인
    if (partnerVoice) {
      fetchData(partnerVoice);
    }
  }, [partnerVoice]);

  // useEffect(() => {
  //   signalVoicesDetected();
  // }, [transcript, languageTarget]);

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
      <Grid item xs={12}>
        {translatedText !== null && (
          <Typography
            variant="subtitle1"
            color="secondary"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              color: "#000000",
              padding: "8px",
              borderRadius: "4px",
              marginTop: "5px",
            }}
          >
            번역된 텍스트: {translatedText}
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default SpeechRecog;
