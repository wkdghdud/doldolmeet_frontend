"use client";
import { Grid } from "@mui/material";
import ShowChat from "@/components/ShowChat";
import ShowVideoStreaming from "@/components/ShowVideoStreaming";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EnterFanMeetingProps, EnterFanMeetingReturn } from "@/utils/openvidu";
import { OpenVidu } from "openvidu-browser";
import { backend_api } from "@/utils/api";
import InviteDialog from "@/components/InviteDialog";
import useJwtToken from "@/hooks/useJwtToken";

const WaitingRoom = () => {
  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  /* States */
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  /* username 받아오기 */
  const jwtToken = useJwtToken();
  useEffect(() => {
    jwtToken.then((res) => setUserName(res?.sub ?? ""));
  }, [jwtToken]);

  /* 입장할 때 전체 대기실 OpenVidu 세션에 연결 */
  useEffect(() => {
    async function enterTotalWaitingRoom() {
      if (fanMeetingId) {
        await enterWaitingRoom({
          fanMeetingId: fanMeetingId,
        }).then((res) => {
          console.log("🚀 총 대기실 입장!", res);
        });
      }
    }

    enterTotalWaitingRoom();
  }, []);

  /* router */
  const router = useRouter();

  const enterWaitingRoom = async ({
    fanMeetingId,
  }: EnterFanMeetingProps): Promise<EnterFanMeetingReturn | null> => {
    console.log("💜 enterWaitingRoom 실행!", fanMeetingId);

    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const sessionResponse = await backend_api().get(
        `/fanMeetings/${fanMeetingId}/session`,
      );
      const token = sessionResponse?.data?.data?.token;

      if (!token) {
        console.error("Token not available");
        return null;
      }

      const mySession = ov.initSession();

      mySession.on("signal:invite", (event) => {
        const nextSessionId = event.data;
        console.log("🚀 팬미팅하러 들어오세요~ ", nextSessionId);
        if (nextSessionId) {
          setPopupOpen(true);
        }
      });

      await mySession.connect(token, {
        clientData: userName,
      });

      const newPublisher = await ov.initPublisherAsync(undefined, {});

      mySession.publish(newPublisher);

      const response: EnterFanMeetingReturn = {
        publisher: newPublisher,
        ...sessionResponse.data.data,
      };

      return response;
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        padding="30px"
        spacing={3}
      >
        <Grid item xs={6}>
          <ShowVideoStreaming />
        </Grid>
        <Grid item xs={6}>
          <ShowChat />
        </Grid>
      </Grid>
      <InviteDialog
        open={popupOpen}
        handleClose={() => setPopupOpen(false)}
        handleEnter={() => {
          setPopupOpen(false);
          router.push(`/fan-fanmeeting?id=${fanMeetingId}`);
        }}
      />
    </>
  );
};

export default WaitingRoom;
