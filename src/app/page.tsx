"use client";
import Banner from "@/components/Banner";
import { Grid, Stack, Typography } from "@mui/material";
import ForwardIcon from "@mui/icons-material/Forward";
import { useMeetings } from "@/hooks/useMeetings";
import GradientButton from "@/components/GradientButton";
import PostCard, { Post } from "@/components/PostCard";

export default function Home() {
  const { data } = useMeetings(1);

  const post: Post = {
    cover: "/cover_1.jpeg",
    title: "정국 GOLDEN 발매 기념 팬미팅",
    view: 100,
    comment: 100,
    share: 100,
    author: {
      name: "홍영의",
      avatarUrl: "/singer_1.jpeg",
    },
    createdAt: "05 Mar 2023",
  };

  return (
    <Grid
      container
      direction="row"
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
          sx={{ marginTop: 2 }}
        >
          <Typography variant="h3" sx={{ color: "#ed6ea0", fontWeight: 800 }}>
            OPEN
          </Typography>
          <GradientButton
            variant="contained"
            endIcon={<ForwardIcon />}
            borderRadius={"10px"}
          >
            전체보기
          </GradientButton>
        </Stack>
      </Grid>

      {data?.map((meeting, i) => (
        <Grid key={i} item xs={3}>
          <PostCard post={post} index={1} />
        </Grid>
      ))}
    </Grid>
  );
}
