import * as tmPose from "@teachablemachine/pose";

let model, maxPredictions;
let webcam;

const init = async () => {
  console.log("tmPoseWorker init");
  const URL = "../my-pose-model/";
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmPose.load(modelURL, metadataURL);
  console.log("tmPoseWorker model loaded");

  postMessage({ type: "modelLoaded", model: model }); // Notify the main thread
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

onmessage = async (event) => {
  const { type } = event.data;

  switch (type) {
    case "init":
      await init();
      break;
    case "start":
      loop();
      break;
    default:
      break;
  }
};
