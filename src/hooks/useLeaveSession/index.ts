"use client";

import { useEffect } from "react";

const useLeaveSession = (leaveSession: () => void) => {
  useEffect(() => {
    console.log("useLeaveSession😾😾😾😾😾😾😾😾");
    return () => {
      leaveSession();
    };
  }, [leaveSession]);
};

export default useLeaveSession;
