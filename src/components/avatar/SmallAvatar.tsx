import React, { Dispatch, SetStateAction } from "react";
import { Avatar, Box, IconButton } from "@mui/material";

interface Props {
  imgSrc?: string;
  anchorEl2?: (EventTarget & Element) | null;
  setAnchorEl2?: Dispatch<SetStateAction<(EventTarget & Element) | null>>;
}

const SmallAvatar = ({ imgSrc, anchorEl2, setAnchorEl2 }: Props) => {
  const handleClickAnchor = (event) => {
    if (setAnchorEl2) {
      setAnchorEl2(event.currentTarget);
    }
  };
  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
        onClick={handleClickAnchor}
      >
        <Avatar
          src={imgSrc ?? "/default_avatar.png"}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
    </Box>
  );
};

export default SmallAvatar;
