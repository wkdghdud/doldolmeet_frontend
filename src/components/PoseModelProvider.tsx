// PoseModelProvider.tsx
import React, { createContext, useContext, useEffect } from "react";
import { atom, useAtom } from "jotai";
import * as tmPose from "@teachablemachine/pose";

interface PoseModelContextProps {
  model: tmPose.PoseNet | null;
  maxPredictions: number;
}

const poseModel1Atom = atom<PoseModelContextProps>({
  model: null,
  maxPredictions: 0,
});

const poseModel2Atom = atom<PoseModelContextProps>({
  model: null,
  maxPredictions: 0,
});

const PoseModelContext1 = createContext<PoseModelContextProps | undefined>(
  undefined,
);
const PoseModelContext2 = createContext<PoseModelContextProps | undefined>(
  undefined,
);

export const PoseModelProvider: React.FC = ({ children }) => {
  const [poseModel1Context, setPoseModel1Context] = useAtom(poseModel1Atom);
  const [poseModel2Context, setPoseModel2Context] = useAtom(poseModel2Atom);

  useEffect(() => {
    const initPoseModel1 = async () => {
      // Pose 모델 1의 초기화 로직
      const URL1 = "/my-pose-model1/";
      const modelURL1 = URL1 + "model.json";
      const metadataURL1 = URL1 + "metadata.json";

      const model1 = await tmPose.load(modelURL1, metadataURL1);
      const maxPredictions1 = model1.getTotalClasses();

      setPoseModel1Context({ model: model1, maxPredictions: maxPredictions1 });
    };

    initPoseModel1();
  }, [setPoseModel1Context]);

  useEffect(() => {
    const initPoseModel2 = async () => {
      // Pose 모델 2의 초기화 로직
      const URL2 = "/my-pose-model2/";
      const modelURL2 = URL2 + "model.json";
      const metadataURL2 = URL2 + "metadata.json";

      const model2 = await tmPose.load(modelURL2, metadataURL2);
      const maxPredictions2 = model2.getTotalClasses();

      setPoseModel2Context({ model: model2, maxPredictions: maxPredictions2 });
    };

    initPoseModel2();
  }, [setPoseModel2Context]);

  return (
    <>
      <PoseModelContext1.Provider value={poseModel1Context}>
        <PoseModelContext2.Provider value={poseModel2Context}>
          {children}
        </PoseModelContext2.Provider>
      </PoseModelContext1.Provider>
    </>
  );
};

export const usePoseModel1 = (): PoseModelContextProps => {
  const context = useContext(PoseModelContext1);

  if (!context) {
    throw new Error("usePoseModel1 must be used within a PoseModelProvider");
  }

  return context;
};

export const usePoseModel2 = (): PoseModelContextProps => {
  const context = useContext(PoseModelContext2);

  if (!context) {
    throw new Error("usePoseModel2 must be used within a PoseModelProvider");
  }

  return context;
};
