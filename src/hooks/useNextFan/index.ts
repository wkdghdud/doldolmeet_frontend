import { backend_api } from "@/utils/api";
import { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";

export interface NextFanInfo {
  username: string;
  waitRoomId: string;
  connectionId: string;
  roomType: string;
}

const fetchNextFan = async (fanMeetingId: string) => {
  const response = await backend_api()
    .get(`fanMeetings/${fanMeetingId}/nextFan`)
    .then((response: AxiosResponse) => response.data)
    .catch((e) => console.error(e));
  return response.data;
};

const useNextFan = (fanMeetingId: string): NextFanInfo => {
  const { data } = useQuery({
    queryKey: ["currRoomId", fanMeetingId],
    queryFn: ({ queryKey }) => fetchNextFan(queryKey[1]),
  });

  return data as NextFanInfo;
};

export { fetchNextFan, useNextFan };
