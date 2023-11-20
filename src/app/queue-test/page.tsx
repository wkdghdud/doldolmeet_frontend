"use client";
import { useCallback, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { backend_api } from "@/utils/api";

const WAITING_ROOM_SESSION_ID = "waiting_room";

const QueueTest = () => {
  const [waiters, setWaiters] = useState<any[]>([]);
  const [fanNumber, setFanNumber] = useState<number>(0);
  const [queueSession, setQueueSession] = useState(undefined);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState("");

  /*
   * Session 생성
   * 세션은 오디오 스트림과 비디오 스트림을 교환할 수 있는 virtual room.
   * 같은 세션에 연결된 사람끼리만 서로 연락할 수 있음.
   * */
  const createSession = async (sessionId) => {
    const response = await backend_api.post(
      "/api/sessions",
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  };

  /*
   * Token 생성
   * 참여자가 세션에 접속하려면 토큰이 반드시 필요하다.
   * 토큰은 Connection을 생성함으로써 획득할 수 있다.
   * 토큰은 참여자에 대한 metadata를 제공할 수 있다.
   * */
  const createToken = async (sessionId) => {
    /*
     * Connection:
     * 커넥션은 세션에 참여하고 있는 하나의 참여자를 의미한다.
     * 이 커넥션은 application server (즉, 우리의 Spring 서버)에서 초기화되어야 한다.
     * 그리고 커넥션을 초기화해서 생성된 application client (즉, 우리의 React 프론트)에 전달되어야 한다.
     * 이 토큰은 unauthorized 사용자가 세션에 접속하지 못하도록 막아준다.
     * 한 번 커넥션을 획득한 클라이언트는 쭉 세션의 참여자로 인식된다.
     * */
    const response = await backend_api.post(
      "/api/sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  };

  // 세션 생성 후 토큰 획득하기
  const getToken = async (_sessionId: string) => {
    const sessionId = await createSession(_sessionId);
    return await createToken(sessionId);
  };

  const deleteSubscriber = useCallback((streamManager) => {
    setWaiters((prevSubscribers) => {
      const index = prevSubscribers.indexOf(streamManager);
      if (index > -1) {
        const newSubscribers = [...prevSubscribers];
        newSubscribers.splice(index, 1);
        return newSubscribers;
      } else {
        return prevSubscribers;
      }
    });
  }, []);

  const joinSession = async (sessionId: string) => {
    try {
      // OpneVidu 객체 생성
      const ov = new OpenVidu();

      // 세션 초기화
      const mySession = ov.initSession();

      // 세션에 streamCreated 이벤트 등록: 새로운 시청자가 들어왔을 때
      mySession.on("streamCreated", (event) => {
        // 새로운 stream을 받을 때마다
        const subscriber = mySession.subscribe(event.stream, undefined); // stream을 subscribe해서 Subscriber 객체를 반환 받고
        // setWaiters((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
      });

      // 세션에 streamDestroyed 이벤트 등록: 시청자가 나갔을 때
      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      mySession.on("exception", (exception) => {
        console.warn(exception);
      });

      mySession.on("signal:invite", (event) => {
        const parsed = JSON.parse(event.data);
        const fan_number = parsed.fan_number;
        const sessionId = parsed.sessionId;
        setSessionId(sessionId);
        setPopupOpen(true);
        console.log(`🙋‍♀️ ${fan_number}번 팬 들어오세요~: `);
      });

      setQueueSession(mySession);

      // Connection해서 Token 발급 받기
      const token = await getToken(sessionId);

      setWaiters((prev) => [...prev, token]);

      mySession
        .connect(token, {
          clientData: { fanNumber: fanNumber },
        })
        .then(async () => {
          const newPublisher = await ov.initPublisherAsync(undefined, {});

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
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ marginTop: 300 }}>
      <Typography variant={"h1"}>👯‍♀️ 여기는 대기방~ 줄 서~</Typography>
      {queueSession === undefined ? (
        <>
          <TextField
            value={fanNumber}
            onChange={(e) => setFanNumber(e.target.value)}
          />
          <Button onClick={() => joinSession(WAITING_ROOM_SESSION_ID)}>
            대기방 들어가기
          </Button>
        </>
      ) : (
        <>
          {/*{waiters}*/}
          {waiters.map((fan, i) => (
            <Typography key={i}>{fan}</Typography>
          ))}
        </>
      )}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)}>
        <DialogTitle id="alert-dialog-title">
          {"영상통화방에 입장해주세요"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            드가자~~
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              joinSession(sessionId);
              setPopupOpen(false);
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QueueTest;
