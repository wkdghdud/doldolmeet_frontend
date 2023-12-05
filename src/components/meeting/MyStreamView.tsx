import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import LocalCameraView from "@/components/meeting/LocalCameraView";
import OpenViduVideoView from "@/components/meeting/OpenViduVideoView";

interface Props {
  name: string | undefined;
  stream: StreamManager | Publisher | Subscriber | undefined;
  left: boolean;
  showOverlay: boolean;
  motionType: string | undefined | null;
}

const MyStreamView = ({
  name,
  stream,
  left,
  showOverlay,
  motionType,
}: Props) => {
  return (
    <>
      {stream === undefined ? (
        <LocalCameraView name={name} />
      ) : (
        <OpenViduVideoView
          name={name}
          streamManager={stream}
          left={left}
          showOverlay={showOverlay}
          motionType={motionType}
        />
      )}
    </>
  );
};

export default MyStreamView;
