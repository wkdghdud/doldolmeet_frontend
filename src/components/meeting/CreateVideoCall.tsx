import { Stack, TextField, Typography } from "@mui/material";
import GradientButton from "@/components/GradientButton";

interface Props {
  userName: string;
  sessionId: string;
  handleChangeUserName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeSessionId: (event: React.ChangeEvent<HTMLInputElement>) => void;
  joinSession: () => void;
}

const CreateVideoCall = ({
  userName,
  sessionId,
  handleChangeUserName,
  handleChangeSessionId,
  joinSession,
}: Props) => {
  return (
    <>
      <Typography variant={"h2"}>👩🏻‍💻 영상통화 시작하기</Typography>
      <Stack spacing={2} sx={{ marginTop: 3 }}>
        <TextField placeholder={"닉네임"} onChange={handleChangeUserName}>
          {userName}
        </TextField>
        <TextField placeholder={"방 이름"} onChange={handleChangeSessionId}>
          {sessionId}
        </TextField>
        <GradientButton
          onClick={joinSession}
          sx={{ padding: 1, py: 2, borderRadius: 2 }}
        >
          <Typography variant={"button"} sx={{ fontWeight: 800 }}>
            시작하기
          </Typography>
        </GradientButton>
      </Stack>
    </>
  );
};

export default CreateVideoCall;
