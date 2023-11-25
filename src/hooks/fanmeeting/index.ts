import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { backend_api } from "@/utils/api";
import { BackendResponse } from "@/types";

export interface FanMeeting {
  id: number;
  imgUrl: string;
  title: string;
  chatRoomId: string;
  startTime: string;
  endTime: string;
}

const fetchFanMeeting = async (
  fanMeetingId: string,
): Promise<FanMeeting | undefined> => {
  const response = await backend_api()
    .get(`/fanMeetings/${fanMeetingId}`)
    .then(
      (response: AxiosResponse<BackendResponse<FanMeeting>>) => response.data,
    )
    .catch((e) => console.error(e));
  return response?.data;
};

const useFanMeeting = (fanMeetingId) => {
  return useQuery({
    queryKey: ["fanMeeting", fanMeetingId],
    queryFn: () => fetchFanMeeting(fanMeetingId),
  });
};

export { fetchFanMeeting, useFanMeeting };
