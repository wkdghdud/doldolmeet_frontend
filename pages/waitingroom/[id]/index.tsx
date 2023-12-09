"use client";
import { Grid, Stack } from "@mui/material";
// import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchFanMeeting,
  useFanMeeting,
  useMainWaitRoom,
} from "@/hooks/fanmeeting";
import React, { useEffect, useState } from "react";
import ShowVideoStreaming from "@/components/ShowVideoStreaming";
import { Connection, OpenVidu } from "openvidu-browser";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import InviteDialog from "@/components/InviteDialog";
import ChatAndMemo from "@/components/ChatAndMemo";
import Typography from "@mui/material/Typography";
import StartFanMeetingDialog from "@/components/InviteDialog/StartFanMeetingDialog";

import { useRouter } from "next/router";

interface NextRoomEvent {
  nextRoomId: string;
  currRoomType: string;
  roomThumbnail: string;
  idolNickName: string;
}

const WaitingRoom = () => {
  const router = useRouter();
  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = router.query;
  // const fanMeetingId = searchParams?.get("id");
  const fanMeetingId = searchParams.fanMeetingId;
  useEffect(() => {
    console.log("fanMeeti😇😇😇😇😇😇😇😇😇ngId", fanMeetingId);
  }, []);
  const { data: fanMeeting } = useFanMeeting(fanMeetingId);
  const { data: waitRoomId } = useMainWaitRoom(fanMeetingId);

  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      if (as !== currentPath) {
        leaveWaitingRoom();
        return true;
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);

  const [role, setRole] = useState<Role>(Role.FAN);
  const [userName, setUserName] = useState<string>("");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");
  const [connection, setConnection] = useState<Connection | undefined>(
    undefined,
  );
  const [pepleAhead, setPeopleAhead] = useState<number>(0);

  const token = useJwtToken();

  /* FanMeeting 이름 */
  const [fanMeetingName, setFanMeetingName] = useState<string | undefined>();

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
    if (waitRoomId && role && userName) {
      joinSession(waitRoomId);
    }
  }, [waitRoomId, role, userName]);

  useEffect(() => {
    if (fanMeetingId) {
      fetchFanMeetingTitle();
    }
  }, [fanMeetingId]);

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      // setOV(ov);

      const mySession = ov.initSession();

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setConnection(connection);
      }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: role,
          fanMeetingId: fanMeetingId,
          userName: userName,
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
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 SSE 연결되었습니다.");
    });

    eventSource.addEventListener(
      "moveToFirstIdolWaitRoom",
      (e: MessageEvent) => {
        console.log(
          "😎 첫 번째 아이돌과의 영상통화방으로 이동하세요! ",
          JSON.parse(e.data),
        );
        setNextRoomId(JSON.parse(e.data).nextRoomId);
        setPopupOpen(true);
      },
    );

    eventSource.addEventListener("numberOfPeopleAhead", (e: MessageEvent) => {
      console.log("🥹 numberOfPeopleAhead: ", JSON.parse(e.data));
      setPeopleAhead(JSON.parse(e.data));
    });

    eventSource.addEventListener("moveToIdolRoom", (e: MessageEvent) => {
      console.log("🥹 moveToIdolRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      setPopupOpen(true);
    });

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("error");
      console.log(e);
      // eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };
  };

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

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    setPopupOpen(false);
  };

  const fetchFanMeetingTitle = async () => {
    try {
      const fanMeeting = await fetchFanMeeting(fanMeetingId);

      if (fanMeeting) {
        setFanMeetingName(fanMeeting.title);
      }
    } catch (error) {
      console.error("FanMeeting fetch error:", error);
    }
  };

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        spacing={3}
        sx={{ px: 2 }}
      >
        <Grid item xs={8} sx={{ width: "100%", height: "70%" }}>
          <Stack
            direction={"column"}
            justifyContent="center"
            alignItems="flex-start"
            sx={{ width: "100%" }}
            spacing={2}
          >
            <Typography variant={"h4"}>
              {fanMeetingName && `💜 ${fanMeetingName} 대기방 💜`}
            </Typography>
            <div
              style={{
                width: "100%",
                height: "40%",
              }}
            >
              <ShowVideoStreaming />
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "30%",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  position: "absolute",
                  top: "35%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                  fontWeight: 700,
                  color: "#212121",
                  marginBottom: 10,
                }}
              >
                👨‍👦‍👦👩‍👧‍👦👨‍👧‍👦당신은 {pepleAhead + 1}번째 순서입니당!👨‍👦‍👦👩‍👧‍👦👨‍👧‍👦
              </Typography>
              <img
                src={"/waiting_dino.gif"}
                alt="조금만 기다려주세요"
                style={{
                  height: "30vh",
                  width: "100%",
                  borderRadius: 20,
                  objectFit: "cover",
                  position: "relative",
                  zIndex: 0,
                }}
              />
            </div>
          </Stack>
        </Grid>
        <Grid item xs={4} sx={{ height: "70%" }}>
          <ChatAndMemo chatRoomId={fanMeeting?.chatRoomId} height={"75vh"} />
        </Grid>
      </Grid>
      <StartFanMeetingDialog
        open={popupOpen}
        handleClose={handleClose}
        handleEnter={joinNextRoom}
      />
    </>
  );
};

export default WaitingRoom;
