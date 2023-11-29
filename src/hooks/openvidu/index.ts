import { openvidu_api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

const retrieveAllSessions = async () => {
  const response = await openvidu_api
    .get(`/openvidu/api/sessions`)
    .then((response) => response.data)
    .catch((e) => console.error(e));

  console.log(`response`, response);
  return response;
};

const useAllOpenViduSessions = () => {
  return useQuery({
    queryKey: ["allOpenViduSessions"],
    queryFn: () => retrieveAllSessions(),
  });
};

export { retrieveAllSessions, useAllOpenViduSessions };
