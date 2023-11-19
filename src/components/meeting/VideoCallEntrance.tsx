import IdolEntrance from "@/components/meeting/IdolEntrance";
import FanEntrance from "@/components/meeting/FanEntrance";
import { useSearchParams } from "next/navigation";

interface Props {
  joinSession: (role: string) => void;
  requestJoin: () => void;
}

const VideoCallEntrance = ({ joinSession, requestJoin }: Props) => {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  return (
    <>
      {role === "idol" ? (
        <IdolEntrance createSession={() => joinSession("idol")} />
      ) : (
        <FanEntrance joinSession={requestJoin} />
      )}
    </>
  );
};

export default VideoCallEntrance;
