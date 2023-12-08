"use client";
import { AppBar, Stack, Toolbar } from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";
import GradientButton from "@/components/GradientButton";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";

export default function Header() {
  const { data: session } = useSession();

  const [role, setRole] = useState<Role>(Role.FAN);

  const token = useJwtToken();

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
      }
    });
  }, [token]);

  return (
    <AppBar
      component="nav"
      sx={{
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
      }}
      elevation={0}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
        <Link href="/" style={{ textDecoration: "none", marginRight: "8px" }}>
          <Image src={"/en_logo.svg"} width={200} height={30} alt="logo" />
        </Link>
        <Box sx={{ flexGrow: 1 }}></Box>

        {role === Role.ADMIN && (
          <Stack direction={"row"} spacing={1}>
            <Link
              href="/admin-init-fanmeeting?id=1"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <GradientButton
                variant="contained"
                disableElevation
                sx={{ px: 3, borderRadius: 10, marginLeft: "8px" }} // 왼쪽 간격 추가
              >
                팬미팅 관리
              </GradientButton>
            </Link>
            <Link
              href="/create-fanmeeting"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <GradientButton
                variant="contained"
                disableElevation
                sx={{ px: 3, borderRadius: 10, marginLeft: "8px" }} // 왼쪽 간격 추가
              >
                팬미팅 등록
              </GradientButton>
            </Link>
          </Stack>
        )}

        <Link
          href="/login"
          style={{ textDecoration: "none", marginLeft: "8px" }}
        >
          <GradientButton
            variant="contained"
            disableElevation
            sx={{ px: 3, borderRadius: 10 }}
            onClick={session?.user ? () => signOut() : () => signIn()}
          >
            {session?.user ? "로그아웃" : "로그인"}
          </GradientButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
