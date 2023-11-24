// "use client";
// import React, {useEffect, useState} from "react";
// import {Device, OpenVidu, Session, StreamManager,} from "openvidu-browser";
// import ToolbarComponent from "@/components/toolbar/ToolbarComponent";
// import DialogExtensionComponent from "@/components/dialog-extension/DialogExtenstion";
// import StreamComponent from "@/components/stream/StreamComponent";
// import ChatComponent from "@/components/chat/ChatComponent";
// import {UserModel} from "@/types/openvidu";
//
// const VideoRoom = () => {
//     const [sessionId, setSessionId] = useState<string | undefined>(undefined);
//     const [myUserName, setMyUserName] = useState<string | undefined>(undefined);
//     const [session, setSession] = useState<Session | undefined>(undefined);
//     const [localUser, setLocalUser] = useState<UserModel | undefined>(undefined);
//     const [subscribers, setSubscribers] = useState<StreamManager[]>([]);
//     const [chatDisplay, setChatDisplay] = useState("none");
//     const [currentVideoDevice, setCurrentVideoDevice] = useState<
//         Device | undefined
//     >(undefined);
//     const [OV, setOV] = useState<OpenVidu | null>(new OpenVidu());
//     const [localUserAccessAllowed, setLocalUserAccessAllowed] = useState(false);
//     const [token, setToken] = useState<string | undefined>(undefined);
//
//
//     useEffect(() => {
//         const openViduLayoutOptions = {
//             // 비디오 레이아웃의 최대 비율과 최소 비율을 설정합니다.
//             maxRatio: 3 / 2, // 가장 가로로 긴 비율
//             minRatio: 9 / 16, // 가장 세로로 긴 비율
//             fixedRatio: false, // 고정 비율 사용 여부
//             bigClass: "OV_big", // 큰 비디오 클래스 이름
//             bigPercentage: 0.8, // 큰 비디오가 차지하는 최대 영역 비율
//             bigFixedRatio: false, // 큰 비디오 고정 비율 사용 여부
//             bigMaxRatio: 3 / 2, // 큰 비디오 최대 비율
//             bigMinRatio: 9 / 16, // 큰 비디오 최소 비율
//             bigFirst: true, // 큰 비디오 위치 (왼쪽 상단 또는 오른쪽 하단)
//             animate: true, // 화면 전환 애니메이션 사용 여부
//         };
//         // layout.initLayoutContainer(
//         //     document.getElementById("layout"),
//         //     openViduLayoutOptions,
//         // );
//         // 창 닫기 이벤트와 창 크기 변경 이벤트에 이벤트 리스너를 추가합니다.
//         window.addEventListener("beforeunload", onbeforeunload);
//         // window.addEventListener("resize", updateLayout);
//         window.addEventListener("resize", checkSize);
//
//         // 세션에 참여합니다.
//         joinSession();
//
//         // 이벤트 리스너 제거
//         return () => {
//             window.removeEventListener("beforeunload", onbeforeunload);
//             // window.removeEventListener("resize", updateLayout);
//             window.removeEventListener("resize", checkSize);
//             leaveSession();
//         };
//     }, []);
//
//     const onbeforeunload = () => {
//         leaveSession();
//     };
//     const joinSession = () => {
//         // OpenVidu 객체를 초기화 합니다.
//         setSession(OV?.initSession());
//     };
//     // OpenVidu 세션을 생성하고 세션 정보를 상태에 저장합니다.
//     useEffect(() => {
//         const onChangeSessionId = async () => {
//             // 세션에 원격 스트림이 생성되었을 때의 이벤트를 구독합니다.
//             subscribeToStreamCreated();
//             // 서버와 연결하여 세션에 참여합니다.
//             await connectToSession();
//         };
//         onChangeSessionId();
//     }, [session]);
//
//     const connectToSession = async () => {
//         if (token !== undefined) {
//             // props로 전달된 토큰이 있다면, 해당 토큰으로 세션에 연결합니다.
//             connect(token);
//         } else {
//             try {
//                 // props로 전달된 토큰이 없다면, 서버에서 새로운 토큰을 요청하여 세션에 연결합니다.
//                 const token = await getToken();
//                 connect(token);
//             } catch (error) {
//                 if (error) {
//                     alert("토큰 가져오다가 오류 생겼어요" + error.message);
//                 }
//             }
//         }
//     };
//
//     const connect = (token) => {
//         if (session) {
//             session
//                 .connect(
//                     token,
//                     {clientData: myUserName}, // 클라이언트 데이터로 사용자 이름을 보냅니다.
//                 )
//                 .then(() => {
//                     connectWebCam(); // 웹캠 연결을 시작합니다.
//                 })
//                 .catch((error) => {
//                     alert("세션 연결 중에 오류 발생!" + error.message);
//                 });
//         }
//     };
//
//     const connectWebCam = async () => {
//         // 사용 가능한 오디오와 비디오 장치를 가져옵니다.
//         await OV?.getUserMedia({
//             audioSource: undefined,
//             videoSource: undefined,
//         });
//         const devices = await OV?.getDevices();
//         // 여기서 비디오 장치들 걸러냅니다.
//         const videoDevices = devices.filter(
//             (device) => device.kind === "videoinput",
//         );
//         // 기본 publisher를 설정합니다.
//         const publisher = OV?.initPublisher(undefined, {
//             audioSource: undefined,
//             videoSource: videoDevices[0].deviceId,
//             publishAudio: localUser?.audioActive,
//             publishVideo: localUser?.videoActive,
//             resolution: "640x480", // 해상도
//             frameRate: 30,
//             insertMode: "APPEND",
//         });
//
//         // 만약 session이 publish 중이라면
//         if (session && session.capabilities.publish) {
//             publisher?.on("accessAllowed", () => {
//                 // accessAllowed 이벤트 만들어줍니다, publisher를 세션에 발행합니다.
//                 session.publish(publisher).then(() => {
//                     updateSubscribers();
//                     setLocalUserAccessAllowed(true);
//                     joinSession();
//                 });
//             });
//         }
//         // 로컬 사용자 모델 정보를 등록하고 이벤트 리스너를 등록합니다.
//         if (localUser) {
//             setLocalUser({
//                 ...localUser,
//                 nickname: myUserName,
//                 connectionId: session?.connection.connectionId,
//                 screenShareActive: false,
//                 streamManager: publisher,
//             });
//         }
//         subscribeToUserChanged();
//         subscribeToStreamDestroyed();
//         sendSignalUserChanged({
//             isScreenShareActive: localUser?.isScreenShareActive(),
//         });
//
//         setCurrentVideoDevice(videoDevices[0]);
//         setLocalUser(localUser);
//     };
//
//
//     useEffect(() => {
//         localUser?.getStreamManager().on("streamPlaying", () => {
//             updateLayout();
//             publisher.videos[0].video.parentElement.classList.remove("custom-class");
//         });
//     }, [localUser]);
//
//     const updateSubscribers = () => {
//         const subscribers = remotes;
//         // remotes를 받아와서 subscribers 업데이트
//         setSubscribers(subscribers);
//         // 이 함수 끝나면 실행되는 callback
//     };
//
//     useEffect(() => {
//         if (localUser) {
//             sendSignalUserChanged({
//                 isAudioActive: localUser.isAudioActive(),
//                 isVideoActive: localUser.isVideoActive(),
//                 nickname: localUser.getNickname(),
//                 isScreenShareActive: localUser.isScreenShareActive(),
//             });
//         }
//         // 비디오 레이아웃 업데이트
//         updateLayout();
//     }, [subscribers]);
//
//     const leaveSession = () => {
//         const mySession = session;
//
//         if (subscribers.length === 0) {
//             closeSession();
//         }
//
//         if (mySession) {
//             mySession.disconnect();
//         }
//
//         // 모든 속성들을 초기화합니다.
//         setOV(null);
//         setSession(undefined);
//         setSubscribers([]);
//         setSessionId(undefined);
//         setMyUserName(undefined);
//         setLocalUser(undefined);
//     };
//
//     const camStatusChanged = () => {
//         localUser?.setVideoActive(!localUser.isVideoActive());
//         localUser?.getStreamManager().publishVideo(localUser?.isVideoActive());
//         sendSignalUserChanged({
//             isVideoActive: localUser?.isVideoActive(),
//         });
//         setLocalUser({...localUser, videoActive: !localUser.videoActive, streamManager:});
//     };
//
//     const micStatusChanged = () => {
//         localUser?.setAudioActive(!localUser.isAudioActive());
//         localUser?.getStreamManager().publishAudio(localUser?.isAudioActive());
//         sendSignalUserChanged({
//             isAudioActive: localUser?.isAudioActive(),
//         });
//         setLocalUser(localUser);
//     };
//
//     const deleteSubscriber = (stream) => {
//         const remoteUsers = subscribers;
//         // 구독자의 stream과 주어진 stream이 일치하는 구독자(userStream)를 찾습니다.
//         const userStream = remoteUsers.filter(
//             (user) => user.getStreamManager().stream === stream,
//         )[0];
//         // userStream 이 처음으로 나타나는 index를 반환합니다. 찾는 문자열이 없으면 -1 반환.
//         let index = remoteUsers.indexOf(userStream, 0);
//         // userStream을 찾은 경우 해당 구독자를 배열에서 제거하고 subscribers를 업데이트 합니다.
//         if (index > -1) {
//             remoteUsers.splice(index, 1);
//             setSubscribers(remoteUsers);
//         }
//     };
//
//     const subscribeToStreamCreated = () => {
//         // streamCreated 이벤트 작동 시(어딘가 openvidu 코드에 있음) 이 세션을 구독하는 subscriber 객체 생성
//         session?.on("streamCreated", (e) => {
//             const subscriber = session.subscribe(e.stream, undefined);
//             // streamPlaying 이벤트(스트림 재생 시 발생) 작동 시 화면 공유 활성화된 subscriber 확인하고
//             subscriber.on("streamPlaying", () => {
//                 checkSomeoneShareScreen();
//                 // video 부모 중에서 클래스 이름이 custom-class 인 것 들을 제거합니다 -> 스트림의 비디오가 추가적인 스타일링을 받을 수 있습니다.
//                 subscriber.videos[0].video.parentElement.classList.remove(
//                     "custom-class",
//                 );
//             });
//             // newUser을 새로 만들고 정보 업데이트 합니다.
//             const newUser = new UserModel();
//             newUser.setStreamManager(subscriber);
//             newUser.setConnectionId(e.stream.connection.connectionId);
//             newUser.setType("remote");
//             // 여기 닉네임도 나중에 상대방 닉네임으로 받아오게하자
//             const nickname = e.stream.connection.data.split("%")[0];
//             newUser.setNickname(JSON.parse(nickname).clientData);
//             // 새로운 유저를 remotes에 넣습니다
//             remotes.push(newUser);
//             // 로컬 사용자가 자신의 스트림 구독을 허용했을 때만 구독자 목록 업데이트 가능
//             if (localUserAccessAllowed) {
//                 updateSubscribers();
//             }
//         });
//     }
//
//     const subscribeToStreamDestroyed = () => {
//         // streamDestroyed 이벤트 발동 시
//         session?.on("streamDestroyed", (e) => {
//             // subscriber 배열에서 stremam 제거
//             deleteSubscriber(e.stream);
//             // 시간 지나면 다시 누가 화면 공유하고 있는지 확인
//             setTimeout(() => {
//                 checkSomeoneShareScreen();
//             }, 20);
//             // 창 새로고침 방지
//             e.preventDefault();
//             updateLayout();
//         });
//     };
//
//     const subscribeToUserChanged = () => {
//         // signal:userChanged 이벤트 발동 시
//         session?.on("signal:userChanged", (e) => {
//             // 구독자들 다 받아서
//             let remoteUsers = subscribers;
//             // 반복문 돌면서 이벤트 보낸 ConnectionId 일치하는 유저 찾는다
//             remoteUsers.forEach((user) => {
//                 if (user.getConnectionId() === e.from.connectionId) {
//                     // 찾으면 비디오 오디오 닉네임 화면공유 다 업데이트
//                     const data = JSON.parse(e.data);
//                     if (data.isAudioActive !== undefined) {
//                         user.setAudioActive(data.isAudioActive);
//                     }
//                     if (data.isVideoActive !== undefined) {
//                         user.setVideoActive(data.isVideoActive);
//                     }
//                     if (data.nickname !== undefined) {
//                         user.setNickname(data.nickname);
//                     }
//                     if (data.isScreenShareActive !== undefined) {
//                         user.setScreenShareActive(data.isScreenShareActive);
//                     }
//                 }
//             });
//             setSubscribers(remoteUsers);
//         });
//     }
//
//     const updateLayout = () => {
//         setTimeout(() => {
//             layout.updateLayout();
//         }, 20);
//     };
//
//     const sendSignalUserChanged = (data) => {
//         // 여기서 userChanged 신호 보냅니다
//         const signalOptions = {
//             data: JSON.stringify(data),
//             type: "userChanged",
//         };
//         session?.signal(signalOptions);
//     };
//
//     const toggleFullscreen = () => {
//         // 현재 페이지의 document 가져옵니다
//         const document = window.document;
//         // 웹페이지의 container라는 id를 가진 요소 가져옵니다. (여기 render에 있음)
//         const fs = document.getElementById("container");
//         // 각 브라우저의 전체화면 확인 속성
//         if (
//             !document.fullscreenElement &&
//             !document.mozFullScreenElement &&
//             !document.webkitFullscreenElement &&
//             !document.msFullscreenElement
//         ) {
//             if (fs.requestFullscreen) {
//                 fs.requestFullscreen();
//             } else if (fs.msRequestFullscreen) {
//                 fs.msRequestFullscreen();
//             } else if (fs.mozRequestFullScreen) {
//                 fs.mozRequestFullScreen();
//             } else if (fs.webkitRequestFullscreen) {
//                 fs.webkitRequestFullscreen();
//             }
//         } else {
//             if (document.exitFullscreen) {
//                 document.exitFullscreen();
//             } else if (document.msExitFullscreen) {
//                 document.msExitFullscreen();
//             } else if (document.mozCancelFullScreen) {
//                 document.mozCancelFullScreen();
//             } else if (document.webkitExitFullscreen) {
//                 document.webkitExitFullscreen();
//             }
//         }
//     };
// };
// }
//
//
// const screenShare = () => {
//     // 파이어폭스면 window 아니면 screen
//     const videoSource =
//         navigator.userAgent.indexOf("Firefox") !== -1 ? "window" : "screen";
//     // publisher 객체를 초기화합니다. 이 때 공유할 videoSource와 화면과 소리를 공유할지 말지 옵션 설정합니다.
//     const publisher = OV?.initPublisher(
//         undefined,
//         {
//             videoSource: videoSource,
//             publishAudio: localUser?.isAudioActive(),
//             publishVideo: localUser?.isVideoActive(),
//             mirror: false,
//         },
//         // 오류 발생 시 처리
//         (error) => {
//             if (error && error.name === "SCREEN_EXTENSION_NOT_INSTALLED") {
//                 setExtensionDialog(true);
//             } else if (error && error.name === "SCREEN_SHARING_NOT_SUPPORTED") {
//                 alert("화면공유가 지원되지 않습니다.");
//             } else if (error && error.name === "SCREEN_EXTENSION_DISABLED") {
//                 alert("화면공유 설정을 확인해주세요");
//             } else if (error && error.name === "SCREEN_CAPTURE_DENIED") {
//                 alert("화면공유 설정을 확인해주세요!");
//             }
//         },
//     );
//     // 화면 공유 허락되었을 때 한번만 실행
//     publisher.once("accessAllowed", () => {
//         // 이미 있던 streamManager unpublish하고 새로 streamManager 생성 후 발행
//         session?.unpublish(localUser?.getStreamManager());
//         localUser?.setStreamManager(publisher);
//         session?.publish(localUser?.getStreamManager()).then(() => {
//             // localuser의 화면공유 키고 정보들 서버에 업데이트
//             localUser?.setScreenShareActive(true);
//             setLocalUser(localUser);
//             sendSignalUserChanged({
//                 isScreenShareActive: localUser?.isScreenShareActive(),
//             });
//         });
//     });
//     // 화면 공유 스트림이 재생될 때 실행 -> 레이아웃 업데이트
//     publisher.on("streamPlaying", () => {
//         updateLayout();
//         publisher.videos[0].video.parentElement.classList.remove("custom-class");
//     });
// };
//
// const closeDialogExtension = () => {
//     setExtensionDialog(false);
// };
//
// const stopScreenShare = () => {
//     session?.unpublish(localUser?.getStreamManager());
//     connectWebCam();
// };
//
// const checkSomeoneShareScreen = () => {
//     let isScreenShared;
//     // 나 혹은 구독자 중에서 누구 한 명이라도 화면 공유중이라면 true
//     isScreenShared =
//         subscribers.some((user) => user.isScreenShareActive()) ||
//         localUser?.isScreenShareActive();
//     const openviduLayoutOptions = {
//         maxRatio: 3 / 2,
//         minRatio: 9 / 16,
//         // 화면공유 활성화시 고정비율 가집니다
//         fixedRatio: isScreenShared,
//         bigClass: "OV_big",
//         bigPercentage: 0.8,
//         bigFixedRatio: false,
//         bigMaxRatio: 3 / 2,
//         bigMinRatio: 9 / 16,
//         bigFirst: true,
//         animate: true,
//     };
//     // 레이아웃 옵션 업데이트 합니다
//     layout.setLayoutOptions(openviduLayoutOptions);
//     // 레이아웃 다시 그립니다 -> 변경된 UI 적용
//     updateLayout();
// };
//
// const toggleChat = (property) => {
//     let display = property;
//     // 만약 display가 undefined 일 때 채팅창의 표시상태가 none 이면 display를 block으로 block이면 none으로
//     if (display === undefined) {
//         display = chatDisplay === "none" ? "block" : "none";
//     }
//     //  만약 display가 block 이면 채팅창을 보이게(block으로) 설정하고 메시지수신여부를 false로
//     if (display === "block") {
//         setChatDisplay(display);
//         // 만약 display가 none 이면 채팅창을 none으로 바꿔 닫습니다.
//     } else {
//         setChatDisplay(display);
//     }
//     // 레이아웃 업데이트 합니다
//     updateLayout();
// };
//
// const checkNotification = () => {
//     setMessageReceived(chatDisplay === "none");
// };
//
// const checkSize = () => {
//     if (
//         document.getElementById("layout").offsetWidth <= 700 &&
//         !hasBeenUpdated
//     ) {
//         toggleChat("none");
//         hasBeenUpdated = true;
//     }
//     if (document.getElementById("layout").offsetWidth > 700 && hasBeenUpdated) {
//         hasBeenUpdated = false;
//     }
// };
//
// /*
//     joinSession() {
//       this.OV = new OpenVidu();
//
//       this.setState(
//           {
//               session: this.OV.initSession(),
//           },
//           async () => {
//               this.subscribeToStreamCreated();
//               await this.connectToSession();
//           },
//       );
//   }
//  */
//
// return (
//     <div className="container" id="container">
//         {/*위에 툴바*/}
//         <ToolbarComponent
//             sessionId={this.state.sessionId}
//             user={localUser}
//             showNotification={this.state.messageReceived}
//             camStatusChanged={this.camStatusChanged}
//             micStatusChanged={this.micStatusChanged}
//             screenShare={this.screenShare}
//             stopScreenShare={this.stopScreenShare}
//             toggleFullscreen={this.toggleFullscreen}
//             leaveSession={this.leaveSession}
//             toggleChat={this.toggleChat}
//             stopRecording={this.stopRecording}
//         />
//
//         {/*이건 아마 화면공유창?*/}
//         <DialogExtensionComponent
//             showDialog={this.state.showExtensionDialog}
//             cancelClicked={this.closeDialogExtension}
//         />
//         <div id="layout" className="bounds">
//             {/*<CanvasComponent/>*/}
//             {localUser !== undefined &&
//                 localUser.getStreamManager() !== undefined && (
//                     <div className="OT_root OT_publisher custom-class" id="localUser">
//                         {/*이건 내 stream 뜨는 창*/}
//                         <StreamComponent user={localUser}/>
//                     </div>
//                 )}
//             {/*subscriber에 있는 원소들 i로 하나씩 꺼내온다*/}
//             {this.state.subscribers.map((sub) => (
//                 <div className="OT_root OT_publisher custom-class" id="remoteUser">
//                     {/*아마 구독자들 stream 뜨는 창*/}
//                     <StreamComponent
//                         user={sub}
//                         streamId={sub.streamManager.stream.streamId}
//                     />
//                 </div>
//             ))}
//             {/*만약에 localUser 있고streamManager도 있고, 채팅창 켜져있으면 */}
//             {localUser !== undefined &&
//                 localUser.getStreamManager() !== undefined && (
//                     <div
//                         className="OT_root OT_publisher custom-class"
//                         style={chatDisplay}
//                     >
//                         <ChatComponent
//                             user={localUser}
//                             chatDisplay={this.state.chatDisplay}
//                             close={this.toggleChat}
//                             messageReceived={this.checkNotification}
//                         />
//                     </div>
//                 )}
//         </div>
//     </div>
// );
// }
//
