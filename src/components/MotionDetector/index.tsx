"use client";
import React, { useEffect, useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import { Role } from "@/types";
import html2canvas from "html2canvas";
import { backend_api, openvidu_api } from "@/utils/api";

interface Props {
  // handleDetected: (role: Role | undefined, partnerPose: boolean) => void;
  fanMeetingId: string | null | undefined;
  idolName: string | null | undefined;
  sessionId: string | null | undefined;
  role: Role | undefined;
  partnerPose: boolean;
}

const MotionDetector = ({
  fanMeetingId,
  idolName,
  sessionId,
  role,
  partnerPose,
}: Props) => {
  const audio = new Audio("/mp3/camera9.mp3");

  const webcamRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const [poseAPrediction, setPoseAPrediction] = useState<number>(0);
  const [poseBPrediction, setPoseBPrediction] = useState<number>(0);
  const [valueChanged, setValueChanged] = useState<boolean>(false);
  let model, maxPredictions;
  let hasDetected = false;
  const [detectedCnt, setDetectedCnt] = useState<number>(0);

  const onCapture = () => {
    const targetElement = document.getElementById("video-container");
    if (targetElement) {
      html2canvas(targetElement)
        .then((canvas) => {
          // onSavaAs(canvas.toDataURL("image/png"), "image-download.png");
          // shutter?.play(); // 찰칵 소리
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

  const signalPoseDetected = async () => {
    await openvidu_api.post(`/openvidu/api/signal`, {
      session: sessionId,
      type: "signal:pose_detected",
      data: "true",
    });
  };

  const handleDetected = async (
    role: Role | undefined,
    partnerPose: boolean,
  ) => {
    console.log("👋 handleDetected role: ", role);

    await signalPoseDetected().then(() => {
      console.log("📣 포즈 감지 신호를 보냈습니다.");
    });

    if (role === Role.FAN) {
      if (partnerPose) {
        console.log("👋 아이돌도 포즈를 취했습니다.");
        onCapture();
      } else {
        console.log("👋 아이돌이 포즈를 취하지 않았습니다.");
      }
    }
  };

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

    // if (webcamRef.current) {
    // @ts-ignore
    webcamRef.current = webcam;
    // }

    // if (canvasRef.current) {
    canvasRef.current.width = size;
    canvasRef.current.height = size;
    // }

    // if (labelContainerRef.current) {
    labelContainerRef.current.innerHTML = ""; // 레이블 컨테이너 초기화
    for (let i = 0; i < maxPredictions; i++) {
      labelContainerRef.current.appendChild(document.createElement("div"));
    }
    // }

    window.requestAnimationFrame(loop);
  };

  const loop = () => {
    // if (!hasDetected) {
    const webcam = webcamRef.current;
    if (webcam) {
      webcam.update();
      predict();
      window.requestAnimationFrame(loop);
    }
    // }
  };

  const predict = async () => {
    const webcam = webcamRef.current;
    console.log("Predict function started...");

    if (model && webcam) {
      console.log("Model and webcam are available!");

      try {
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        console.log("Pose estimation successful!");

        const prediction = await model.predict(posenetOutput);
        let detected = false;

        for (let i = 0; i < maxPredictions; i++) {
          const classPrediction =
            prediction[i].className +
            ": " +
            prediction[i].probability.toFixed(2);
          // if (labelContainerRef.current) {
          // @ts-ignore
          labelContainerRef.current.childNodes[i].innerHTML = classPrediction;
          // }

          // O 모양이 80% 이상일 때 콘솔 이벤트 발생
          if (
            prediction[i].className == "Class 1" &&
            prediction[i].probability > 0.8
          ) {
            detected = true;
          }
        }
        if (detected) {
          console.log(
            `🔔 포즈가 감지되었습니다 => role: ${role} / partnerPose: ${partnerPose}`,
          );
          // if (!hasDetected) {
          // handleDetected(role, partnerPose);
          // hasDetected = false;
          setDetectedCnt(detectedCnt + 1);
        }
      } catch (error) {
        console.error("Prediction error:", error);
      }
    } else {
      console.log("Model or webcam is not available!");
    }
  };

  useEffect(() => {
    // if (hasDetected) {
    handleDetected(role, partnerPose);
    // }
  }, [detectedCnt]);

  return (
    <div>
      <div hidden={true}>
        <canvas ref={canvasRef}></canvas>
      </div>
      <div ref={labelContainerRef}></div>
    </div>
  );
};

export default MotionDetector;
