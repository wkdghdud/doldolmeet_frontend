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
  closeConnection,
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";
import ShowChat from "@/components/ShowChat";
import { Role } from "@/types";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import DeviceControlButton from "@/components/meeting/DeviceControlButton";
import MyVideoComponent from "@/components/meeting/MyVideoComponent";
import WaitingFanImage from "@/components/meeting/WaitingFanImage";

const OneToOnePage = () => {
  /* OpenVidu */
  const [OV, setOV] = useState<OpenVidu | undefined>();

  /* OpenVidu Session Info*/
  const [session, setSession] = useState<Session | undefined>();
  const [sessionName, setSessionName] = useState<string>("test-idol-session-1");

  /* OpenVidu Stream */
  const [idolStream, setIdolStream] = useState<Publisher>();
  const [fanStream, setFanStream] = useState<StreamManager>();
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);

  /* OpenVidu Connection */
  const [myConnection, setMyConnection] = useState<Connection | undefined>();

  /* Layout */
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  /* Role */
  const token: Promise<JwtToken | null> = useJwtToken();
  const [role, setRole] = useState<Role | undefined>();
  useEffect(() => {
    token.then((res) => {
      setRole(res?.auth);
    });
  }, [token]);

  useEffect(() => {
    async function init() {
      await joinSession();
    }

    init();
  }, []);

  const joinSession = async () => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      setOV(ov);

      const mySession = ov.initSession();

      await createOpenViduSession(sessionName);

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
      });

      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      const connection = await createOpenViduConnection(sessionName);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: JSON.stringify({ role: role }),
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
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
      });
      mySession.publish(newPublisher);
      setSession(mySession);
      setIdolStream(newPublisher);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  // 세션을 나가면서 정리
  const leaveSession = async () => {
    // 세션 종료: 세션에 있는 모든 커넥션을 제거함
    // if (session) {
    //   await session.disconnect();
    // }
    if (myConnection?.connectionId) {
      await closeConnection(sessionName, myConnection?.connectionId);
    }

    // state 초기화
    setIdolStream(undefined);
    setFanStream(undefined);
    setSubscribers([]);
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

  /* Subscriber 삭제 */
  const deleteSubscriber = (streamManager) => {
    let newSubscribers = subscribers.filter((sub) => sub !== streamManager);
    setSubscribers(newSubscribers);
  };

  return (
    <Grid container alignItems={"flex-start"}>
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
              sx={{ backgroundColor: "transparent", px: 2, mb: 2 }}
            >
              <Typography variant={"h4"}>
                {"💜 Aespa Drama 발매 기념 팬미팅"}
              </Typography>
              <DeviceControlButton
                publisher={idolStream}
                fullScreen={fullScreen}
                toggleFullScreen={() => setFullScreen(!fullScreen)}
              />
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <MyVideoComponent nickName={"카리나"} stream={idolStream} />
          </Grid>
          <Grid item xs={6} style={{ position: "relative" }}>
            {subscribers.length > 0 ? (
              <>
                <MyVideoComponent nickName={"마재화"} stream={subscribers[0]} />
              </>
            ) : (
              <WaitingFanImage />
            )}
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
          <ShowChat roomId={""} />
        </Grid>
      )}
    </Grid>
  );
};

export default OneToOnePage;
