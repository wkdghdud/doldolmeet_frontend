"use client";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import { useEffect, useRef, useState } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import GradientButton from "@/components/GradientButton";
import { AxiosResponse } from "axios";
import { OpenVidu, StreamManager } from "openvidu-browser";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import { backend_api, openvidu_api } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { NextFanInfo, useNextFan } from "@/hooks/useNextFan";
import { Role } from "@/types";
import { updateConnectionData } from "@/utils/openvidu";

interface Props {
  joinSession: (role: string) => void;
  requestJoin: () => void;
}

interface CreateSessionResponse {
  message: string;
  data: CreatedSessionInfo;
}

interface CreatedSessionInfo {
  mainWaitRoomId: string;
  waitRoomId: string;
  teleRoomId: string;
  token: string;
}

const IdolFanMeeting = () => {
  /* State */
  const [publisher, setPublisher] = useState<StreamManager | undefined>(
    undefined,
  );
  const [fanStream, setFanStream] = useState<StreamManager | undefined>();
  const [connected, setConnected] = useState<boolean>(false);
  const [currSessionId, setCurrSessionId] = useState<string>("");
  const [waitingRoomSessionId, setWaitingRoomSessionId] = useState<string>("");
  const [currFanConnectionId, setCurrFanConnectionId] = useState<string>("");
  const [idolUserName, setIdolUserName] = useState<string>("");

  /* Query Param으로 넘어온 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  /* Video Ref */
  const videoRef = useRef<HTMLVideoElement>(null);

  // 현재 로그인된 유저의 세션 정보
  const token = useJwtToken();
  useEffect(() => {
    if (token) {
      token.then((res: JwtToken | null) => {
        setIdolUserName(res?.sub ?? "");
      });
    }
  }, [token]);

  // 다음 팬의 정보
  const nextFan: NextFanInfo = useNextFan(fanMeetingId ?? "");

  // OpenVidu 세션 연결 전 보여줄 카메라 비디오
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // 미디어 스트림을 비디오 요소에 할당
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices: ", error);
      }
    };

    getMedia();

    // 컴포넌트가 언마운트될 때 미디어 스트림 해제
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    };
  }, []);

  // 팬미팅 입장 버튼 클릭 시
  const onClickEntrance = async () => {
    // OpneVidu 객체 생성
    const ov = new OpenVidu();

    // 백엔드에 팬미팅 입장 요청
    await backend_api()
      .get(`/fanMeetings/${fanMeetingId}/session`)
      .then(async (res: AxiosResponse<CreateSessionResponse>) => {
        setCurrSessionId(res?.data?.data?.teleRoomId);
        setWaitingRoomSessionId(res?.data?.data?.waitRoomId);

        const mySession = ov.initSession();

        if (mySession) {
          mySession.on("streamCreated", async (event) => {
            console.log("👀 새로운 팬 입장", event.stream.connection);
            const subscriber = mySession.subscribe(event.stream, undefined);
            // TODO: role 체크해서 팬이면 팬 스트림으로 설정
            // const clientData = JSON.parse(event.stream.connection.data);
            // if (clientData?.role === Role.FAN) {
            setFanStream(subscriber);
            setCurrFanConnectionId(event.stream.connection.connectionId);
            await deleteFanInWaitingQueue();
            // }
          });

          mySession.on("streamDestroyed", (event) => {
            console.log("👀 팬 퇴장");
            setFanStream(undefined);
          });

          mySession
            .connect(res?.data?.data?.token, {
              clientData: JSON.stringify({
                role: Role.IDOL,
                userName: idolUserName,
              }),
            })
            .then(async () => {
              const newPublisher = await ov.initPublisherAsync(undefined, {});
              mySession.publish(newPublisher);
              setPublisher(newPublisher);
              setConnected(true);
            })
            .catch((error) => {
              console.error(
                "There was an error connecting to the session:",
                error.code,
                error.message,
              );
            });
        }
      });
  };

  const getNextFan = async () => {
    console.log("🚀nextFan: ", nextFan);
    console.log("🚀waitingRoomSessionId: ", waitingRoomSessionId);
    console.log("🚀currSessionId: ", currSessionId);

    // if (currFanConnectionId) {
    //   // 팬 내보낸 다음 다음 팬에게 시그널 보내기
    //   await evictFan().then(async () => {
    //     await signalInvite();
    //   });
    // } else {
    await signalInvite();
    // }
  };

  const signalInvite = async () => {
    if (nextFan?.connectionId) {
      await openvidu_api
        .post("/openvidu/api/signal", {
          session: waitingRoomSessionId,
          type: "signal:invite",
          // data: JSON.stringify({
          //   fan_number: "fanNumber",
          //   sessionId: currSessionId,
          // }),
          data: currSessionId,
          to: [nextFan?.connectionId],
        })
        .then((response) => {
          console.log(
            "👋 팬에게 성공적으로 초대 시그널을 보냈습니다.",
            response,
          );
        })
        .catch((error) => console.error(error));
    }
  };

  const signalEvict = async () => {
    if (currFanConnectionId) {
      await openvidu_api
        .post("/openvidu/api/signal", {
          session: currSessionId,
          type: "signal:evict",
          // data: JSON.stringify({
          //   fan_number: "fanNumber",
          //   sessionId: currSessionId,
          // }),
          data: currSessionId,
          to: [currFanConnectionId],
        })
        .then((response) => {
          console.log(
            "👋 팬에게 성공적으로 종료 시그널을 보냈습니다.",
            response,
          );
        })
        .catch((error) => console.error(error));
    }
  };

  const evictFan = async () => {
    await signalEvict().then(async () => {
      await forceDisconnect();
    });
  };

  const forceDisconnect = async () => {
    await openvidu_api
      .delete(
        "/openvidu/api/sessions/" +
          currSessionId +
          "/connection/" +
          currFanConnectionId,
      )
      .then(async (response) => {
        console.log("👋 팬을 성공적으로 내보냈습니다.", response);
      })
      .catch((error) => console.error("팬 내보내기 에러 발생: ", error));
  };

  const deleteFanInWaitingQueue = async () => {
    await backend_api()
      .post(`/idolName/${idolUserName}/deleteFanParticipated`)
      .then((res) => {
        console.log("👋 팬을 성공적으로 대기열에서 삭제했습니다.", res);
      });
  };

  return (
    <>
      {connected && publisher ? (
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={6}>
            <OpenViduVideoComponent streamManager={publisher} />
          </Grid>
          <Grid item xs={6} style={{ position: "relative" }}>
            {fanStream ? (
              <OpenViduVideoComponent streamManager={fanStream} />
            ) : (
              <>
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: "center",
                    position: "absolute",
                    top: "45%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    fontWeight: 700,
                    color: "#ffffff",
                    fontSize: "2rem",
                  }}
                >
                  곧 팬이 들어올 예정이에요.
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: "center",
                    position: "absolute",
                    top: "55%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    fontWeight: 700,
                    color: "#ffffff",
                    fontSize: "2rem",
                  }}
                >
                  조금만 기다려주세요 ☺️
                </Typography>
                <img
                  src={"/fan.webp"}
                  alt="조금만 기다려주세요"
                  style={{
                    maxWidth: "100%",
                    height: "65vh",
                    borderRadius: 20,
                    objectFit: "cover",
                    position: "relative",
                    zIndex: 0,
                  }}
                />
              </>
            )}
          </Grid>
          <Grid item xs={12}>
            <GradientButton onClick={getNextFan}>
              다음 팬 초대하기
            </GradientButton>
          </Grid>
        </Grid>
      ) : (
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant={"h2"}>
            👩🏻‍💻 나의 소중한 팬들을 만나러 가볼까요?
          </Typography>
          <video autoPlay={true} ref={videoRef} style={{ borderRadius: 30 }} />
          <GradientButton
            onClick={onClickEntrance}
            sx={{ padding: 1, py: 2, borderRadius: 3, width: "100%" }}
          >
            <Typography
              variant={"button"}
              sx={{ fontWeight: 700, fontSize: 20 }}
            >
              입 장 하 기
            </Typography>
          </GradientButton>
        </Stack>
      )}
    </>
  );
};

export default IdolFanMeeting;
