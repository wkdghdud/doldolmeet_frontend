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

  /* router */
  const router = useRouter();

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
    </>
  );
};

export default WaitingRoom;
