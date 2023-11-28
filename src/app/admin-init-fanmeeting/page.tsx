"use client";
import { useEffect, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import {
  closeOpenViduSession,
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";
import { Button } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import {
  fetchAllRoomIdsByAdmin,
  updateFanMeetingRoomCreated,
} from "@/hooks/fanmeeting";
import { backend_api } from "@/utils/api";

const AdminInitFanMeetingPage = () => {
  // const [OV, setOV] = useState<OpenVidu | undefined>();
  // const [sessionId, setSessionId] = useState<string>("test-idol-session-1");
  // const [myConnection, setMyConnection] = useState<Connection | undefined>();
  // const [session, setSession] = useState<Session | undefined>();

  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  const [role, setRole] = useState<Role>(Role.ADMIN);
  const [userName, setUserName] = useState<string>("");
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const token = useJwtToken();

  useEffect(() => {
    if (fanMeetingId) {
      fetchAllRoomIdsByAdmin(fanMeetingId).then((res) => {
        setSessionIds(res);
      });
    }
  }, []);

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
        setUserName(res.sub);
      }
    });
  }, [token]);

  const joinMultipleSession = async () => {
    sessionIds.forEach(async (sessionId) => {
      await joinSession(sessionId);
    });
    if (fanMeetingId) {
      updateFanMeetingRoomCreated(fanMeetingId);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      // setOV(ov);

      const mySession = ov.initSession();

      await createOpenViduSession(sessionId);

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        // setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
      });

      mySession.on("streamDestroyed", (event) => {
        // deleteSubscriber(event.stream.streamManager);
      });

      const connection = await createOpenViduConnection(sessionId);
      // if (connection) {
      //   setMyConnection(connection);
      // }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: role,
          fanMeetingId: fanMeetingId,
          userName: userName,
        }),
      });

      // setSession(mySession);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const endFanMeeting = () => {
    sessionIds.forEach((sessionId) => {
      closeOpenViduSession(sessionId);
    });
  };

  const startFanMeeting = () => {
    backend_api()
      .post(`/fanMeetings/${fanMeetingId}/start`)
      .then((res) => {
        console.log(res);
      });
  };

  return (
    <div>
      <h1>Admin Init Fan Meeting Page</h1>
      <Button variant={"contained"} onClick={joinMultipleSession}>
        팬미팅 생성하기
      </Button>
      <Button variant={"contained"} onClick={startFanMeeting}>
        팬미팅 시작하기
      </Button>
      <Button variant={"contained"} onClick={endFanMeeting}>
        팬미팅 종료하기
      </Button>
    </div>
  );
};

export default AdminInitFanMeetingPage;
