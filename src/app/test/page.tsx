"use client";
import { OpenVidu } from "openvidu-browser";
import React, { useEffect, useRef, useState } from "react";
import UserVideoComponent from "@/components/UserVideoComponent";
import { openvidu_api } from "@/utils/api";
import Recording from "@/components/meeting/Recording";

import html2canvas from "html2canvas";
export default function App() {
  const [mySessionId, setMySessionId] = useState("SessionA");
  const [myUserName, setMyUserName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`,
  );
  const [session, setSession] = useState(undefined);
  const [mainStreamManager, setMainStreamManager] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [forceRecordingId, setForceRecordingId] = useState("");

  const OV = useRef(new OpenVidu());
  const onCapture = () => {
    console.log("onCapture");
    const targetElement = document.getElementById("video-container");
    if (targetElement) {
      html2canvas(targetElement)
        .then((canvas) => {
          onSavaAs(canvas.toDataURL("image/png"), "image-download.png");
        })
        .catch((error) => {
          console.error("html2canvas error:", error);
        });
    } else {
      console.error("Target element not found");
    }
  };

  const onSavaAs = (uri, filename) => {
    console.log("onSavaAs");
    var link = document.createElement("a");
    document.body.appendChild(link);
    link.href = uri;
    link.download = filename;
    link.click();
    document.body.removeChild(link);
  };

  const handleChangeSessionId = (e) => {
    setMySessionId(e.target.value);
  };

  const handleChangeUserName = (e) => {
    setMyUserName(e.target.value);
  };

  const handleMainVideoStream = (stream) => {
    if (mainStreamManager !== stream) {
      setMainStreamManager(stream);
    }
  };
  //start recording

  const startRecording = () => {
    openvidu_api
      .post(
        "/openvidu/api/recordings/start",

        {
          session: mySessionId,
          name: "room-" + mySessionId + "_memberId-" + myUserName,
          hasAudio: true,
          hasVideo: true,
          outputMode: "INDIVIDUAL",
          // recordingLayout: "CUSTOM",
          // customLayout: "mySimpleLayout",
          // resolution: "1280x720",
          // frameRate: 25,
          // shmSize: 536870912,
          // ignoreFailedStreams: false,
          // mediaNode: {
          //   id: "media_i-0c58bcdd26l11d0sd",
          // },
        },
      )
      .then((response) => {
        setForceRecordingId(response.data.id);
      })
      .catch((error) => {
        console.error("Start recording WRONG:", error);
      });
  };

  const stopRecording = () => {
    openvidu_api
      .post(`/openvidu/api/recordings/stop/${forceRecordingId}`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Stop recording WRONG:", error);
      });
  };
  const joinSession = async () => {
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
        })
        .then(async () => {
          const newPublisher = await ov.initPublisherAsync(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: undefined, // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            resolution: "640x480", // The resolution of your video
            frameRate: 30, // The frame rate of your video
            insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
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
          setMainStreamManager(newPublisher);
          setCurrentVideoDevice(currentVideoDevice);
          setPublisher(newPublisher);
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

  // useEffect(() => {
  //   if (session) {
  //     // Get a token from the OpenVidu deployment
  //     getToken().then(async (token) => {
  //       try {
  //         await session.connect(token, { clientData: myUserName });
  //
  //         let publisher = await OV.current.initPublisherAsync(undefined, {
  //           audioSource: undefined,
  //           videoSource: undefined,
  //           publishAudio: true,
  //           publishVideo: true,
  //           resolution: "640x480",
  //           frameRate: 30,
  //           insertMode: "APPEND",
  //           mirror: false,
  //         });
  //
  //         session.publish(publisher);
  //
  //         const devices = await OV.current.getDevices();
  //         const videoDevices = devices.filter(
  //           (device) => device.kind === "videoinput",
  //         );
  //         const currentVideoDeviceId = publisher.stream
  //           .getMediaStream()
  //           .getVideoTracks()[0]
  //           .getSettings().deviceId;
  //         const currentVideoDevice = videoDevices.find(
  //           (device) => device.deviceId === currentVideoDeviceId,
  //         );
  //
  //         setMainStreamManager(publisher);
  //         setPublisher(publisher);
  //         setCurrentVideoDevice(currentVideoDevice);
  //       } catch (error) {
  //         console.log(
  //           "There was an error connecting to the session:",
  //           error.code,
  //           error.message,
  //         );
  //       }
  //     });
  //   }
  // }, [session, myUserName]);

  const leaveSession = () => {
    // Leave the session
    if (session) {
      session.disconnect();
    }

    // Reset all states and OpenVidu object
    OV.current = new OpenVidu();
    setSession(undefined);
    setSubscribers([]);
    setMySessionId("SessionA");
    setMyUserName("Participant" + Math.floor(Math.random() * 100));
    setMainStreamManager(undefined);
    setPublisher(undefined);
  };

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
          // setIdolStream(newPublisher);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const deleteSubscriber = (streamManager) => {
    setSubscribers((prevSubscribers) => {
      const index = prevSubscribers.indexOf(streamManager);
      if (index > -1) {
        const newSubscribers = [...prevSubscribers];
        newSubscribers.splice(index, 1);
        return newSubscribers;
      } else {
        return prevSubscribers;
      }
    });
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

  /**
   * --------------------------------------------
   * GETTING A TOKEN FROM YOUR APPLICATION SERVER
   * --------------------------------------------
   * The methods below request the creation of a Session and a Token to
   * your application server. This keeps your OpenVidu deployment secure.
   *
   * In this sample code, there is no user control at all. Anybody could
   * access your application server endpoints! In a real production
   * environment, your application server must identify the user to allow
   * access to the endpoints.
   *
   * Visit https://docs.openvidu.io/en/stable/application-server to learn
   * more about the integration of OpenVidu in your application server.
   */
  const getToken = async () => {
    const sessionId = await createSession(mySessionId);
    return await createToken(sessionId);
  };

  const createSession = async (sessionId) => {
    return new Promise((resolve, reject) => {
      openvidu_api
        .post("/openvidu/api/sessions", { customSessionId: sessionId })
        .then((response) => {
          resolve(response.data.id);
        })
        .catch((response) => {
          var error = Object.assign({}, response);
          if (error?.response?.status === 409) {
            resolve(sessionId);
          }
        });
    });
  };

  const createToken = (mySessionId) => {
    return new Promise((resolve, reject) => {
      var data = {};
      openvidu_api
        .post("/openvidu/api/sessions/" + mySessionId + "/connection", data)
        .then((response) => {
          resolve(response.data.token);
        })
        .catch((error) => reject(error));
    });
  };

  return (
    <div className="container">
      {session === undefined ? (
        <div id="join">
          <div id="img-div">
            <img
              src="resources/images/openvidu_grey_bg_transp_cropped.png"
              alt="OpenVidu logo"
            />
          </div>
          <div id="join-dialog" className="jumbotron vertical-center">
            <h1> Join a video session </h1>
            {/*<form className="form-group" onSubmit={joinSession}>*/}
            <p>
              <label>Participant: </label>
              <input
                className="form-control"
                type="text"
                id="userName"
                value={myUserName}
                onChange={handleChangeUserName}
                required
              />
            </p>
            <p>
              <label> Session: </label>
              <input
                className="form-control"
                type="text"
                id="sessionId"
                value={mySessionId}
                onChange={handleChangeSessionId}
                required
              />
            </p>
            <p className="text-center">
              <input
                className="btn btn-lg btn-success"
                name="commit"
                // type="submit"
                type="button"
                value="JOIN"
                onClick={joinSession}
              />
            </p>
            {/*</form>*/}
          </div>
        </div>
      ) : null}

      {session !== undefined ? (
        <div id="session">
          <div id="session-header">
            <h1 id="session-title">{mySessionId}</h1>
            <input
              className="btn btn-large btn-danger"
              type="button"
              id="buttonLeaveSession"
              onClick={leaveSession}
              value="Leave session"
            />
            {/*<button onClick={startRecording}>Start Recording</button>*/}
            {/*<button onClick={stopRecording}>Stop Recording</button>*/}
            {/*<Recording></Recording>*/}
            <button onClick={onCapture}>캡쳐</button>
            <input
              className="btn btn-large btn-success"
              type="button"
              id="buttonSwitchCamera"
              onClick={switchCamera}
              value="Switch Camera"
            />
          </div>

          {mainStreamManager !== undefined ? (
            <div id="main-video" className="col-md-6">
              <UserVideoComponent streamManager={mainStreamManager} />
            </div>
          ) : null}
          <div id="video-container" className="col-md-6">
            {publisher !== undefined ? (
              <div
                className="stream-container col-md-6 col-xs-6"
                onClick={() => handleMainVideoStream(publisher)}
              >
                <UserVideoComponent streamManager={publisher} />
              </div>
            ) : null}
            {subscribers.map((sub, i) => (
              <div
                key={sub.id}
                className="stream-container col-md-6 col-xs-6"
                onClick={() => handleMainVideoStream(sub)}
              >
                <span>{sub.id}</span>
                <UserVideoComponent streamManager={sub} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
