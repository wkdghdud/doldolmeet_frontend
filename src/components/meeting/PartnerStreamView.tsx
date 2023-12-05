import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import LocalCameraView from "@/components/meeting/LocalCameraView";
import OpenViduVideoView from "@/components/meeting/OpenViduVideoView";
import WaitingImage from "@/components/meeting/WaitingImage";
import { Role } from "@/types";

interface Props {
  name: string | undefined;
  stream: StreamManager | Publisher | Subscriber | undefined;
  partnerRole: Role;
  left: boolean;
  showOverlay: boolean;
  motionType: string | undefined | null;
}

const PartnerStreamView = ({
  name,
  stream,
  partnerRole,
  left,
  showOverlay,
  motionType,
}: Props) => {
  return (
    <>
      {stream === undefined ? (
        <WaitingImage waitingFor={partnerRole} name={name} />
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

export default PartnerStreamView;
