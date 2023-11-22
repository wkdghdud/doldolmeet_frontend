import { Box, Grid, Stack } from "@mui/material";
import ShowChat from "@/components/ShowChat";
import ShowVideoStreaming from "@/components/ShowVideoStreaming";

const waitingroom = () => {
  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="stretch" // This makes both items stretch to the full height of the container
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
  );
};

export default waitingroom;
