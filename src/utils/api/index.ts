import axios from "axios";

const SPRING_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.doldolmeet.shop"
    : "http://localhost:8080";

export const backend_api = axios.create({
  baseURL: SPRING_URL,
});

export const OPENVIDU_URL =
  process.env.NODE_ENV === "production"
    ? "https://3.39.215.13"
    : "http://localhost:4443";

export const OPENVIDU_SECRET =
  process.env.NODE_ENV === "production" ? "MY_SECRET" : "MY_SECRET";

export const openvidu_api = axios.create({
  baseURL: OPENVIDU_URL,
  headers: {
    Authorization: "Basic " + btoa(`OPENVIDUAPP:${OPENVIDU_SECRET}`),
    "Content-Type": "application/json",
  },
});
