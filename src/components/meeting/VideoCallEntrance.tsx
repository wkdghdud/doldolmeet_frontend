import IdolEntrance from "@/components/meeting/IdolEntrance";
import FanEntrance from "@/components/meeting/FanEntrance";
import { useSearchParams } from "next/navigation";

interface Props {
  joinSession: (role: string) => void;
}

const VideoCallEntrance = ({ joinSession }: Props) => {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  return (
    <>
      {role === "idol" ? (
        <IdolEntrance createSession={() => joinSession("idol")} />
      ) : (
        <FanEntrance joinSession={() => joinSession("fan")} />
      )}
    </>
  );
};

export default VideoCallEntrance;
