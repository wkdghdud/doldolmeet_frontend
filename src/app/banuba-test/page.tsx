"use client";
import { OpenVidu, Publisher } from "openvidu-browser";
import { createOpenViduConnection } from "@/utils/openvidu";
import React, { useEffect, useRef, useState } from "react";
import { Dom, Effect, Module, Player, Webcam } from "@banuba/webar";
import { Button } from "@mui/material";

const BanubaTestPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [myStream, setMyStream] = useState<Publisher | null>(null);

  const joinSession = async () => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const connection = await createOpenViduConnection(
        "Banuba" + Math.floor(Math.random() * 100),
      );

      const { token } = connection;

      let connectRetryCount = 0;
      const maxConnectRetries = 2;
      while (connectRetryCount < maxConnectRetries) {
        try {
          await mySession.connect(token, {});
          break;
        } catch (e) {
          console.error(e);
          connectRetryCount++;
          if (connectRetryCount === maxConnectRetries) {
            throw e;
          }
        }
      }

      // await ov.getUserMedia({
      //   audioSource: undefined,
      //   videoSource: undefined,
      // });
      //
      // const devices = await ov.getDevices();
      // const videoDevices = devices?.filter(
      //   (device) => device.kind === "videoinput",
      // );

      const player = await Player.create({
        clientToken:
          "Lgd3xOz7O/tVuMemk4ArqTRKfl6KoEI4M7W1GH3HmBnIrkvZ5UFkfyXBArfdDPJ+ruILLhDjOrIbQji4RQLoFqZ6zIvTZOOVAcdrM/qGgzdNiv1jLHq12mexlUOOm7mxDBeuccYFsN5AggiYDzhEQAD42AxMTvFOvMP+3tmO8h9yOzUbFjK4AlOFL0jWE703NrxoOfEsu9XVco3s133OZFF5f1D8Fe64WUOExinS+h7rQKVs2YqtOcRRtoxZp2Pp2Hs/r+Id2/7WwqUx4N3+g75l5B1UwBsQv73upPFHmlNIbz7z/KJuSpNu5T+g26UlChfzQLzs3XEC96zTNXD7I/tIkZSHnBBWdnBLjTP8kDB+f1kG0WmkhUoP1opxJ0okBsAUqEf3y2XcnZvaMTQcK7co6qLwR46GBBFWieIVMfo/jBV/iUaAyLDFbAs6B8+ed0LO+7FCEeHhM5omyQ1/xZTzqmRg4curzydcKOAg4B30vXFrWGOWJXljxP1T6g97Fz9MHJs8tAfvTPzGxTG3YfnELEEzPVNBbdBVHAS1DlD3AIid5Fi08HiH9Eb2/3tDE6M76ibEpFjKNJb8PzNL2SsdOdt7dYDiaCR6Wqtg0/moFWo=",
      });
      await player.addModule(new Module("/face_tracker.zip"));

      await player.use(new Webcam());
      player.applyEffect(new Effect("/Glasses.zip"));

      const newPublisher = await ov.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });

      if (newPublisher) {
        mySession?.publish(newPublisher);
        setMyStream(newPublisher);
      }
    } catch (error) {
      console.error("Error in joinSession:", error);
      return null;
    }
  };

  useEffect(() => {
    async function init() {
      await joinSession();
    }

    init();
  }, []);

  const applyFilter = async () => {
    const player = await Player.create({
      clientToken:
        "Lgd3xOz7O/tVuMemk4ArqTRKfl6KoEI4M7W1GH3HmBnIrkvZ5UFkfyXBArfdDPJ+ruILLhDjOrIbQji4RQLoFqZ6zIvTZOOVAcdrM/qGgzdNiv1jLHq12mexlUOOm7mxDBeuccYFsN5AggiYDzhEQAD42AxMTvFOvMP+3tmO8h9yOzUbFjK4AlOFL0jWE703NrxoOfEsu9XVco3s133OZFF5f1D8Fe64WUOExinS+h7rQKVs2YqtOcRRtoxZp2Pp2Hs/r+Id2/7WwqUx4N3+g75l5B1UwBsQv73upPFHmlNIbz7z/KJuSpNu5T+g26UlChfzQLzs3XEC96zTNXD7I/tIkZSHnBBWdnBLjTP8kDB+f1kG0WmkhUoP1opxJ0okBsAUqEf3y2XcnZvaMTQcK7co6qLwR46GBBFWieIVMfo/jBV/iUaAyLDFbAs6B8+ed0LO+7FCEeHhM5omyQ1/xZTzqmRg4curzydcKOAg4B30vXFrWGOWJXljxP1T6g97Fz9MHJs8tAfvTPzGxTG3YfnELEEzPVNBbdBVHAS1DlD3AIid5Fi08HiH9Eb2/3tDE6M76ibEpFjKNJb8PzNL2SsdOdt7dYDiaCR6Wqtg0/moFWo=",
    });
    await player.addModule(new Module("/face_tracker.zip"));

    await player.use(new Webcam());
    player.applyEffect(new Effect("/Glasses.zip"));

    Dom.render(player, "#banuba");
  };

  useEffect(() => {
    if (myStream && videoRef.current) {
      myStream.addVideoElement(videoRef.current);
      videoRef.current.volume = 1;
    }
  }, [myStream]);

  return (
    <div>
      <h1>Banuba Test Page</h1>
      <video
        id={"banuba"}
        autoPlay={true}
        ref={videoRef}
        style={{
          borderRadius: 20,
          maxWidth: "100%",
          height: "68vh",
          objectFit: "cover",
        }}
      />
      <Button variant={"contained"} onClick={applyFilter}>
        필터 적용
      </Button>
    </div>
  );
};

export default BanubaTestPage;
