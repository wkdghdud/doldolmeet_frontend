"use client";
import { Button, styled } from "@mui/material";

interface Props {
  borderRadius: string | number;
}

const GradientButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "borderRadius",
})<Props>(({ theme, borderRadius }) => ({
  borderRadius: borderRadius,
  color: "#FFFFFF",
  backgroundImage: "linear-gradient(to right, #ed6ea0, #ec8c69)",
  fontWeight: 700,
  boxShadow: "0 2px 5px 0 rgba(236, 116, 149, 0.75)",
  "&:hover": {
    backgroundImage: "linear-gradient(to right,  #f7186a , #FBB03B)",
  },
}));

export default GradientButton;
