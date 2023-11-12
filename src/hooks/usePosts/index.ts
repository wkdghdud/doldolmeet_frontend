import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

// TODO: react-query 샘플. 추후 삭제 필요.
const fetchPosts = async (limit = 10) => {
  const parsed = await axios
    .get("https://jsonplaceholder.typicode.com/posts")
    .then((response: AxiosResponse) => response.data)
    .catch((e) => console.error(e));
  return parsed.filter((x) => x.id <= limit);
};

const usePosts = (limit) => {
  return useQuery({
    queryKey: ["posts", limit],
    queryFn: () => fetchPosts(limit),
  });
};

export { usePosts, fetchPosts };
