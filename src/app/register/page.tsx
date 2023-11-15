"use client";

import { useEffect, useState } from "react";
import { TextField, Button } from "@mui/material";
import axios from "axios";
import { useSession } from "next-auth/react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://localhost:8080/signup", {
        username: email,
        password: password,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <TextField
        value={email}
        label="Email"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setEmail(event.target.value);
        }}
      />
      <TextField
        value={password}
        label="Password"
        type="password"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(event.target.value);
        }}
      />
      <Button variant="contained" onClick={handleSignup}>
        회원가입
      </Button>
    </main>
  );
};

export default Signup;
