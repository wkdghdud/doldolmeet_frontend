import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
export const currSessionIdAtom = atom("SessionA");

export const languageTargetAtom = atom<string>("ko");

export const bigHeartModelAtom = atomWithStorage<any>("bigHeartModel", null);
export const halfHeartModelAtom = atomWithStorage<any>("halfHeartModel", null);
