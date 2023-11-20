import { Box, Stack } from "@mui/material";
import ShowChat from "@/components/ShowChat";
const waitingroom = () => {
  return (
    <>
      {/* Box 컴포넌트를 Grid 컴포넌트로 바꿔본다. */}
      <ShowChat />
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <Box>
              <img
                src="https://img.etnews.com/news/article/2023/10/27/news-p.v1.20231027.95c69768e8d242eb91dddfdf44b4d761_Z1.jpg"
                style={{ width: "70%" }}
              />
              <img
                src="https://pbs.twimg.com/media/F6GjqPia0AAHxaN.jpg:large"
                style={{ width: "70%" }}
              />
            </Box>
          </Stack>

          <img
            src="https://talkimg.imbc.com/TVianUpload/tvian/TViews/image/2022/09/07/a8866279-0675-4425-9c24-4dc9cab0a1d4.jpg"
            style={{ width: "30%" }}
          />
        </Stack>
      </Box>
    </>
  );
};

export default waitingroom;
