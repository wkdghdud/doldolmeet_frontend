"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import html2canvas from "html2canvas";
import { backend_api, openvidu_api } from "@/utils/api";

interface Props {
  fanMeetingId: string | null | undefined;
  idolName: string | null | undefined;
  sessionId: string | null | undefined;
  partnerPose: boolean;
  username: string;
}

const MotionDetector = ({
  fanMeetingId,
  idolName,
  sessionId,
  partnerPose,
  username,
}: Props) => {
  const audio = new Audio("/mp3/camera9.mp3");

  /* Ref */
  const webcamRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);

  /* State*/
  const [hasCaptured, setHasCaptured] = useState<boolean>(false);
  const [myPose, setMyPose] = useState<boolean>(false);

  let model, maxPredictions;
  let hasDetected = false;

  const onCapture = () => {
    const targetElement = document.getElementById("video-container");
    if (targetElement) {
      html2canvas(targetElement)
        .then((canvas) => {
          audio.play();
          const imageDataUrl = canvas.toDataURL("image/png");
          uploadImage(imageDataUrl);
        })
        .catch((error) => {
          console.error("html2canvas error:", error);
        });
    } else {
      console.error("Target element not found");
    }
  };

  const uploadImage = (imageDataUrl) => {
    const blobImage = dataURLtoBlob(imageDataUrl);
    // Blob을 파일로 변환
    const imageFile = new File([blobImage], "image.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", imageFile);

    if (fanMeetingId) {
      backend_api()
        .post(`/captures/upload/${fanMeetingId}/${idolName}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("Image uploaded successfully:", response.data);
        })
        .catch((error) => {
          console.error("Image upload failed:", error);
        });
    }
  };

  function dataURLtoBlob(dataURL) {
    let arr = dataURL.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  const signalPoseDetected = useCallback(async () => {
    console.log("🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶", username);
    if (username !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:pose_detected",
        data: username,
      });
    }
  }, [username, sessionId]);

  useEffect(() => {
    console.log("MotionDetector component mounted!");
    const loadScripts = async () => {
      const tfScript = document.createElement("script");
      tfScript.src =
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js";
      document.body.appendChild(tfScript);

      const tmPoseScript = document.createElement("script");
      tmPoseScript.src =
        "https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js";
      document.body.appendChild(tmPoseScript);

      await Promise.all([
        new Promise((resolve) => {
          tfScript.onload = resolve;
        }),
        new Promise((resolve) => {
          tmPoseScript.onload = resolve;
        }),
      ]);

      // TensorFlow 및 Teachable Machine Pose 스크립트 로드 완료 후 초기화
      init();
    };

    loadScripts();
  }, []);

  const init = async () => {
    const URL = "/my-pose-model/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    const flip = true;
    const webcam = new tmPose.Webcam(size, size, flip);
    await webcam.setup();
    await webcam.play();

    // @ts-ignore
    webcamRef.current = webcam;

    canvasRef.current.width = size;
    canvasRef.current.height = size;

    labelContainerRef.current.innerHTML = ""; // 레이블 컨테이너 초기화
    for (let i = 0; i < maxPredictions; i++) {
      labelContainerRef.current.appendChild(document.createElement("div"));
    }
    window.requestAnimationFrame(loop);
  };

  const loop = () => {
    if (!hasDetected) {
      const webcam = webcamRef.current;
      if (webcam) {
        webcam.update();
        predict();
        window.requestAnimationFrame(loop);
      }
    }
  };

  useEffect(() => {
    if (partnerPose && myPose && !hasCaptured) {
      console.log("📸📸 사진촬영!!!!!📸📸", myPose);
      onCapture();
      setHasCaptured(true);
    }
  }, [partnerPose, myPose]);

  const predict = async () => {
    const webcam = webcamRef.current;

    if (model && webcam) {
      try {
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

        const prediction = await model.predict(posenetOutput);
        let detected = false;

        for (let i = 0; i < maxPredictions; i++) {
          const classPrediction =
            prediction[i].className +
            ": " +
            prediction[i].probability.toFixed(2);

          // @ts-ignore
          labelContainerRef.current.childNodes[i].innerHTML = classPrediction;

          if (
            prediction[i].className == "Class 1" &&
            prediction[i].probability > 0.9
          ) {
            detected = true;
          }
        }
        let flag = false;
        if (detected && !flag) {
          console.log(`🔔 포즈가 감지되었습니다`);
          if (!myPose) {
            await signalPoseDetected().then(() => {
              console.log("📣 포즈 감지 신호를 보냈습니다.");
            });
            setMyPose(true);
          }
        }
      } catch (error) {
        console.error("Prediction error:", error);
      }
    } else {
      console.log("Model or webcam is not available!");
    }
  };

  return (
    <div>
      <div hidden={true}>
        <canvas ref={canvasRef}></canvas>
      </div>
      <div hidden={true} ref={labelContainerRef}></div>
    </div>
  );
};

export default MotionDetector;
