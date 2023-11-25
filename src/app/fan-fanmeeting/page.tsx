"use client";
import OneIdolWaitingRoom from "@/app/one-idol-waitingroom/page";
import { useEffect, useState } from "react";
import {
  EnterFanMeetingProps,
  EnterFanMeetingReturn,
  updateConnectionData,
} from "@/utils/openvidu";
import TwoPersonMeetingPage from "@/app/two-person-meeting/page";
import useJwtToken from "@/hooks/useJwtToken";
import { Role } from "@/types";
import { OpenVidu, Session, StreamManager } from "openvidu-browser";
import { fetchCurrentRoomId } from "@/hooks/useCurrentRoomId";
import { useSearchParams } from "next/navigation";
import { backend_api } from "@/utils/api";
import InviteDialog from "@/components/InviteDialog";

const FanFanmeetingPage = () => {
  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  /* States */
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [idolStream, setIdolStream] = useState<StreamManager | undefined>();
  const [fanStream, setFanStream] = useState<StreamManager | undefined>(
    undefined,
  );
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  // 총 대기실에서 처음 넘어올 때는 바로 아이돌과의 영상통화 화면으로 가므로 isWaitingRoom의 초기값은 false
  const [isWaitingRoom, setIsWaitingRoom] = useState<boolean>(false);

  /* 현재 로그인된 팬의 세션 아이디를 받아옴 */
  // const { sessionId } = useCurrentRoomId(fanMeetingId ?? "");
  const [nextSessionId, setNextSessionId] = useState<string>("");

  /* username 받아오기 */
  const jwtToken = useJwtToken();
  useEffect(() => {
    jwtToken.then((res) => setUserName(res?.sub ?? ""));
  }, [jwtToken]);

  // useEffect(() => {
  //   async function init() {
  //     await fetchCurrentRoomId(fanMeetingId ?? "").then((res) => {
  //       console.log("🚀 현재 방 아이디: ", res?.roomId);
  //       setNextSessionId(res?.roomId);
  //     });
  //   }
  //
  //   init();
  // }, []);

  useEffect(() => {
    async function enterNewSession(isWaitingRoom: boolean) {
      if (isWaitingRoom) {
        // 현재 대기실에 있다면 아이돌과의 영상통화방으로 이동
        await goToIdolSession();
      } else {
        await goToWaitingRoom();
      }
    }

    setIsWaitingRoom(!isWaitingRoom);
    enterNewSession(isWaitingRoom);
  }, [nextSessionId]);

  const goToIdolSession = async () => {
    console.log("💜 아이돌이 있는 세션으로 이동!");
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const token = await createToken();

      mySession.on("streamCreated", (event) => {
        console.log("👀 아이돌 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        // const clientData = JSON.parse(event.stream.connection.data);
        // if (clientData?.role === Role.IDOL) {
        setIdolStream(subscriber);
        // }
      });

      mySession.on("signal:invite", (event) => {
        const nextSessionId = event.data;
        console.log("🚀 새로운 방으로 들어오세요~ ", nextSessionId);
        if (nextSessionId) {
          setNextSessionId(nextSessionId);
          setPopupOpen(true);
        }
      });

      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: Role.FAN,
          userName: userName,
        }),
      });

      const newPublisher = await ov.initPublisherAsync(undefined, {});
      mySession.publish(newPublisher);

      setSession(mySession);
      setFanStream(newPublisher);
      setIsWaitingRoom(false);

      // 영상통화방에 들어온 팬을 저장하는 API
      await saveFanTeleing();

      // Connection 데이터를 업데이트하는 API 호출
      await updateConnectionData({
        connectionId: mySession?.connection?.connectionId ?? "",
        connectionToken: token,
        fanMeetingId: fanMeetingId ?? "",
        username: userName ?? "",
        roomId: nextSessionId,
        type: "TELE",
      });
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const goToWaitingRoom = async () => {
    console.log("💜 다음 아이돌의 대기실로 이동!", nextSessionId);
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const token = await createToken();

      mySession.on("streamCreated", (event) => {
        console.log("👀 아이돌 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        // const clientData = JSON.parse(event.stream.connection.data);
        // if (clientData?.role === Role.IDOL) {
        setIdolStream(subscriber);
        // }
      });

      mySession.on("signal:invite", (event) => {
        const nextSessionId = event.data;
        console.log("🚀 새로운 방으로 들어오세요~ ", nextSessionId);
        if (nextSessionId) {
          setNextSessionId(nextSessionId);
          setPopupOpen(true);
        }
      });

      mySession.on("signal:evict", async (event) => {
        console.log("😭 팬미팅이 종료돼서 나가래요");
        await getNextWaitRoom();
        setPopupOpen(true);
      });

      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: Role.FAN,
          userName: userName,
        }),
      });

      const newPublisher = await ov.initPublisherAsync(undefined, {});
      mySession.publish(newPublisher);

      setSession(mySession);
      setFanStream(newPublisher);
      setIsWaitingRoom(true);

      // 대기방에 들어온 팬을 저장하는 API
      await saveFanWaitingApi();

      // Connection 데이터를 업데이트하는 API 호출
      await updateConnectionData({
        connectionId: mySession?.connection?.connectionId ?? "",
        connectionToken: token,
        fanMeetingId: fanMeetingId ?? "",
        username: userName ?? "",
        roomId: nextSessionId,
        type: "WAIT",
      });
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const getNextWaitRoom = async () => {
    await backend_api()
      .get(`/fanMeetings/${fanMeetingId}/nextWaitRoom`)
      .then((res) => {
        console.log("🚀 다음 대기실: ", res?.data?.data?.roomId);
        if (res?.data?.data?.roomId) {
          setNextSessionId(res?.data?.data?.roomId);
        }
      });
  };

  const createToken = async () => {
    const response = await backend_api().post(
      "/api/sessions/" + nextSessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data; // The token
  };

  // 대기방에 들어온 팬을 저장하는 API
  const saveFanWaitingApi = async () => {
    await backend_api().post(
      `username/${userName}/waitRoomId/${nextSessionId}/fanMeetingId/${fanMeetingId}/saveFanWaiting`,
    );
  };

  // 영상통화방에 들어온 팬을 저장하는 API
  const saveFanTeleing = async () => {
    await backend_api().post(
      `username/${userName}/teleRoomId/${nextSessionId}/fanMeetingId/${fanMeetingId}/saveFanTeleing`,
    );
  };

  /* 입장할 때 전체 대기실 OpenVidu 세션에 연결 */
  useEffect(() => {
    async function enterTotalWaitingRoom() {
      if (fanMeetingId) {
        await enterWaitingRoom({
          fanMeetingId: fanMeetingId,
        }).then((res) => {
          console.log("🚀 총 대기실 입장!", res);
        });
      }
    }

    enterTotalWaitingRoom();
  }, []);

  const enterWaitingRoom = async ({
    fanMeetingId,
  }: EnterFanMeetingProps): Promise<EnterFanMeetingReturn | null> => {
    console.log("💜 enterWaitingRoom 실행!", fanMeetingId);

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
        console.log("🚀 팬미팅하러 들어오세요~ ", nextSessionId);
        if (nextSessionId) {
          setNextSessionId(nextSessionId);
          setPopupOpen(true);
        }
      });

      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: Role.FAN,
          userName: userName,
        }),
      });

      const newPublisher = await ov.initPublisherAsync(undefined, {});

      mySession.publish(newPublisher);

      const response: EnterFanMeetingReturn = {
        publisher: newPublisher,
        ...sessionResponse.data.data,
      };

      return response;
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  return (
    <>
      {isWaitingRoom ? (
        <>
          <OneIdolWaitingRoom fanStream={fanStream} />
        </>
      ) : (
        <TwoPersonMeetingPage fanStream={fanStream} idolStream={idolStream} />
      )}
      <InviteDialog
        open={popupOpen}
        handleClose={() => setPopupOpen(false)}
        handleEnter={() => {
          goToIdolSession();
          setPopupOpen(false);
        }}
      />
    </>
  );
};

export default FanFanmeetingPage;
