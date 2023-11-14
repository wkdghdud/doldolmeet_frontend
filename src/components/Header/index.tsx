import { AppBar, Toolbar } from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";
import GradientButton from "@/components/GradientButton";
import Image from "next/image";

export default function Header() {
  return (
    <AppBar
      component="nav"
      sx={{
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
      }}
      elevation={0}
    >
      <Toolbar>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Image src={"/en_logo.svg"} width={200} height={30} />
        </Link>
        <Box sx={{ flexGrow: 1 }}></Box>

        <Link href="/login" style={{ textDecoration: "none" }}>
          <GradientButton
            variant="contained"
            disableElevation
            borderRadius={"30px"}
            sx={{ px: 3 }}
          >
            로그인
          </GradientButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
