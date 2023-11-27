"use client";
import { Grid, Tab, Tabs } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useFanMeeting, useMainWaitRoom } from "@/hooks/fanmeeting";
import Memo from "@/components/Mymemo";
import { useEffect, useState } from "react";
import ShowChat from "@/components/ShowChat";
import ShowVideoStreaming from "@/components/ShowVideoStreaming";
import { Connection, OpenVidu } from "openvidu-browser";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import InviteDialog from "@/components/InviteDialog";

interface NextRoomEvent {
  nextRoomId: string;
  currRoomType: string;
}

const WaitingRoom = () => {
  const router = useRouter();
  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");
  const { data: fanMeeting } = useFanMeeting(fanMeetingId);
  const { data: waitRoomId } = useMainWaitRoom(fanMeetingId);

  const [role, setRole] = useState<Role>(Role.FAN);
  const [userName, setUserName] = useState<string>("");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");
  const [connection, setConnection] = useState<Connection | undefined>(
    undefined,
  );

  const token = useJwtToken();

  useEffect(() => {
    if (userName) {
      fetchSSE();
    }
  }, [userName]);

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
        setUserName(res.sub);
      }
    });
  }, [token]);

  useEffect(() => {
    console.log("😍", role);
    console.log("😍", userName);
  }, [role, userName]);

  useEffect(() => {
    if (waitRoomId) {
      joinSession(waitRoomId);
    }
  }, []);

  useEffect(() => {
    if (waitRoomId) {
      joinSession(waitRoomId);
    }
  }, [waitRoomId]);

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
      if (connection) {
        setConnection(connection);
      }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: role, // TODO: auth로 변경
          fanMeetingId: fanMeetingId,
          userName: userName, // TODO: userName으로 변경
          type: "waitingRoom",
        }),
      });

      // setSession(mySession);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const fetchSSE = () => {
    console.log("🤡 fetchSSE");
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );
    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 연결되었습니다.");
    });

    eventSource.addEventListener(
      "moveToFirstIdolWaitRoom",
      (e: MessageEvent) => {
        console.log("🥹 moveToFirstIdolWaitRoom: ", JSON.parse(e.data));
        setNextRoomId(JSON.parse(e.data).nextRoomId);
        setPopupOpen(true);
      },
    );

    eventSource.addEventListener("moveToIdolRoom", (e: MessageEvent) => {
      console.log("🥹 moveToIdolRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      setPopupOpen(true);
    });

    eventSource.onopen = () => {
      console.log("연결되었습니다.");
    };

    eventSource.onmessage = async (e) => {
      const res = await e.data;
      // const parsedData = JSON.parse(res);
      console.log("데이터가 도착했습니다.");
      // console.log(parsedData);
      joinSession("waitingRoom"); //
      // alert(res)
      // 받아오는 data로 할 일
      // eventSource.close();
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("error");
      console.log(e);
      eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };
  };

  // TODO: 창을 끌 때 connection을 끊어야 함
  const leaveWaitingRoom = async () => {
    if (waitRoomId && connection?.connectionId) {
      await closeOpenViduConnection(waitRoomId, connection.connectionId);
    }
  };

  const joinNextRoom = async () => {
    await leaveWaitingRoom();
    router.push(
      `/one-idol-waitingroom?fanMeetingId=${fanMeetingId}&sessionId=${nextRoomId}`,
    );
  };

  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Tabs value={tabValue} onChange={handleChange}>
        <Tab label="채팅" />
        <Tab label="메모" />
      </Tabs>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        padding="30px"
        spacing={3}
      >
        <Grid item xs={6}>
          <ShowVideoStreaming />
        </Grid>
        <Grid item xs={6} sx={{ height: "85vh" }}>
          {/*<ShowChat roomId={fanMeeting?.chatRoomId} />*/}
          <Grid item xs={6}>
            <div style={{ display: tabValue === 0 ? "block" : "none" }}>
              <ShowChat roomId={fanMeeting?.chatRoomId} />
            </div>
            <div style={{ display: tabValue === 1 ? "block" : "none" }}>
              <Memo />
            </div>
          </Grid>
        </Grid>
      </Grid>
      <InviteDialog
        open={popupOpen}
        handleClose={() => setPopupOpen(false)}
        handleEnter={joinNextRoom}
      />
    </>
  );
};

export default WaitingRoom;
