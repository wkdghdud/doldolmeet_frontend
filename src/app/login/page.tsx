"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Grid, Stack, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import Link from "next/link";

function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (userName !== "" && password !== "") {
      signIn("Credentials", {
        username: userName,
        password: password,
        redirect: true,
        callbackUrl: "/",
      }).then((response) => {
        if (response?.error) {
          alert("로그인에 실패했습니다.");
        }
      });
    }
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      handleSubmit();
    }
  };

  return (
    <Stack
      direction={"column"}
      spacing={2}
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant={"h2"}>👋 로그인 👋</Typography>
      <TextField
        value={userName}
        label="아이디"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUserName(event.target.value);
        }}
        sx={{ width: "20vw" }}
      />
      <TextField
        value={password}
        label="비밀번호"
        type="password"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(event.target.value);
        }}
        onKeyDown={handleEnter}
        sx={{ width: "20vw" }}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ width: "100%", padding: 1.5, borderRadius: 3 }}
      >
        로그인
      </Button>
      <Link
        href={"/register"}
        style={{ textDecoration: "none", color: "#5A6A85", marginTop: 25 }}
      >
        아직 회원이 아니신가요? <strong>회원가입</strong>
      </Link>
    </Stack>
  );
}

export default Login;
