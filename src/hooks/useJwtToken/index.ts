"use client";
import { useSession } from "next-auth/react";
import jwt from "jsonwebtoken";
import { Role } from "@/types";

export interface JwtToken {
  auth: Role;
  exp: number;
  iat: number;
  sub: string;
}

// TODO: 여기 안에서 token을 state로 가지고, useEffect로 변화를 관리하도록 수정 필요
const useJwtToken = async (): Promise<JwtToken | null> => {
  const { data: session } = useSession();

  // @ts-ignore
  const token = session?.user?.data.replace("Bearer ", "") ?? null;

  if (!token) return null;

  const decoded = await jwt.decode(token);
  return decoded as JwtToken;
};

export default useJwtToken;
