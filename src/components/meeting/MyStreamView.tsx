import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import LocalCameraView from "@/components/meeting/LocalCameraView";
import OpenViduVideoView from "@/components/meeting/OpenViduVideoView";

interface Props {
  name: string | undefined;
  stream: StreamManager | Publisher | Subscriber | undefined;
}

const MyStreamView = ({ name, stream }: Props) => {
  return (
    <>
      {stream === undefined ? (
        <LocalCameraView name={name} />
      ) : (
        <OpenViduVideoView name={name} streamManager={stream} mirror={false} />
      )}
    </>
  );
};

export default MyStreamView;
