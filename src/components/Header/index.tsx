import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";

export default function Header() {
  return (
    <AppBar component="nav">
      <Toolbar>
        <Typography variant="h5">돌돌밋</Typography>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Link href="/login">
          <Button variant="contained" disableElevation>
            로그인
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
