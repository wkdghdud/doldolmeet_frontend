import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";

export default function Header() {
  return (
    <AppBar component="nav">
      <Toolbar>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Typography variant="h5">돌돌밋</Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }}></Box>

        <Link href="/login" style={{ textDecoration: "none" }}>
          <Button variant="contained" disableElevation>
            로그인
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
