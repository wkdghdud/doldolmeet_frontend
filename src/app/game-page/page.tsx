"use client";
import React, { useEffect, useState } from "react";
import { Connection, OpenVidu, Session, Subscriber } from "openvidu-browser";
import { useRouter, useSearchParams } from "next/navigation";
import { createOpenViduConnection } from "@/utils/openvidu";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import { Role } from "@/types";
import { fetchFanToFanMeeting } from "@/hooks/useFanMeetings";
import { Grid, Stack } from "@mui/material";
import OpenViduVideoView from "@/components/meeting/OpenViduVideoView";

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

    eventSource.addEventListener("gameStart", (e: MessageEvent) => {
      console.log("🥹 game이 시작됐습니다!", JSON.parse(e.data));
      // setGameStart(true);
    });

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

    return true;
  };

  const joinNextRoom = async (sessionId: string) => {
    router.push(`/end-fanmeeting/${userName}/${fanMeetingId}`);
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
        }
      });

      mySession.on("streamDestroyed", (event) => {
        // TODO: Subscriber 삭제
      });

      mySession.on("signal:choice_detected", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 선택을 했어요.", event.data);
          // setPartnerChoice(data.choice);
        }
      });

      mySession.on("signal:send_replay", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          // setReplaynum((prev) => prev + 1);
        }
      });

      mySession.on("signal:click_answer", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          // setClickAnswer(data.isAnswer);
        }
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
        videoSource: videoDevices[0].deviceId,
        publishAudio: true,
        publishVideo: true,
        resolution: "1280x720",
        frameRate: 60,
        insertMode: "APPEND",
        mirror: false,
        // @ts-ignore
        // filter: {
        //   type: "GStreamerFilter",
        //   options: {
        //     command:
        //       // 'textoverlay text="Photo Time!" valignment=center halignment=center font-desc="Cantarell 25" draw-shadow=true',
        //       "chromahold target-r=50 target-g=0 target-b=50 tolerance=90",
        //   },
        // },
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

  return (
    <Grid container>
      {/* 아이돌, 팬 카메라 영역*/}
      <Grid item xs={8.5}>
        <Stack direction="column" spacing={2}>
          <Stack direction={"row"} spacing={2}>
            {idolStreams.map((stream) => (
              <OpenViduVideoView
                key={stream.id}
                streamManager={stream}
                name={"아이돌"}
                left={false}
                showOverlay={false}
                motionType={undefined}
              />
            ))}
          </Stack>
          <Stack direction={"row"} spacing={2}>
            {idolStreams.map((stream) => (
              <OpenViduVideoView
                key={stream.id}
                streamManager={stream}
                name={"팬"}
                left={false}
                showOverlay={false}
                motionType={undefined}
              />
            ))}
          </Stack>
        </Stack>
      </Grid>
      {/* 퀴즈 답안 입력 */}
      <Grid item xs={3.5}></Grid>
    </Grid>
  );
};

export default GamePage;
