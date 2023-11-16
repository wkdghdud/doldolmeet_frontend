"use client";
import { useEffect, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import CreateVideoCall from "@/components/meeting/CreateVideoCall";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import Timer from "@/components/Timer";
import { useAtom } from "jotai/react";
import { currSessionIdAtom, currSessionIdxAtom, sessionIdsAtom } from "@/atom";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.doldolmeet.shop/"
    : "http://localhost:5001/";

const VideoCall = () => {
  /* 세션 구분용 ID */
  const [mySessionId, setMySessionId] = useAtom(currSessionIdAtom);
  const [sessionIdx, setSessionIdx] = useAtom(currSessionIdxAtom);
  const [sessionIds, setSessionIds] = useAtom(sessionIdsAtom);

  /* 세션 참여자로서 보여지는 이름 */
  const [myUserName, setMyUserName] = useState(
    "Participant" + Math.floor(Math.random() * 100),
  );

  /* 세션 */
  const [session, setSession] = useState(undefined);

  /* Stream
   * 스트림은 세션으로 흐르는 미디어 스트림이다.
   * 참가자는 스트림을 게시(publish)할 수 있고, 동일한 세션의 다른 참가자들은 해당 스트림을 구독(subscribe)할 수 있다.
   * */
  const [publisher, setPublisher] = useState(undefined); // 스트리머
  const [subscribers, setSubscribers] = useState([]); // 시청자
  const [idolStream, setIdolStream] = useState(undefined); // 아이돌
  const [fanStream, setFanStream] = useState(undefined); // 팬

  /* Video 장치 */
  const [currentVideoDevice, setCurrentVideoDevice] = useState(undefined);

  /* 페이지를 나갈 때 leaveSession 함수를 실행하도록 설정 */
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      leaveSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleChangeSessionId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMySessionId(e.target.value);
  };

  const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMyUserName(e.target.value);
  };

  /* Subscriber 삭제 */
  const deleteSubscriber = (streamManager) => {
    let newSubscribers = subscribers.filter((sub) => sub !== streamManager);
    setSubscribers(newSubscribers);
  };

  /* Session 참여 */
  const makeNewSession = async () => {
    try {
      // OpneVidu 객체 생성
      const ov = new OpenVidu();

      // 세션 초기화
      const mySession = ov.initSession();

      // 세션에 streamCreated 이벤트 등록: 새로운 시청자가 들어왔을 때
      mySession.on("streamCreated", (event) => {
        // 새로운 stream을 받을 때마다
        const subscriber = mySession.subscribe(event.stream, undefined); // stream을 subscribe해서 Subscriber 객체를 반환 받고
        setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
        setFanStream(subscriber);
      });

      // 세션에 streamDestroyed 이벤트 등록: 시청자가 나갔을 때
      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      mySession.on("exception", (exception) => {
        console.warn(exception);
      });

      // Connection해서 Token 발급 받기
      const token = await getToken();

      mySession
        .connect(token, {
          clientData: myUserName,
          memberCategory: 0,
        })
        .then(async () => {
          const newPublisher = await ov.initPublisherAsync(undefined, {
            // properties for the publisher
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            resolution: "640x480", // The resolution of your video
            frameRate: 30, // The frame rate of your video
            insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not TODO: 하트 가능하게 하려면 어떻게 해야 할지 확인 필요
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

          setCurrentVideoDevice(currentVideoDevice);

          if (myUserName === "fan") {
            setFanStream(newPublisher);
          } else if (myUserName === "idol") {
            setIdolStream(newPublisher);
          }
        })
        .catch((error) => {
          console.error(
            "There was an error connecting to the session:",
            error.code,
            error.message,
          );
        });

      setSession(mySession);
    } catch (error) {
      console.error(error);
    }
  };

  /* Session 참여 종료 */
  const leaveSession = () => {
    if (session) {
      session.disconnect();
    }

    setPublisher(undefined);
    setSubscribers([]);
    setIdolStream(undefined);
    setFanStream(undefined);
    setMySessionId("");
    setMyUserName("");
  };

  const toggleDevice = async (audio, video) => {
    const ov = new OpenVidu();

    try {
      // let devices = await ov.getDevices();
      // let videoDevices = devices.filter(
      //   (device) => device.kind === "videoinput",
      // );

      // 아래가 OpenVidu tutorial 코드
      const devices = await session.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      let newPublisher = ov.initPublisher(undefined, {
        audioSource: undefined, // The source of audio. If undefined default microphone
        videoSource: videoDevices[0].deviceId, // The source of video. If undefined default webcam
        publishAudio: audio, // Whether you want to start publishing with your audio unmuted or not
        publishVideo: video, // Whether you want to start publishing with your video enabled or not
        resolution: "640x480", // The resolution of your video
        frameRate: 30, // The frame rate of your video
        insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
        mirror: false, // Whether to mirror your local video
      });

      await session.unpublish(publisher);

      await session.publish(newPublisher);

      const dataObj = {
        currentVideoDevice: videoDevices[0],
        publisher: newPublisher,
      };

      setCurrentVideoDevice(dataObj.currentVideoDevice);
      setPublisher(newPublisher);
      setIdolStream(newPublisher);
    } catch (error) {
      console.error(error);
    }
  };

  /* 카메라 전환 */
  const switchCamera = async () => {
    try {
      const devices = await session.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      if (videoDevices && videoDevices.length > 1) {
        const newVideoDevice = videoDevices.filter(
          (device) => device.deviceId !== currentVideoDevice.deviceId,
        );

        if (newVideoDevice.length > 0) {
          const newPublisher = session.initPublisher(undefined, {
            videoSource: newVideoDevice[0].deviceId,
            // other properties
          });

          await session.unpublish(publisher);
          await session.publish(newPublisher);

          setCurrentVideoDevice(newVideoDevice[0]);
          setIdolStream(newPublisher);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 세션 생성 후 토큰 획득하기
  const getToken = async () => {
    const sessionId = await createSession(mySessionId);
    return await createToken(sessionId);
  };

  /*
   * Session 생성
   * 세션은 오디오 스트림과 비디오 스트림을 교환할 수 있는 virtual room.
   * 같은 세션에 연결된 사람끼리만 서로 연락할 수 있음.
   * */
  const createSession = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions",
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
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  };

  /* 시간이 종료되면 할 일 */
  const handleTimeout = () => {
    setMySessionId(sessionIds[sessionIdx + 1]);
    setSessionIdx((prev) => prev + 1);
  };

  return (
    <div className="container">
      {session === undefined ? (
        <CreateVideoCall
          userName={myUserName}
          sessionId={mySessionId}
          handleChangeUserName={handleChangeUserName}
          handleChangeSessionId={handleChangeSessionId}
          joinSession={makeNewSession}
        />
      ) : (
        <>
          <Timer exitValue={3} handleTimeout={handleTimeout} />
          <MeetingRoom
            joinSession={makeNewSession}
            leaveSession={leaveSession}
            toggleDevice={toggleDevice}
            idol={idolStream}
            fan={fanStream}
          />
        </>
      )}
    </div>
  );
};

export default VideoCall;
