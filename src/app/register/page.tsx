"use client";

import React, { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import { backend_api } from "@/utils/api";

const Signup = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const response = await backend_api.post("/signup", {
        username: userName,
        password: password,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
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
        label="Email"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUserName(event.target.value);
        }}
        sx={{ width: "20vw" }}
      />
      <TextField
        value={password}
        label="Password"
        type="password"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(event.target.value);
        }}
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
