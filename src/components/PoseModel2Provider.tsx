// PoseModel2Provider.tsx
import React, { createContext, useContext, useEffect } from "react";
import { atom, Provider, useAtom } from "jotai";
import * as tmPose from "@teachablemachine/pose";

interface PoseModel2ContextProps {
  model2: tmPose.PoseNet | null;
  maxPredictions2: number;
}

const poseModel2Atom = atom<PoseModel2ContextProps>({
  model2: null,
  maxPredictions2: 0,
});

const PoseModel2Context = createContext<PoseModel2ContextProps | undefined>(
  undefined,
);

export const PoseModel2Provider: React.FC = ({ children }) => {
  const [poseModel2Context, setPoseModel2Context] = useAtom(poseModel2Atom);

  useEffect(() => {
    const initPoseModel2 = async () => {
      console.log("MotionDetector init2() called");
      const URL2 = "/my-pose-model2/";
      const modelURL2 = URL2 + "model.json";
      const metadataURL2 = URL2 + "metadata.json";

      const model2 = await tmPose.load(modelURL2, metadataURL2);
      const maxPredictions2 = model2.getTotalClasses();

      setPoseModel2Context({ model2, maxPredictions2 });
    };

    initPoseModel2();
  }, [setPoseModel2Context]);

  return (
    <PoseModel2Context.Provider value={poseModel2Context}>
      {children}
    </PoseModel2Context.Provider>
  );
};

export const usePoseModel2 = (): PoseModel2ContextProps => {
  const context = useContext(PoseModel2Context);

  if (!context) {
    throw new Error("usePoseModel2 must be used within a PoseModel2Provider");
  }

  return context;
};
