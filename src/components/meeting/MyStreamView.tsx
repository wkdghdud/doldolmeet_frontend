import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import LocalCameraView from "@/components/meeting/LocalCameraView";
import OpenViduVideoView from "@/components/meeting/OpenViduVideoView";

interface Props {
  name: string | undefined;
  stream: StreamManager | Publisher | Subscriber | undefined;
  left: boolean;
  showOverlay: boolean;
}

const MyStreamView = ({ name, stream, left, showOverlay }: Props) => {
  return (
    <>
      {stream === undefined ? (
        <LocalCameraView name={name} />
      ) : (
        <OpenViduVideoView
          name={name}
          streamManager={stream}
          mirror={true}
          left={left}
          showOverlay={showOverlay}
        />
      )}
    </>
  );
};

export default MyStreamView;
