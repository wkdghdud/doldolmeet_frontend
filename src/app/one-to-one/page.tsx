"use client";
import {
  Connection,
  OpenVidu,
  Publisher,
  Session,
  StreamManager,
} from "openvidu-browser";
import { Grid, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import { Role } from "@/types";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import DeviceControlButton from "@/components/meeting/DeviceControlButton";
import { fetchFanToFanMeeting } from "@/hooks/useFanMeetings";
import { useRouter, useSearchParams } from "next/navigation";
import LinearTimerBar from "@/components/ShowTimer";
import MyStreamView from "@/components/meeting/MyStreamView";
import PartnerStreamView from "@/components/meeting/PartnerStreamView";
import ChatAndMemo from "@/components/ChatAndMemo";
import EndAlertBar from "@/components/Timer";
import { backend_api, SPRING_URL } from "@/utils/api";
import MotionDetector from "@/components/MotionDetector";

import { fetchFanMeeting } from "@/hooks/fanmeeting";
import Game from "@/components/Game";
import GameSecond from "@/components/GameSecond";
import { v4 as uuidv4 } from "uuid";
import SpeechRecog from "../../components/Speech-Recognition";

const OneToOnePage = () => {
  const router = useRouter();

  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("fanMeetingId");
  const sessionId = searchParams?.get("sessionId");
  const idolName = searchParams?.get("idolName");
  const motionType = searchParams?.get("motionType");
  const gameType = searchParams?.get("gameType");

  /* OpenVidu */
  const [OV, setOV] = useState<OpenVidu | undefined>();

  /* OpenVidu Session Info*/
  const [session, setSession] = useState<Session | undefined>();

  /* OpenVidu Stream */
  const [myStream, setMyStream] = useState<Publisher | undefined>();
  const [partnerStream, setPartnerStream] = useState<
    StreamManager | undefined
  >();

  /* 닉네임 */
  const [myNickName, setMyNickName] = useState<string | undefined>(undefined);
  const [partnerNickName, setPartnerNickName] = useState<string | undefined>(
    undefined,
  );

  /* OpenVidu Connection */
  const [myConnection, setMyConnection] = useState<Connection | undefined>();

  /* Layout */
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  /* React Query FanToFanMeeting 조회 */
  const [chatRoomId, setChatRoomId] = useState<string | undefined>();

  /* 팬미팅 종료 임박 Alert */
  const [endSoon, setEndSoon] = useState<boolean>(false);

  /* 녹화를 위한 recordingid */
  const [forceRecordingId, setForceRecordingId] = useState("");

  /* 다음 아이돌의 대기실로 넘어가기 위해 필요한 state */
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [, setNextRoomId] = useState<string>("");

  /* Role */
  const token: Promise<JwtToken | null> = useJwtToken();
  const [role, setRole] = useState<Role | undefined>();
  const [userName, setUserName] = useState<string>("");

  /* Camera 효과음 */
  const [shutter, setShutter] = useState<HTMLAudioElement>();
  const [partnerPose, setPartnerPose] = useState<boolean>(false);

  /* FanMeeting 이름 */
  const [fanMeetingName, setFanMeetingName] = useState<string | undefined>();

  /* 게임시작 */
  const [gameStart, setGameStart] = useState<boolean>(false);

  /* 게임종료 */
  const [gameEnd, setGameEnd] = useState<boolean>(false);

  /* 이심전심 선택 */
  const [partnerChoice, setPartnerChoice] = useState<string | undefined>();

  /* 상대방 음성 인식 */
  const [partnerVoice, setPartnerVoice] = useState<string | undefined>();

  /* 필터 On/Off */
  const [filter, setFilter] = useState(false);

  /*노래 관련 게임*/
  const [replaynum, setReplaynum] = useState(0);
  const [clickAnswer, setClickAnswer] = useState(0);

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
        setChatRoomId(fanToFanMeeting?.chatRoomId);
        await joinSession(fanToFanMeeting?.chatRoomId);
      } else {
        await joinSession();
      }

      // 카메라 셔터 효과음
      // setShutter(new Audio("/mp3/camera9.mp3"));
    }

    if (role && userName !== "") {
      init();
    }
  }, [role, userName]);

  const startRecording = () => {
    const recording_name = uuidv4();

    console.log("🎥 startRecording", {
      session: sessionId,
      fanMeetingId: fanMeetingId,
      fan: userName,
      idol: idolName,
      name: recording_name,
      hasAudio: true,
      hasVideo: true,
      outputMode: "COMPOSED",
    });

    backend_api()
      .post(
        SPRING_URL + "/recording-java/api/recording/start",

        {
          session: sessionId,
          fanMeetingId: fanMeetingId,
          fan: userName,
          idol: idolName,
          name: recording_name,
          hasAudio: true,
          hasVideo: true,
          outputMode: "COMPOSED",
        },
      )
      .then((response) => {
        // console.log(response.data);
        setForceRecordingId(response.data.id);
      })
      .catch((error) => {
        // console.error("Start recording WRONG:", error);
      });
  };

  const joinSession = async (_chatRoomId?: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      setOV(ov);

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        setPartnerStream(subscriber);
        if (role === Role.IDOL) {
          const clientData = JSON.parse(
            event.stream.connection.data,
          ).clientData;
          const chatRoomId = JSON.parse(clientData).chatRoomId;
          const partnerNickName = JSON.parse(clientData).nickname;
          setChatRoomId(chatRoomId);
          setPartnerNickName(partnerNickName);
        }
      });

      mySession.on("streamDestroyed", (event) => {
        setPartnerStream(undefined);
      });

      mySession.on("signal:pose_detected", (event) => {
        if (event.data !== userName) {
          console.log("👋 상대방이 포즈를 취했어요.", event.data);
          setPartnerPose(true);
        }
      });

      mySession.on("signal:choice_detected", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 선택을 했어요.", event.data);
          setPartnerChoice(data.choice);
        }
      });

      mySession.on("signal:send_replay", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          setReplaynum((prev) => prev + 1);
        }
      });

      mySession.on("signal:click_answer", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          setClickAnswer(data.isAnswer);
        }
      });

      mySession.on("signal:voice_detected", (event) => {
        const data = JSON.parse(event.data);
        // console.log("!!!!!!!!!!!!", data.username, userName);
        if (data.username !== userName) {
          console.log("👋 상대방의 음성 인식.", event.data);

          setPartnerVoice(data.translatedText);
        }
      });

      // await createOpenViduSession(sessionId);

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;

      if (role === Role.IDOL) {
        await mySession.connect(token, {
          clientData: JSON.stringify({
            role: role,
            fanMeetingId: fanMeetingId,
            userName: userName,
            type: "idolRoom",
            chatRoomId: _chatRoomId,
            nickname: myNickName,
            gameType: gameType,
          }),
          kurentoOptions: {
            allowedFilters: [
              "FaceOverlayFilter",
              "ChromaFilter",
              "GStreamerFilter",
            ],
          },
        });
      } else if (role === Role.FAN) {
        await mySession
          .connect(token, {
            clientData: JSON.stringify({
              role: role,
              fanMeetingId: fanMeetingId,
              userName: userName,
              type: "idolRoom",
              chatRoomId: _chatRoomId,
              nickname: myNickName,
              gameType: gameType,
              idolName: idolName,
            }),
            kurentoOptions: {
              allowedFilters: [
                "FaceOverlayFilter",
                "ChromaFilter",
                "GStreamerFilter",
              ],
            },
          })
          .then(() => {
            if (role === Role.FAN) {
              startRecording();
            }
          });
      }

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
        resolution: "640x480",
        frameRate: 30,
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

  const fetchSSE = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 연결되었습니다.");
    });

    eventSource.addEventListener("moveToWaitRoom", (e: MessageEvent) => {
      console.log("👋 moveToWaitRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      joinNextRoom(JSON.parse(e.data).nextRoomId);
    });

    eventSource.addEventListener("endNotice", (e: MessageEvent) => {
      console.log("🥹 통화가 곧 종료 됩니다.", JSON.parse(e.data));
      setEndSoon(true);
    });

    eventSource.addEventListener("gameStart", (e: MessageEvent) => {
      console.log("🥹 game이 시작됐습닌다!!!.", JSON.parse(e.data));
      setGameStart(true);
    });

    eventSource.addEventListener("gameEnd", (e: MessageEvent) => {
      console.log("🥹 game이 종료됐습니다.!!!.", JSON.parse(e.data));
      setGameEnd(true);
    });

    eventSource.onopen = () => {
      console.log("📣 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };

    return true;
  };

  const fetchSSE_idol = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 아이돌 SSE 연결되었습니다.");
    });

    eventSource.addEventListener("idolGameStart", (e: MessageEvent) => {
      console.log("🥹 game이 시작됐습닌다!!!.", JSON.parse(e.data));
      setGameStart(true);
    });

    eventSource.addEventListener("gameEnd", (e: MessageEvent) => {
      console.log("🥹 game이 종료됐습니다.!!!.", JSON.parse(e.data));
      setGameEnd(true);
    });

    eventSource.onopen = () => {
      console.log("📣 아이돌 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };

    return true;
  };
  // 세션을 나가면서 정리
  const leaveSession = async () => {
    if (sessionId && myConnection?.connectionId) {
      await closeOpenViduConnection(sessionId, myConnection?.connectionId);
    }

    // state 초기화
    setMyStream(undefined);
    setPartnerStream(undefined);
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

  const joinNextRoom = async (sessionId: string) => {
    await leaveWaitingRoom();
    if (sessionId === "END") {
      router.push(`/end-fanmeeting/${userName}/${fanMeetingId}`);
    } else {
      router.push(
        `/one-idol-waitingroom?fanMeetingId=${fanMeetingId}&sessionId=${sessionId}`,
      );
    }
  };

  const leaveWaitingRoom = async () => {
    if (sessionId && myConnection?.connectionId) {
      await closeOpenViduConnection(sessionId, myConnection.connectionId);
    }
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

  useEffect(() => {
    if (fanMeetingId) {
      fetchFanMeetingTitle();
    }
  }, [fanMeetingId]);

  const handleclose = () => {
    setGameStart(false);
  };

  const onClickFilter = () => {
    if (myStream?.stream.filter) {
      myStream?.stream.removeFilter();
      setFilter(false);
    } else {
      myStream?.stream.applyFilter("FaceOverlayFilter", {}).then((filter) => {
        filter.execMethod("setOverlayedImage", {
          // uri: AWS_S3_URL + "/e7d8c009-1d9c-411e-9521-7837a6ec9c89.png",
          uri: "https://cdn-icons-png.flaticon.com/512/6965/6965337.png",
          offsetXPercent: -0.2,
          offsetYPercent: -0.8,
          widthPercent: 1.3,
          heightPercent: 1.0,
        });
      });
      setFilter(true);
    }
  };

  const [isSubtitleActive, setSubtitleActive] = useState(false);

  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={fullScreen ? 12 : 8.5}
        sx={{
          backgroundColor: "rgba(238,238,238,0.7)",
          borderRadius: 5,
          padding: 2,
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems={"flex-start"}
        >
          <Grid item xs={12}>
            <Stack
              direction={"row"}
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: "transparent",
                px: 2,
                mb: 2,
                height: 60,
              }}
            >
              <Typography variant={"h4"}>
                {fanMeetingName && `💜 ${fanMeetingName} 💜`}
              </Typography>
              <LinearTimerBar />
              <DeviceControlButton
                publisher={myStream}
                fullScreen={fullScreen}
                toggleFullScreen={() => setFullScreen(!fullScreen)}
                filterOn={filter}
                onClickFilter={onClickFilter}
                toggleSubtitle={() => setSubtitleActive(!isSubtitleActive)}
                isSubtitleActive={isSubtitleActive}
              />
            </Stack>
          </Grid>
          <Grid
            item
            id="video-container"
            xs={12}
            container
            justifyContent="space-between"
          >
            <Grid item xs={6}>
              {role === Role.IDOL ? (
                <MyStreamView
                  name={`😎 ${idolName ?? "아이돌"}`}
                  stream={myStream}
                  left={true}
                  showOverlay={endSoon}
                />
              ) : (
                <PartnerStreamView
                  name={`😎 ${idolName ?? "아이돌"}`}
                  stream={partnerStream}
                  partnerRole={Role.IDOL}
                  left={true}
                  showOverlay={endSoon}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              {role === Role.FAN ? (
                <MyStreamView
                  name={`😍 ${myNickName ?? "팬"}`}
                  stream={myStream}
                  left={false}
                  showOverlay={endSoon}
                />
              ) : (
                <PartnerStreamView
                  name={`😍 ${partnerNickName ?? "팬"}`}
                  stream={partnerStream}
                  partnerRole={Role.FAN}
                  left={false}
                  showOverlay={endSoon}
                />
              )}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <SpeechRecog
              sessionId={sessionId}
              partnerVoice={partnerVoice}
              username={userName}
              active={isSubtitleActive}
            />
          </Grid>
        </Grid>
      </Grid>

      {!fullScreen && (
        <Grid
          item
          xs={3.5}
          sx={{
            backgroundColor: "rgba(238,238,238,0.7)",
            borderRadius: 5,
            padding: 2,
          }}
        >
          <ChatAndMemo chatRoomId={chatRoomId} height={"75vh"} />
        </Grid>
      )}
      <EndAlertBar open={endSoon} handleClose={() => setEndSoon(false)} />
      {fanMeetingId && idolName && sessionId && userName && (
        <MotionDetector
          role={role}
          fanMeetingId={fanMeetingId}
          idolName={idolName}
          sessionId={sessionId}
          partnerPose={partnerPose}
          username={userName}
          motionType={motionType}
        />
      )}
      {gameType === "1" && (
        <Game
          open={gameStart}
          handleclose={handleclose}
          sessionId={sessionId}
          username={userName}
          fanMeetingId={fanMeetingId}
          role={role}
          replaynum={replaynum}
          clickAnswer={clickAnswer}
        />
      )}
      {gameType === "2" && (
        <GameSecond
          open={gameStart}
          sessionId={sessionId}
          username={userName}
          role={role}
          fanMeetingId={fanMeetingId}
          partnerChoice={partnerChoice}
        />
      )}
    </Grid>
  );
};

export default OneToOnePage;
