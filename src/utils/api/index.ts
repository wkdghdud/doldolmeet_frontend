import axios from "axios";
import { getSession } from "next-auth/react";

const SPRING_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.doldolmeet.shop"
    : "http://localhost:8080";

export const backend_api = () => {
  const defaultOptions = {
    baseURL: SPRING_URL,
  };

  const instance = axios.create(defaultOptions);

  instance.interceptors.request.use(async (request) => {
    const session = await getSession();
    if (session) {
      // @ts-ignore
      request.headers.Authorization = session?.user?.data;
    }
    return request;
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log(`error`, error);
    },
  );

  return instance;
};

export const OPENVIDU_URL =
  process.env.NODE_ENV === "production"
    ? "https://youngeui-in-jungle.store"
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

export const WS_STOMP_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.doldolmeet.shop/ws-stomp"
    : "http://localhost:8080/ws-stomp";
