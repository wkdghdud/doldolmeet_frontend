"use client";
import { useSession } from "next-auth/react";
import jwt from "jsonwebtoken";

const useJwtToken = () => {
  const { data: session } = useSession();

  // @ts-ignore
  const token = session?.user?.data.replace("Bearer ", "") ?? null;

  if (!token) return null;

  return jwt.decode(token);
};

export default useJwtToken;
