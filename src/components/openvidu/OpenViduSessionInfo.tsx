import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import { useEffect, useState } from "react";
import { useAllOpenViduSessions } from "@/hooks/openvidu";
import { IconButton, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Typography from "@mui/material/Typography";

const OpenViduSessionInfo = () => {
  const [sessionCnt, setSessionCnt] = useState<number>(0);
  const [sessions, setSessions] = useState<any[]>([]);

  const { data, refetch } = useAllOpenViduSessions();

  useEffect(() => {
    console.log("OpenVidu Sessions", data);
    setSessionCnt(data?.numberOfElements);
    setSessions(data?.content);
  }, [data]);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="flex-end"
      spacing={2}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography>총 세션 개수: {sessionCnt}</Typography>
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Stack>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>세션 아이디</TableCell>
              <TableCell align="right">접속 개수</TableCell>
              <TableCell align="right">접속 정보</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions &&
              sessions.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell align="right">
                    {row.connections.numberOfElements}
                  </TableCell>
                  <TableCell align="right">
                    {row.connections.content
                      .map((connection) => {
                        const clientData = JSON.parse(
                          connection.clientData,
                        ).clientData;
                        return JSON.parse(clientData).userName;
                      })
                      .join(", ")}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default OpenViduSessionInfo;
