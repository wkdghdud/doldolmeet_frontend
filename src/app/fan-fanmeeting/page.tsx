"use client";
import OneIdolWaitingRoom from "@/app/one-idol-waitingroom/page";
import { useEffect, useState } from "react";
import { EnterFanMeetingProps, EnterFanMeetingReturn } from "@/utils/openvidu";
import TwoPersonMeetingPage from "@/app/two-person-meeting/page";
import useJwtToken from "@/hooks/useJwtToken";
import { Role } from "@/types";
import { OpenVidu, Session, StreamManager } from "openvidu-browser";
import { useCurrentRoomId } from "@/hooks/useCurrentRoomId";
import { useSearchParams } from "next/navigation";
import { backend_api } from "@/utils/api";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const FanFanmeetingPage = () => {
  // TODO: 현재 로그인된 팬의 세션 아이디를 받아옴
  const userName = "배수지";
  const isWaitingRoom = true;

  /* States */
  const [role, setRole] = useState<Role | undefined>();
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [idolStream, setIdolStream] = useState<StreamManager | undefined>();
  const [fanStream, setFanStream] = useState<StreamManager | undefined>(
    undefined,
  );
  const [openViduToken, setOpenViduToken] = useState<string | undefined>("");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  /* 현재 로그인된 팬의 세션 아이디를 받아옴 */
  const { sessionId } = useCurrentRoomId(fanMeetingId ?? "");
  const [nextSessionId, setNextSessionId] = useState<string>("");

  /* Role 받아오기 */
  const jwtToken = useJwtToken();
  useEffect(() => {
    jwtToken.then((res) => setRole(res?.auth ?? undefined));
  }, [jwtToken]);

  useEffect(() => {
    async function init() {
      await enterFanmeeting({
        fanMeetingId: fanMeetingId ?? "",
      }).then((res) => {
        console.log("🚀 enterFanmeeting 응답", res);
        setOpenViduToken(res?.token);
        if (res?.publisher) {
          setFanStream(res?.publisher);
        }
      });
    }

    init();
  }, [sessionId]);

  /* SessionId가 바뀔 때마다 Session에 접속 */
  // useEffect(() => {
  //   console.log("🚀 Session ID 변경!", sessionId);
  //   console.log("🚀 enterFanmeeting", sessionId);
  //   enterFanmeeting({
  //     fanMeetingId: fanMeetingId ?? "",
  //   }).then((res) => {
  //     console.log("🚀 enterFanmeeting 응답", res);
  //     if (res) {
  //       setOpenViduToken(res.token);
  //       setFanStream(res.publisher);
  //     }
  //   });
  //   // else {
  //   //   console.log("🚀 Join Session");
  //   //   joinSession({
  //   //     token: openViduToken ?? "",
  //   //     userName: userName,
  //   //     role: role ?? Role.FAN,
  //   //   }).then((res) => {
  //   //     if (res) {
  //   //       console.log("🚀 Join Session");
  //   //       setFanStream(res.publisher);
  //   //     }
  //   //   });
  //   // }
  // }, [sessionId]);

  // useEffect(() => {
  //   joinSession({
  //     token: openViduToken ?? "",
  //     userName: userName,
  //     role: role ?? Role.FAN,
  //   }).then((res) => {
  //     if (res) {
  //       console.log("🚀 Join Session");
  //       setFanStream(res.publisher);
  //     }
  //   });
  // }, [openViduToken]);

  const enterFanmeeting = async ({
    fanMeetingId,
  }: EnterFanMeetingProps): Promise<EnterFanMeetingReturn | null> => {
    console.log("💜 enter fan meeting 실행!", fanMeetingId);

    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const sessionResponse = await backend_api().get(
        `/fanMeetings/${fanMeetingId}/session`,
      );
      const token = sessionResponse?.data?.data?.token;

      if (!token) {
        console.error("Token not available");
        return null;
      }

      const mySession = ov.initSession();

      mySession.on("signal:invite", (event) => {
        const nextSessionId = event.data;
        console.log("🚀 들어오세요~ ", nextSessionId);
        // joinNewSession(nextSessionId ?? "");
        setNextSessionId(nextSessionId);
        setPopupOpen(true);
      });

      await mySession.connect(token, {
        clientData: token, // TODO: userName으로 수정 필요
      });

      console.log("💜 커넥션 성공!", token);

      const newPublisher = await ov.initPublisherAsync(undefined, {
        // properties for the publisher
        // ...
      });

      mySession.publish(newPublisher);

      const devices = await ov.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const currentVideoDeviceId = newPublisher.stream
        .getMediaStream()
        .getVideoTracks()[0]
        .getSettings().deviceId;
      const currentVideoDevice = videoDevices.find(
        (device) => device.deviceId === currentVideoDeviceId,
      );

      const response: EnterFanMeetingReturn = {
        publisher: newPublisher,
        currentVideoDevice,
        ...sessionResponse.data.data,
      };

      console.log("💜 response!", response);

      return response;
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const joinNewSession = async (sessionId: string) => {
    console.log("💜 join new session 실행!", sessionId);
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const token = await createToken(sessionId);

      mySession.on("streamCreated", (event) => {
        console.log("👀 아이돌 힘차게 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        setIdolStream(subscriber);
      });

      mySession.on("signal:invite", (event) => {
        const nextSessionId = event.data;
        console.log("🚀 들어오세요~ ", nextSessionId);
        // joinNewSession(nextSessionId ?? "");
        setNextSessionId(nextSessionId);
        setPopupOpen(true);
      });

      await mySession.connect(token, {
        clientData: token, // TODO: userName으로 수정 필요
      });

      console.log("💜 커넥션 성공!", token);

      const newPublisher = await ov.initPublisherAsync(undefined, {
        // properties for the publisher
        // ...
      });

      mySession.publish(newPublisher);

      const devices = await ov.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const currentVideoDeviceId = newPublisher.stream
        .getMediaStream()
        .getVideoTracks()[0]
        .getSettings().deviceId;
      const currentVideoDevice = videoDevices.find(
        (device) => device.deviceId === currentVideoDeviceId,
      );

      setSession(mySession);
      setFanStream(newPublisher);
      // const response: EnterFanMeetingReturn = {
      //   publisher: newPublisher,
      //   currentVideoDevice,
      //   ...sessionResponse.data.data,
      // };

      // console.log("💜 response!", response);
      //
      // return response;
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const createToken = async (sessionId) => {
    const response = await backend_api().post(
      "/api/sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data; // The token
  };

  return (
    <>
      {idolStream === undefined ? (
        <>
          <OneIdolWaitingRoom fanStream={fanStream} />
          <Dialog open={popupOpen} onClose={() => setPopupOpen(false)}>
            <DialogTitle id="alert-dialog-title">{"알림"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                입장하기 버튼을 눌러 영상통화방에 입장해주세요 ☺️
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  joinNewSession(nextSessionId);
                  setPopupOpen(false);
                }}
                autoFocus
              >
                입장하기
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <TwoPersonMeetingPage fanStream={fanStream} idolStream={idolStream} />
      )}
    </>
  );
};

export default FanFanmeetingPage;
