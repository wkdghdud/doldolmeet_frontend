import Banner from "@/components/Banner";
import ShowCard from "@/components/ShowCard";
import { Button, Grid, Stack, Typography } from "@mui/material";
import ForwardIcon from "@mui/icons-material/Forward";

export default function Home() {
  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      maxWidth="lg"
      spacing={2}
    >
      <Grid item xs={12}>
        <Banner />
      </Grid>

      <Grid item xs={12}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ marginTop: 1 }}
        >
          <Typography variant="h5">OPEN</Typography>
          <Button variant="contained" endIcon={<ForwardIcon />}>
            전체보기
          </Button>
        </Stack>
      </Grid>

      <Grid item xs={6}>
        <ShowCard />
      </Grid>

      <Grid item xs={6}>
        <ShowCard />
      </Grid>

      <Grid item xs={6}>
        <ShowCard />
      </Grid>

      <Grid item xs={6}>
        <ShowCard />
      </Grid>
    </Grid>
  );
}
