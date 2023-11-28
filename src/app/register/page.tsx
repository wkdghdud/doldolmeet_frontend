"use client";

import React, { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import { backend_api } from "@/utils/api";

const Signup = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSignup = async () => {
    if (userName === "" || password === "" || nickname === "") {
      alert("필수값을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await backend_api().post("/signup", {
        username: userName,
        password: password,
        nickname: nickname,
      });

      if (response.status !== 200) {
        alert("회원가입에 실패했습니다.");
      }
    } catch (error) {
      alert("회원가입에 실패했습니다.");
    }
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      handleSignup();
    }
  };

  return (
    <Stack
      direction={"column"}
      spacing={2}
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant={"h2"}>👋 회원가입 👋</Typography>
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
        sx={{ width: "20vw" }}
      />
      <TextField
        value={nickname}
        label="닉네임"
        type="text"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setNickname(event.target.value);
        }}
        onKeyDown={handleEnter}
        sx={{ width: "20vw" }}
      />
      <Button
        variant="contained"
        onClick={handleSignup}
        sx={{ width: "100%", padding: 1.5, borderRadius: 3 }}
      >
        회원가입
      </Button>
    </Stack>
  );
};

export default Signup;
