"use client";
import React, { useEffect, useState } from "react";
import {
  Connection,
  OpenVidu,
  Publisher,
  Session,
  Subscriber,
} from "openvidu-browser";
import { useRouter, useSearchParams } from "next/navigation";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import { Role } from "@/types";
import { fetchFanToFanMeeting } from "@/hooks/useFanMeetings";
import { Box, Grid, Stack } from "@mui/material";
import IdolStreamView from "@/components/meeting/IdolStreamView";
import FanStreamView from "@/components/meeting/FanStreamView";
import Game from "@/components/Game";

const GamePage = () => {
  const router = useRouter();

  const [session, setSession] = useState<Session | undefined>();

  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("fanMeetingId");
  const sessionId = searchParams?.get("sessionId");

  /* Role */
  const token: Promise<JwtToken | null> = useJwtToken();
  const [role, setRole] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [myNickName, setMyNickName] = useState<string | undefined>();

  /* 아이돌들의 Stream */
  const [idolStreams, setIdolStreams] = useState<Subscriber[]>([]);

  /* 팬들의 Stream */
  const [fanStreams, setFanStreams] = useState<Subscriber[]>([]);

  /* 나의 Stream */
  const [myStream, setMyStream] = useState<Publisher | undefined>();

  /* OpenVidu Connection */
  const [myConnection, setMyConnection] = useState<Connection | undefined>();

  /* Main Stream */
  const [mainStream, setMainStream] = useState<
    Subscriber | Subscriber | Publisher | undefined
  >();

  /* 아이돌이 다 들어왔는지 */
  const [allIdolEntered, setAllIdolEntered] = useState<boolean>(false);

  /*노래 다시 듣기*/
  const [replaynum, setReplaynum] = useState(0);

  /*게임시작*/
  const [gameStart, setGameStart] = useState(false);

  /*위너*/
  const [winner, setWinner] = useState<string | undefined>();

  useEffect(() => {
    token.then((res) => {
      setRole(res?.auth);
      setUserName(res?.sub ?? "");
      setMyNickName(res?.nickname ?? "");
    });
  }, [token]);

  useEffect(() => {
    async function init() {
      if (role === Role.IDOL) {
        await fetchSSE_idol();
        await joinSession();
      } else if (role === Role.FAN) {
        await fetchSSE();
        const fanToFanMeeting = await fetchFanToFanMeeting(fanMeetingId);
        await joinSession(fanToFanMeeting?.chatRoomId);
      } else {
        await joinSession();
      }
    }

    if (role && userName !== "") {
      init();
    }
  }, [role, userName]);

  const fetchSSE_idol = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 아이돌 SSE 연결되었습니다.");
    });

    eventSource.addEventListener("idolGameStart", (e: MessageEvent) => {
      console.log("🥹 game이 시작됐습니다!", JSON.parse(e.data));
      // setGameStart(true);
    });

    eventSource.addEventListener("gameEnd", (e: MessageEvent) => {
      console.log("🥹 game이 종료됐습니다!", JSON.parse(e.data));
      // setGameEnd(true);
    });

    eventSource.onopen = () => {
      console.log("📣 아이돌 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();
    };

    return true;
  };

  const fetchSSE = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 연결되었습니다.");
    });

    eventSource.addEventListener("moveToWaitRoom", (e: MessageEvent) => {
      console.log("👋 moveToWaitRoom: ", JSON.parse(e.data));
      joinNextRoom(JSON.parse(e.data).nextRoomId);
    });

    // eventSource.addEventListener("gameStart", (e: MessageEvent) => {
    //   console.log("🥹 game이 시작됐습니다!", JSON.parse(e.data));
    //   setGameStart(true);
    // });

    eventSource.addEventListener("gameEnd", (e: MessageEvent) => {
      console.log("🥹 game이 종료됐습니다!", JSON.parse(e.data));
      // setGameEnd(true);
    });

    eventSource.onopen = () => {
      console.log("📣 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();
    };

    eventSource.addEventListener("allIdolEntered", (e: MessageEvent) => {
      console.log("👋 아이돌이 다 들어왔어요!!!!: ", JSON.parse(e.data));
      setAllIdolEntered(true);
    });

    return true;
  };

  const joinNextRoom = async (sessionId: string) => {
    console.log("🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠", winner);
    router.push(
      `/end-fanmeeting/${userName}/${fanMeetingId}?winner=${
        winner === userName ? "true" : "false"
      }`,
    );
  };

  const joinSession = async (_chatRoomId?: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        const clientData = JSON.parse(event.stream.connection.data).clientData;
        const role = JSON.parse(clientData).role;
        if (role === Role.IDOL) {
          setIdolStreams((prev) => [...prev, subscriber]);
        } else if (role === Role.FAN) {
          setFanStreams((prev) => [...prev, subscriber]);
        } else {
          setFanStreams((prev) => [...prev, subscriber]);
        }
      });

      mySession.on("streamDestroyed", (event) => {
        // TODO: Subscriber 삭제
        const subscriber = mySession.subscribe(event.stream, undefined);
        const clientData = JSON.parse(event.stream.connection.data).clientData;
        const role = JSON.parse(clientData).role;
        deleteSubscriber(role, subscriber);
      });

      mySession.on("signal:send_replay", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          setReplaynum((prev) => prev + 1);
        }
      });

      mySession.on("signal:gameStart", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 게임시작", event.data);
          setGameStart(true);
        }
      });

      mySession.on("signal:alertWinner", (event) => {
        console.log("👋 게임종료", event.data);
        setWinner(event.data);
        alert(`${event.data}님이 정답을 맞추셨습니다!`);
      });

      mySession.on("signal:click_answer", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          // setClickAnswer(data.isAnswer);
        }
      });

      mySession.on("signal:goToEndPage", (event) => {
        joinNextRoom();
      });

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;

      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: role,
          fanMeetingId: fanMeetingId,
          userName: userName,
          nickname: myNickName,
          type: "gameRoom",
        }),
        kurentoOptions: {
          allowedFilters: [
            "FaceOverlayFilter",
            "ChromaFilter",
            "GStreamerFilter",
          ],
        },
      });

      await ov.getUserMedia({
        audioSource: undefined,
        videoSource: undefined,
      });

      const devices = await ov.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const newPublisher = await ov.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: "1280x720",
        frameRate: 60,
        insertMode: "APPEND",
        mirror: false,
      });

      newPublisher.subscribeToRemote();
      mySession.publish(newPublisher);
      setSession(mySession);
      setMyStream(newPublisher);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const leaveSession = async () => {
    if (sessionId && myConnection?.connectionId) {
      await closeOpenViduConnection(sessionId, myConnection?.connectionId);
    }

    // state 초기화
    setMyStream(undefined);
    setMyConnection(undefined);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [leaveSession]);

  const deleteSubscriber = (role, streamManager) => {
    if (role === Role.IDOL) {
      setIdolStreams((prevSubscribers) => {
        const index = prevSubscribers.indexOf(streamManager);
        if (index > -1) {
          const newSubscribers = [...prevSubscribers];
          newSubscribers.splice(index, 1);
          return newSubscribers;
        } else {
          return prevSubscribers;
        }
      });
    } else {
      setFanStreams((prevSubscribers) => {
        const index = prevSubscribers.indexOf(streamManager);
        if (index > -1) {
          const newSubscribers = [...prevSubscribers];
          newSubscribers.splice(index, 1);
          return newSubscribers;
        } else {
          return prevSubscribers;
        }
      });
    }
  };

  return (
    <Grid container>
      <Grid item xs={10}>
        {/* 아이돌 카메라 영역*/}
        <Stack direction="column" spacing={1} sx={{ minHeight: "40vh" }}>
          <Stack
            direction={"row"}
            sx={{
              width: "100%",
              backgroundColor: "#eeeeee",
              py: 2,
              px: 1,
              borderRadius: 5,
            }}
          >
            {role === Role.IDOL && myStream && (
              <IdolStreamView
                key={myStream.id}
                streamManager={myStream}
                name={"아이돌"}
              />
            )}
            {idolStreams.map((stream) => (
              <IdolStreamView
                key={stream.id}
                streamManager={stream}
                name={"아이돌"}
              />
            ))}
          </Stack>
          {/* 게임 문제 나오는 영역 */}
          <Game
            role={role}
            fanMeetingId={fanMeetingId}
            sessionId={sessionId}
            allIdolEntered={allIdolEntered}
            userName={userName}
            replaynum={replaynum}
            gameStart={gameStart}
            setWinnerName={(winnerName) => setWinner(winnerName)}
          />
        </Stack>
      </Grid>
      {/* 팬들 카메라 나오는 곳 */}
      <Grid item xs={2} sx={{ borderRadius: 3 }}>
        <Box sx={{ height: "84vh", overflowY: "auto", paddingLeft: 3 }}>
          <Stack
            direction={"column"}
            spacing={1}
            sx={{ py: 2, px: 1, borderRadius: 3 }}
          >
            {role === Role.FAN && myStream && (
              <FanStreamView
                key={myStream.id}
                streamManager={myStream}
                name={"팬"}
              />
            )}
            {fanStreams.map((stream) => (
              <FanStreamView
                key={stream.id}
                streamManager={stream}
                name={"팬"}
              />
            ))}
          </Stack>
        </Box>
      </Grid>
      {/* 퀴즈 답안 입력 */}
      {/*<Grid item xs={3.5}>*/}
      {/*</Grid>*/}
    </Grid>
  );
};

export default GamePage;
