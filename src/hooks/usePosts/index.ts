import { useQuery } from "@tanstack/react-query";

// TODO: react-query 샘플. 추후 삭제 필요.
const fetchPosts = async (limit = 10) => {
  const parsed = await fetch("https://jsonplaceholder.typicode.com/posts").then(
    (response) => response.json(),
  );
  return parsed.filter((x) => x.id <= limit);
};

const usePosts = (limit) => {
  return useQuery({
    queryKey: ["posts", limit],
    queryFn: () => fetchPosts(limit),
  });
};

export { usePosts, fetchPosts };
