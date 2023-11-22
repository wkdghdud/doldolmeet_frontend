import { backend_api } from "@/utils/api";
import { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchCurrentRoomId = async (fanMeetingId: string) => {
  const response = await backend_api()
    .get(`fanMeetings/${fanMeetingId}/currentRoom`)
    .then((response: AxiosResponse) => response.data)
    .catch((e) => console.error(e));
  return response.data;
};

const useCurrentRoomId = (fanMeetingId: string) => {
  const { data } = useQuery({
    queryKey: ["currRoomId", fanMeetingId],
    queryFn: ({ queryKey }) => fetchCurrentRoomId(queryKey[1]),
  });

  return { sessionId: data?.roomId };
};

export { fetchCurrentRoomId, useCurrentRoomId };
