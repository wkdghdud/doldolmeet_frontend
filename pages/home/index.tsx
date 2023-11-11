import React from "react";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchPosts } from "@/hooks/usePosts";
import { PostList } from "@/components/PostList";

// TODO: React-Query 샘플. 추후 삭제 필요.
const Home = () => {
  return (
    <>
      <h1>ℹ️ This page shows how to use SSG with React-Query.</h1>
      <PostList />
    </>
  );
};

export async function getStaticProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["posts", 10],
    queryFn: () => fetchPosts(10),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default Home;
