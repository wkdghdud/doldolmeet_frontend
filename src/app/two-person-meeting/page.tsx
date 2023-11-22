import OpenViduVideoComponent from "@/components/OpenViduVideoComponent";
import { StreamManager } from "openvidu-browser";
import { Grid } from "@mui/material";

interface Props {
  idolStream: StreamManager | undefined;
  fanStream: StreamManager | undefined;
}

const TwoPersonMeetingPage = ({ idolStream, fanStream }: Props) => {
  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={6}>
        {idolStream ? (
          <OpenViduVideoComponent streamManager={idolStream} />
        ) : (
          <h1>아직 아이돌이 입장하지 않았어요.</h1>
        )}
      </Grid>
      <Grid item xs={6}>
        {fanStream ? (
          <OpenViduVideoComponent streamManager={fanStream} />
        ) : (
          <h1>아직 팬이 입장하지 않았어요.</h1>
        )}
      </Grid>
    </Grid>
  );
};

export default TwoPersonMeetingPage;
