"use client";
import React, { useEffect, useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import OpenViduVideoView from "@/components/meeting/OpenViduVideoView";
import { OpenVidu, StreamManager } from "openvidu-browser";
import {
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";
import { Role } from "@/types";

const TeachableMachinePose = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const labelContainerRef = useRef(null);
  let model, maxPredictions;

  const [myStream, setMyStream] = useState<StreamManager | undefined>(
    undefined,
  );

  const joinSession = async () => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      // setOV(ov);

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        // setPartnerStream(subscriber);
      });

      mySession.on("streamDestroyed", (event) => {
        // setPartnerStream(undefined);
      });

      await createOpenViduSession("doldolmeet");

      const connection = await createOpenViduConnection("doldolmeet");
      if (connection) {
        // setMyConnection(connection);
      }
      const { token } = connection;
      await mySession
        .connect(token, {
          // clientData: JSON.stringify({
          //   role: role,
          //   fanMeetingId: fanMeetingId,
          //   userName: userName,
          //   type: "idolRoom",
          // }
          // ),
        })
        .then(() => {
          // if (role === Role.FAN) {
          //   startRecording();
          // }
        });

      await ov.getUserMedia({
        audioSource: undefined,
        videoSource: undefined,
      });

      const devices = await ov.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const newPublisher = await ov.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: videoDevices[0].deviceId,
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
      });
      mySession.publish(newPublisher);
      // setSession(mySession);
      setMyStream(newPublisher);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  useEffect(() => {
    joinSession();

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
          alert("O 모양이 감지되었습니다!");
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
      {myStream && <OpenViduVideoView name={""} streamManager={myStream} />}
      <button type="button" onClick={handleStart}>
        Start
      </button>
      <div hidden={true}>
        <canvas ref={canvasRef}></canvas>
      </div>
      <div ref={labelContainerRef}></div>
    </div>
  );
};

export default TeachableMachinePose;
