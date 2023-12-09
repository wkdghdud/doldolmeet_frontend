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
  fanMeetingId: string | string[] | undefined,
): Promise<FanMeeting | undefined> => {
  if (!fanMeetingId) return undefined;
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

interface MainWaitRoom {
  roomId: string;
}

const fetchMainWaitRoom = async (fanMeetingId: string) => {
  if (!fanMeetingId) return undefined;
  const response = await backend_api()
    .get(`/fanMeetings/${fanMeetingId}/mainWaitRoom`)
    .then(
      (response: AxiosResponse<BackendResponse<MainWaitRoom>>) => response.data,
    )
    .catch((e) => console.error(e));
  return response?.data?.roomId;
};

const useMainWaitRoom = (fanMeetingId) => {
  return useQuery({
    queryKey: ["mainWaitRoom", fanMeetingId],
    queryFn: () => fetchMainWaitRoom(fanMeetingId),
  });
};

const fetchAllRoomIdsByAdmin = async (
  fanMeetingId: string,
): Promise<string[]> => {
  const response = await backend_api()
    .get(`/fanMeetings/${fanMeetingId}/roomsId`)
    .then((response: AxiosResponse<BackendResponse<string[]>>) => response.data)
    .catch((e) => console.error(e));
  return response?.data ?? [];
};

const updateFanMeetingRoomCreated = async (fanMeetingId: string) => {
  await backend_api()
    .post(`/fanMeetings/${fanMeetingId}/roomCreated`)
    .then((response: AxiosResponse<BackendResponse<string[]>>) => response.data)
    .catch((e) => console.error(e));
};

export {
  fetchFanMeeting,
  useFanMeeting,
  fetchMainWaitRoom,
  useMainWaitRoom,
  fetchAllRoomIdsByAdmin,
  updateFanMeetingRoomCreated,
};
