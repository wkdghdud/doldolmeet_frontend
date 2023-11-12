"use client";
import axios from "axios";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}
const fetchMeetings = async (id: number) => {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}/comments`,
  );
  return response.data;
};

const useMeetings = (id: number): UseQueryResult<Comment[]> => {
  return useQuery({
    queryKey: ["meetings", id],
    queryFn: () => fetchMeetings(id),
  });
};

export { useMeetings, fetchMeetings };
