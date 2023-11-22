"use client";
import { AppBar, Toolbar } from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";
import GradientButton from "@/components/GradientButton";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <AppBar
      component="nav"
      sx={{
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
      }}
      elevation={0}
    >
      <Toolbar>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Image src={"/en_logo.svg"} width={200} height={30} alt="logo" />
        </Link>
        <Box sx={{ flexGrow: 1 }}></Box>

        <Link href="/login" style={{ textDecoration: "none" }}>
          <GradientButton
            variant="contained"
            disableElevation
            sx={{ px: 3, mr: 2, borderRadius: 10 }} // Add margin to create space between 로그인 and 회원가입 buttons
            onClick={session?.user ? () => signOut() : () => signIn()}
          >
            {session?.user ? "로그아웃" : "로그인"}
          </GradientButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
