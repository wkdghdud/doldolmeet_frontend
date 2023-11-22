"use client";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import { useEffect, useRef, useState } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import GradientButton from "@/components/GradientButton";
import { Role } from "@/types";
import { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import { OpenVidu, Session, StreamManager } from "openvidu-browser";
import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import { backend_api, openvidu_api } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { NextFanInfo, useNextFan } from "@/hooks/useNextFan";

interface Props {
  joinSession: (role: string) => void;
  requestJoin: () => void;
}

interface CreatedSessionInfo {
  mainWaitRoomId: string;
  waitRoomId: string;
  teleRoomId: string;
  token: string;
  teleSession: Session;
  waitSession: Session;
}

const IdolFanMeeting = ({ joinSession, requestJoin }: Props) => {
  const token: Promise<JwtToken | null> = useJwtToken(); // TODO: role에 따른 구분 필요
  const [role, setRole] = useState<Role | undefined>();
  const videoRef = useRef(null);
  const { data } = useSession();

  const [publisher, setPublisher] = useState<StreamManager | undefined>(
    undefined,
  );

  const [fanStream, setFanStream] = useState<StreamManager | undefined>();

  const [connected, setConnected] = useState<boolean>(false);
  const [currSessionId, setCurrSessionId] = useState<string>("");
  const [waitingRoomSessionId, setWaitingRoomSessionId] = useState<string>("");

  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  const nextFan: NextFanInfo = useNextFan(fanMeetingId ?? "");

  useEffect(() => {
    token.then((res) => {
      setRole(res?.auth);
    });
  }, [token]);

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

  const onClickEntrance = async () => {
    // OpneVidu 객체 생성
    const ov = new OpenVidu();
    // TODO: url 수정 필요
    await backend_api()
      .get(`/fanMeetings/${fanMeetingId}/session`, {
        headers: {
          Authorization: data?.user?.data,
        },
      })
      .then((res: AxiosResponse<CreatedSessionInfo>) => {
        // const mySession: Session = res.data.data.teleSession as Session;
        setCurrSessionId(res.data.data.teleRoomId);
        setWaitingRoomSessionId(res.data.data.waitRoomId);

        const mySession = ov.initSession();
        console.log("🚀", res);
        console.log("🥳", mySession);

        if (mySession) {
          mySession.on("streamCreated", (event) => {
            console.log("👀 새로운 팬 힘차게 등장!", event.stream.connection);
            const subscriber = mySession.subscribe(event.stream, undefined);
            setFanStream(subscriber);
          });

          mySession
            .connect(res?.data?.data?.token, {
              clientData: res?.data?.data?.token,
            })
            .then(async () => {
              const newPublisher = await ov.initPublisherAsync(undefined, {
                // properties for the publisher
                // audioSource: undefined, // The source of audio. If undefined default microphone
                // videoSource: undefined, // The source of video. If undefined default webcam
                // publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
                // publishVideo: true, // Whether you want to start publishing with your video enabled or not
                // resolution: "640x480", // The resolution of your video
                // frameRate: 30, // The frame rate of your video
                // insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
                // mirror: true, // Whether to mirror your local video or not TODO: 하트 가능하게 하려면 어떻게 해야 할지 확인 필요
              });

              mySession.publish(newPublisher);
              const devices = await ov.getDevices();
              const videoDevices = devices.filter(
                (device) => device.kind === "videoinput",
              );
              const currentVideoDeviceId = newPublisher.stream
                .getMediaStream()
                .getVideoTracks()[0]
                .getSettings().deviceId;
              const currentVideoDevice = videoDevices.find(
                (device) => device.deviceId === currentVideoDeviceId,
              );

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

    await openvidu_api
      .post(
        "/openvidu/api/signal",
        {
          session: waitingRoomSessionId,
          type: "signal:invite",
          // data: JSON.stringify({
          //   fan_number: "fanNumber",
          //   sessionId: currSessionId,
          // }),
          data: currSessionId,
          to: [nextFan?.connectionId],
        },
        {
          headers: {
            Authorization: "Basic " + btoa("OPENVIDUAPP:" + "MY_SECRET"),
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.error(error));
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
          <Grid item xs={6}>
            {fanStream ? (
              <OpenViduVideoComponent streamManager={fanStream} />
            ) : (
              <Box>
                <Typography variant={"h5"}>
                  곧 팬이 들어올 예정이에요.
                </Typography>
              </Box>
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
