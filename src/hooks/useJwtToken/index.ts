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

const useJwtToken = async (): Promise<JwtToken | null> => {
  const { data: session } = useSession();

  // @ts-ignore
  const token = session?.user?.data.replace("Bearer ", "") ?? null;

  if (!token) return null;

  const decoded = await jwt.decode(token);
  return decoded as JwtToken;
};

export default useJwtToken;
