import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { backend_api } from "@/utils/api";

// TODO: react-query 샘플. 추후 삭제 필요.
const fetchFanMeetings = async (option = "opened") => {
  const response = await backend_api()
    .get(`/fanMeetings?option=${option}`)
    .then((response: AxiosResponse) => response.data)
    .catch((e) => console.error(e));
  return response;
};

const useFanMeetings = (option) => {
  return useQuery({
    queryKey: ["fanMeetings", option],
    queryFn: () => fetchFanMeetings(option),
  });
};

export { fetchFanMeetings, useFanMeetings };
