"use client";
import React, { useEffect, useRef } from "react";
import * as tmPose from "@teachablemachine/pose";

const TeachableMachinePose = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const labelContainerRef = useRef(null);
  let model, maxPredictions;

  useEffect(() => {
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
    const webcam = new tmPose.Webcam(
      size,
      size,
      flip,
    ); /* todo: 우리 웹캠으로 바꿔야됨 */

    await webcam.setup();
    await webcam.play();

    webcamRef.current = webcam;
    canvasRef.current.width = size;
    canvasRef.current.height = size;

    labelContainerRef.current.innerHTML = ""; // 레이블 컨테이너 초기화

    for (let i = 0; i < maxPredictions; i++) {
      labelContainerRef.current.appendChild(document.createElement("div"));
    }

    console.log("포즈 모델 로드 완료!🤡🤡🤡🤡🤡");
    window.requestAnimationFrame(loop);
  };

  const loop = () => {
    const webcam = webcamRef.current;
    if (webcam) {
      webcam.update();
      predict();
      window.requestAnimationFrame(loop);
    }
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
          labelContainerRef.current.childNodes[i].innerHTML = classPrediction;

          // O 모양이 80% 이상일 때 콘솔 이벤트 발생
          if (
            prediction[i].className == "Class 1" &&
            prediction[i].probability > 0.8
          ) {
            detected = true;
          }
        }
        if (detected) {
          console.log("O 모양이 감지되었습니다!");
          // 추가적인 로직을 여기에 추가할 수 있습니다.
        }
        drawPose(pose);
      } catch (error) {
        console.error("Prediction error:", error);
      }
    } else {
      console.log("Model or webcam is not available!");
    }
  };

  const drawPose = (pose) => {
    const webcam = webcamRef.current;
    const ctx = canvasRef.current.getContext("2d");
    if (webcam && ctx) {
      ctx.drawImage(webcam.canvas, 0, 0);

      if (pose) {
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
      }
    }
  };

  const handleStart = () => {
    if (!model) {
      init();
    }
  };

  return (
    <div>
      <div>Teachable Machine Pose Model</div>
      <button type="button" onClick={handleStart}>
        Start
      </button>
      <div>
        <canvas ref={canvasRef}></canvas>
      </div>
      <div ref={labelContainerRef}></div>
    </div>
  );
};

export default TeachableMachinePose;
