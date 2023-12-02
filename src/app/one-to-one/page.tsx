"use client";
import {
  Connection,
  OpenVidu,
  Publisher,
  Session,
  StreamManager,
} from "openvidu-browser";
import { Grid, Stack } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
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
import { backend_api, openvidu_api, SPRING_URL } from "@/utils/api";
import html2canvas from "html2canvas";
import * as tmPose from "@teachablemachine/pose";

const OneToOnePage = () => {
  const router = useRouter();

  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("fanMeetingId");
  const sessionId = searchParams?.get("sessionId");
  const idolName = searchParams?.get("idolName");

  /* OpenVidu */
  const [OV, setOV] = useState<OpenVidu | undefined>();

  /* OpenVidu Session Info*/
  const [session, setSession] = useState<Session | undefined>();

  /* OpenVidu Stream */
  const [myStream, setMyStream] = useState<Publisher | undefined>();
  const [partnerStream, setPartnerStream] = useState<
    StreamManager | undefined
  >();

  /* TODO: 닉네임 */
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
  const [alertBarOpen, setAlertBarOpen] = useState<boolean>(false);

  /* 녹화를 위한 recordingid */
  const [forceRecordingId, setForceRecordingId] = useState("");

  /* 다음 아이돌의 대기실로 넘어가기 위해 필요한 state */
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");

  /* Role */
  const token: Promise<JwtToken | null> = useJwtToken();
  const [role, setRole] = useState<Role | undefined>();
  const [userName, setUserName] = useState<string>("");

  /* Camera 효과음 */
  const [shutter, setShutter] = useState<HTMLAudioElement>();

  /* Motion Detector Ref */
  const webcamRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const audio = new Audio("/mp3/camera9.mp3");
  const [partnerPose, setPartnerPose] = useState<boolean>(false);
  const [myPose, setMyPose] = useState<boolean>(false);
  const [hasCaptured, setHasCaptured] = useState<boolean>(false);
  let model, maxPredictions;
  let hasDetected = false;

  useEffect(() => {
    token.then((res) => {
      console.log("🚀 token role changed!", res);
      setRole(res?.auth);
      setUserName(res?.sub ?? "");
      setMyNickName(res?.nickname ?? "");
    });
  }, [token]);

  useEffect(() => {
    async function init() {
      if (role === Role.FAN) {
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
    backend_api()
      .post(
        SPRING_URL + "/recording-java/api/recording/start",

        {
          session: sessionId,
          fanMeetingId: fanMeetingId,
          fan: userName,
          idol: idolName,
          name:
            "fanmeetingId" +
            fanMeetingId +
            "fan" +
            userName +
            "idol" +
            idolName,
          hasAudio: true,
          hasVideo: true,
          outputMode: "COMPOSED",
        },
      )
      .then((response) => {
        console.log(response.data);
        setForceRecordingId(response.data.id);
      })
      .catch((error) => {
        console.error("Start recording WRONG:", error);
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

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;

      await mySession
        .connect(token, {
          clientData: JSON.stringify({
            role: role,
            fanMeetingId: fanMeetingId,
            userName: userName,
            type: "idolRoom",
            chatRoomId: _chatRoomId,
            nickname: myNickName,
          }),
        })
        .then(() => {
          if (role === Role.FAN) {
            startRecording();
          }
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
        mirror: false,
      });
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

    eventSource.addEventListener("moveToWaitRoom", (e: MessageEvent) => {
      console.log("👋 moveToWaitRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      joinNextRoom(JSON.parse(e.data).nextRoomId);
    });

    eventSource.addEventListener("endNotice", (e: MessageEvent) => {
      console.log("🥹 통화가 곧 종료 됩니다.", JSON.parse(e.data));
      setAlertBarOpen(true);
    });

    eventSource.onopen = () => {
      console.log("📣 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("error");
      console.log(e);
      eventSource.close();

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

  /******************************************************************************/
  /* Motion Detector */
  /******************************************************************************/
  const onCapture = () => {
    const targetElement = document.getElementById("video-container");
    if (targetElement) {
      html2canvas(targetElement)
        .then((canvas) => {
          audio.play();
          const imageDataUrl = canvas.toDataURL("image/png");
          uploadImage(imageDataUrl);
        })
        .catch((error) => {
          console.error("html2canvas error:", error);
        });
    } else {
      console.error("Target element not found");
    }
  };

  const uploadImage = (imageDataUrl) => {
    const blobImage = dataURLtoBlob(imageDataUrl);
    // Blob을 파일로 변환
    const imageFile = new File([blobImage], "image.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", imageFile);

    if (fanMeetingId) {
      backend_api()
        .post(`/captures/upload/${fanMeetingId}/${idolName}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("Image uploaded successfully:", response.data);
        })
        .catch((error) => {
          console.error("Image upload failed:", error);
        });
    }
  };

  function dataURLtoBlob(dataURL) {
    let arr = dataURL.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  const signalPoseDetected = async () => {
    console.log("🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶", userName);
    if (userName !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:pose_detected",
        data: userName,
      });
    }
  };

  useEffect(() => {
    console.log("MotionDetector component mounted!");
    const loadScripts = async () => {
      const tfScript = document.createElement("script");
      tfScript.src =
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js";
      document.body.appendChild(tfScript);

      const tmPoseScript = document.createElement("script");
      tmPoseScript.src =
        "https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js";
      document.body.appendChild(tmPoseScript);

      await Promise.all([
        new Promise((resolve) => {
          tfScript.onload = resolve;
        }),
        new Promise((resolve) => {
          tmPoseScript.onload = resolve;
        }),
      ]);

      // TensorFlow 및 Teachable Machine Pose 스크립트 로드 완료 후 초기화
      init();
    };

    loadScripts();
  }, []);

  const init = async () => {
    const URL = "/my-pose-model/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    const flip = true;
    const webcam = new tmPose.Webcam(size, size, flip);
    await webcam.setup();
    await webcam.play();

    // @ts-ignore
    webcamRef.current = webcam;

    canvasRef.current.width = size;
    canvasRef.current.height = size;

    labelContainerRef.current.innerHTML = ""; // 레이블 컨테이너 초기화
    for (let i = 0; i < maxPredictions; i++) {
      labelContainerRef.current.appendChild(document.createElement("div"));
    }
    window.requestAnimationFrame(loop);
  };

  const loop = () => {
    // if (!hasDetected) {
    const webcam = webcamRef.current;
    if (webcam) {
      webcam.update();
      predict();
      window.requestAnimationFrame(loop);
    }
    // }
  };

  useEffect(() => {
    if (partnerPose && myPose && !hasCaptured) {
      console.log("📸📸 사진촬영!!!!!📸📸", myPose);
      onCapture();
      setHasCaptured(true);
    }
  }, [partnerPose, myPose]);

  const predict = async () => {
    const webcam = webcamRef.current;

    if (model && webcam) {
      try {
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

        const prediction = await model.predict(posenetOutput);
        let detected = false;

        for (let i = 0; i < maxPredictions; i++) {
          const classPrediction =
            prediction[i].className +
            ": " +
            prediction[i].probability.toFixed(2);

          // @ts-ignore
          labelContainerRef.current.childNodes[i].innerHTML = classPrediction;

          if (
            prediction[i].className == "Class 1" &&
            prediction[i].probability > 0.9
          ) {
            detected = true;
          }
        }
        if (detected) {
          console.log(`🔔 포즈가 감지되었습니다`);
          if (!hasDetected && userName !== "" && sessionId !== "") {
            await signalPoseDetected().then(() => {
              console.log("📣 포즈 감지 신호를 보냈습니다.");
            });
            setMyPose(true);
            hasDetected = true;
          }
        }
      } catch (error) {
        console.error("Prediction error:", error);
      }
    } else {
      console.log("Model or webcam is not available!");
    }
  };

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
                {"💜 Aespa Drama 발매 기념 팬미팅"}
              </Typography>
              <LinearTimerBar />
              <DeviceControlButton
                publisher={myStream}
                fullScreen={fullScreen}
                toggleFullScreen={() => setFullScreen(!fullScreen)}
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
                />
              ) : (
                <PartnerStreamView
                  name={`😎 ${idolName ?? "아이돌"}`}
                  stream={partnerStream}
                  partnerRole={Role.IDOL}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              {role === Role.FAN ? (
                <MyStreamView
                  name={`😍 ${myNickName ?? "팬"}`}
                  stream={myStream}
                />
              ) : (
                <PartnerStreamView
                  name={`😍 ${partnerNickName ?? "팬"}`}
                  stream={partnerStream}
                  partnerRole={Role.FAN}
                />
              )}
            </Grid>
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
      <EndAlertBar
        open={alertBarOpen}
        handleClose={() => setAlertBarOpen(false)}
      />
      <div>
        <div hidden={true}>
          <canvas ref={canvasRef}></canvas>
        </div>
        <div hidden={true} ref={labelContainerRef}></div>
      </div>
    </Grid>
  );
};

export default OneToOnePage;
