"use client";
import { Grid, Tab, Tabs } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useFanMeeting } from "@/hooks/fanmeeting";
import Memo from "@/components/Mymemo";
import { useState } from "react";
import ShowChat from "@/components/ShowChat";
import ShowVideoStreaming from "@/components/ShowVideoStreaming";

const WaitingRoom = () => {
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");
  const { data: fanMeeting } = useFanMeeting(fanMeetingId);

  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Tabs value={tabValue} onChange={handleChange}>
        <Tab label="채팅" />
        <Tab label="메모" />
      </Tabs>
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
          <div style={{ display: tabValue === 0 ? "block" : "none" }}>
            <ShowChat roomId={fanMeeting?.chatRoomId} />
          </div>
          <div style={{ display: tabValue === 1 ? "block" : "none" }}>
            <Memo />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default WaitingRoom;
