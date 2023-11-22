import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface Props {
  open: boolean;
  handleClose: () => void;
  handleEnter: () => void;
}

const InviteDialog = ({ open, handleClose, handleEnter }: Props) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">{"알림"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          다음 아이돌을 만나러 가볼까요? ☺️
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEnter} autoFocus>
          입장하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteDialog;
