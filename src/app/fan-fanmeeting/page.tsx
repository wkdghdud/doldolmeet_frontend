"use client";
import OneIdolWaitingRoom from "@/app/one-idol-waitingroom/page";
import { useEffect, useState } from "react";
import { enterFanmeeting, joinSession } from "@/utils/openvidu";
import TwoPersonMeetingPage from "@/app/two-person-meeting/page";
import useJwtToken from "@/hooks/useJwtToken";
import { Role } from "@/types";
import { Session, StreamManager } from "openvidu-browser";
import { useCurrentRoomId } from "@/hooks/useCurrentRoomId";
import { useSearchParams } from "next/navigation";

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

  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  /* 현재 로그인된 팬의 세션 아이디를 받아옴 */
  const { sessionId } = useCurrentRoomId(fanMeetingId ?? "");

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

  /* 현재 세션에 있는 스트림들 중 아이돌과 팬의 스트림을 가져옴 */
  // useEffect(() => {
  //   const idol = session?.streamManagers
  //     .filter(
  //       (stream: StreamManager) =>
  //         JSON.parse(stream.stream.connection.data).role === Role.IDOL,
  //     )
  //     .at(0);
  //
  //   setIdolStream(idol);
  //
  //   const fan = session?.streamManagers
  //     .filter(
  //       (stream: StreamManager) =>
  //         JSON.parse(stream.stream.connection.data).role === Role.FAN,
  //     )
  //     .at(0);
  //
  //   setFanStream(fan);
  // }, [sessionId]);

  return (
    <>
      {isWaitingRoom ? (
        <OneIdolWaitingRoom fanStream={fanStream} />
      ) : (
        <TwoPersonMeetingPage fanStream={fanStream} idolStream={idolStream} />
      )}
    </>
  );
};

export default FanFanmeetingPage;
