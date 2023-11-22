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
  const { sessionId } = useCurrentRoomId(fanMeetingId ?? "");
  const [nextSessionId, setNextSessionId] = useState<string>("");

  /* username 받아오기 */
  const jwtToken = useJwtToken();
  useEffect(() => {
    jwtToken.then((res) => setUserName(res?.sub ?? ""));
  }, [jwtToken]);

  useEffect(() => {
    async function enterNewSession() {
      if (fanMeetingId) {
        await enterFanmeeting({
          fanMeetingId: fanMeetingId,
        }).then((res) => {
          if (res?.publisher) {
            setFanStream(res?.publisher);
          }
        });
      }
    }

    enterNewSession();
  }, []);

  useEffect(() => {
    async function enterNewSession() {
      if (fanMeetingId) {
        await enterFanmeeting({
          fanMeetingId: fanMeetingId,
        }).then((res) => {
          if (res?.publisher) {
            setFanStream(res?.publisher);
          }
        });
      }
    }

    enterNewSession();
  }, [sessionId]);

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

      mySession.on("streamCreated", (event) => {
        console.log("👀 아이돌 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        const clientData = JSON.parse(event.stream.connection.data);
        if (clientData?.role === Role.IDOL) {
          setIdolStream(subscriber);
        }
      });

      mySession.on("signal:invite", (event) => {
        const nextSessionId = event.data;
        console.log("🚀 들어오세요~ ", nextSessionId);
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

      console.log("💜 커넥션 성공!", token);

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

  const goToIdolSession = async (sessionId: string) => {
    console.log("💜 아이돌이 있는 세션으로 이동!", sessionId);
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const token = await createToken(sessionId);

      mySession.on("streamCreated", (event) => {
        console.log("👀 아이돌 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        const clientData = JSON.parse(event.stream.connection.data);
        if (clientData?.role === Role.IDOL) {
          setIdolStream(subscriber);
        }
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
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const goToWaitingRoom = async (sessionId: string) => {
    console.log("💜 다음 아이돌의 대기실로 이동!", sessionId);
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const token = await createToken(sessionId);

      mySession.on("streamCreated", (event) => {
        console.log("👀 아이돌 등장!", event.stream.connection);
        const subscriber = mySession.subscribe(event.stream, undefined);
        const clientData = JSON.parse(event.stream.connection.data);
        if (clientData?.role === Role.IDOL) {
          setIdolStream(subscriber);
        }
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
          goToIdolSession(nextSessionId);
          setPopupOpen(false);
        }}
      />
    </>
  );
};

export default FanFanmeetingPage;
