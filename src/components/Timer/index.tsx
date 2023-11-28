import { Alert, AlertTitle, Snackbar } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

interface Props {
  open: boolean;
  handleClose: () => void;
}

const EndAlertBar = ({ open, handleClose }: Props) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ marginTop: "2.5%", marginRight: "12%", width: "24%" }}
    >
      <Alert
        icon={<NotificationsActiveIcon fontSize="inherit" />}
        onClose={handleClose}
        severity="warning"
        variant="filled"
        sx={{ width: "100%" }}
      >
        <AlertTitle>팬미팅이 종료되기까지 10초가 남았어요!</AlertTitle>
        아쉽지만 통화를 마무리할 준비를 해주세요.
      </Alert>
    </Snackbar>
  );
};

export default EndAlertBar;
