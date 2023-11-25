"use client";
import { Grid } from "@mui/material";
import ShowChat from "@/components/ShowChat";
import ShowVideoStreaming from "@/components/ShowVideoStreaming";
import { useSearchParams } from "next/navigation";
import { useFanMeeting } from "@/hooks/fanmeeting";

const WaitingRoom = () => {
  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  const { data: fanMeeting } = useFanMeeting(fanMeetingId);

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
        <Grid item xs={6} sx={{ height: "85vh" }}>
          <ShowChat roomId={fanMeeting?.chatRoomId} />
        </Grid>
      </Grid>
    </>
  );
};

export default WaitingRoom;
