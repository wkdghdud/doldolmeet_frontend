import { atom } from "jotai";

export const sessionIdsAtom = atom([
  "Session_A",
  "Session_B",
  "Session_C",
  "Session_D",
]);
export const currSessionIdxAtom = atom(0);
export const currSessionIdAtom = atom("");
