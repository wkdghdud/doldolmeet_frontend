import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import { StreamManager } from "openvidu-browser";

interface Props {
  idolStream: StreamManager | undefined;
  fanStream: StreamManager | undefined;
}

const TwoPersonMeetingPage = ({ idolStream, fanStream }: Props) => {
  return (
    <div>
      <h1>Two Person Meeting</h1>
      {idolStream ? (
        <OpenViduVideoComponent streamManager={idolStream} />
      ) : (
        <h1>아직 아이돌이 입장하지 않았어요.</h1>
      )}
      {fanStream ? (
        <OpenViduVideoComponent streamManager={fanStream} />
      ) : (
        <h1>아직 팬이 입장하지 않았어요.</h1>
      )}
    </div>
  );
};

export default TwoPersonMeetingPage;
