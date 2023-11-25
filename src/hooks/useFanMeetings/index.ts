import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { backend_api } from "@/utils/api";

// TODO: react-query 샘플. 추후 삭제 필요.
const fetchFanMeetings = async (option = "opened") => {
  const response = await backend_api()
    .get(`/fanMeetings?option=${option}`)
    .then((response: AxiosResponse) => response.data)
    .catch((e) => console.error(e));
  return response.data;
};

const useFanMeetings = (option) => {
  return useQuery({
    queryKey: ["fanMeetings", option],
    queryFn: ({ queryKey }) => fetchFanMeetings(queryKey[1]),
  });
};

interface FanToFanMeeting {
  id: number;
  fanId: number;
  fanMeetingId: number;
  fanMeetingApplyStatus: string;
  orderNumber: number;
  chatRoomId: string;
}

const fetchFanToFanMeeting = async (fanMeetingId): Promise<FanToFanMeeting> => {
  const response = await backend_api()
    .get(`/fanMeetings/${fanMeetingId}/fanToFanMeeting`)
    .then((response: AxiosResponse) => response.data)
    .catch((e) => console.error(e));
  return response.data;
};

const useFanToFanMeeting = (fanMeetingId) => {
  return useQuery({
    queryKey: ["fanToFanMeeting", fanMeetingId],
    queryFn: ({ queryKey }) => fetchFanToFanMeeting(queryKey[1]),
  });
};

export {
  fetchFanMeetings,
  useFanMeetings,
  fetchFanToFanMeeting,
  useFanToFanMeeting,
};

export type { FanToFanMeeting };
