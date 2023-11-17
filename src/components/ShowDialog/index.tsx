import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Link from "next/link";

const ShowDialog = () => {
  const [openModal, setOpenModal] = useState(true);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Dialog open={openModal} onClose={handleCloseModal}>
      <DialogTitle>투데이 팬미팅</DialogTitle>
      <DialogContent>
        <DialogContentText>아이돌: 정국</DialogContentText>
        <DialogContentText>날짜: 11월 17일</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button>
          <Link href="/waitingroom" style={{ textDecoration: "none" }}>
            이동
          </Link>
        </Button>
        <Button onClick={handleCloseModal}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowDialog;
