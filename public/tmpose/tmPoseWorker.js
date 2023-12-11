import * as tmPose from "@teachablemachine/pose";
import { useCallback } from "react";

let model, maxPredictions;
let webcam;

const init = async () => {
  console.log("tmPoseWorker init");
  const URL = "/my-pose-model/";
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  console.log("tmPoseWorker model loaded");

  postMessage({ type: "modelLoaded" }); // Notify the main thread
};

const loop = async () => {
  console.log("tmPoseWorker loop");

  // Implement your loop logic here
  if (webcam) {
    webcam.update();
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    // Add your prediction handling logic here

    postMessage({ type: "loop" }); // Notify the main thread
  }
};

const predict = async (webcam) => {
  console.log("🙈 tmPoseWorker predict");
  if (model && webcam) {
    try {
      const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

      const prediction = await model.predict(posenetOutput);
      let detected = false;

      for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
          prediction[i].className + ": " + prediction[i].probability.toFixed(2);

        if (
          prediction[i].className == "Class 1" &&
          prediction[i].probability > 0.9
        ) {
          detected = true;
        }
      }
      console.log("📣 predict_result", classPrediction, detected);
      postMessage({
        type: "predict_result",
        classPrediction: classPrediction,
        detected: detected,
      }); // Notify the main thread
    } catch (error) {
      // console.error("Prediction error:", error);
    }
  } else {
    // console.log("Model or webcam is not available!");
  }
};

onmessage = async (event) => {
  const { type } = event.data;

  switch (type) {
    case "init":
      await init();
      break;
    case "predict":
      const { webcam } = event.data;
      predict(webcam);
      break;
    default:
      break;
  }
};
