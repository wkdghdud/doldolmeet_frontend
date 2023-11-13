import { useEffect, useRef } from "react";
import { Publisher, Subscriber } from "openvidu-browser";

const OpenViduVideoComponent = ({ streamManager }: Publisher | Subscriber) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  return <video autoPlay={true} ref={videoRef} />;
};

export default OpenViduVideoComponent;
