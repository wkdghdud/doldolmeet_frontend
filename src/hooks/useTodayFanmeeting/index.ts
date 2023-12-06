import { backend_api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { BackendResponse } from "@/types";

const fetchTodayFanmeeting = async (): Promise<BackendResponse<any>> => {
  const response = await backend_api()
    .get(`/fanMeetings/today`)
    .then((response: AxiosResponse) => {
      if (response.status === 404) {
        return null;
      } else {
        return response.data;
      }
    })
    .catch((e) => console.error(e));
  return response;
};

const useTodayFanmeeting = () => {
  return useQuery({
    queryKey: ["fanMeetings", "today"],
    queryFn: () => fetchTodayFanmeeting(),
  });
};

export { fetchTodayFanmeeting, useTodayFanmeeting };
