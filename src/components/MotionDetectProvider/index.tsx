import { useSetAtom } from "jotai";
import React, { useEffect } from "react";
import * as tmPose from "@teachablemachine/pose";
import { bigHeartModelAtom, halfHeartModelAtom } from "@/atom";

const MotionDetectProvider = () => {
  const setBigHeartModel = useSetAtom(bigHeartModelAtom);
  const setHalfHeartModel = useSetAtom(halfHeartModelAtom);

  useEffect(() => {
    const loadBigHeartModel = async () => {
      const URL = "/my-pose-model/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      const loadedModel = await tmPose.load(modelURL, metadataURL);
      setBigHeartModel(loadedModel);
    };

    const loadHalfHeartModel = async () => {
      // 모델이 캐시되어 있지 않으면 로드합니다.
      const URL = "/my-pose-model2/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      const loadedModel = await tmPose.load(modelURL, metadataURL);
      setHalfHeartModel(loadedModel);
    };

    loadBigHeartModel();
    loadHalfHeartModel();
  }, []);

  return null;
};

export default MotionDetectProvider;
