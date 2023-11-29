"use client";
import { useEffect, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import {
  closeOpenViduSession,
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";
import { Button, Grid, Stack } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import {
  fetchAllRoomIdsByAdmin,
  updateFanMeetingRoomCreated,
} from "@/hooks/fanmeeting";
import { backend_api } from "@/utils/api";
import { useAllOpenViduSessions } from "@/hooks/openvidu";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const AdminInitFanMeetingPage = () => {
  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");

  const [role, setRole] = useState<Role>(Role.ADMIN);
  const [userName, setUserName] = useState<string>("");
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [sessionCnt, setSessionCnt] = useState<number>(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const token = useJwtToken();

  const { data } = useAllOpenViduSessions();

  useEffect(() => {
    console.log("OpenVidu Sessions", data);
    setSessionCnt(data?.numberOfElements);
    setSessions(data?.content);
  }, [data]);

  useEffect(() => {
    if (fanMeetingId) {
      fetchAllRoomIdsByAdmin(fanMeetingId).then((res) => {
        setSessionIds(res);
      });
    }
  }, []);

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
        setUserName(res.sub);
      }
    });
  }, [token]);

  const joinMultipleSession = async () => {
    sessionIds.forEach(async (sessionId) => {
      await joinSession(sessionId);
    });
    if (fanMeetingId) {
      updateFanMeetingRoomCreated(fanMeetingId);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      // setOV(ov);

      const mySession = ov.initSession();

      await createOpenViduSession(sessionId);

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        // setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
      });

      mySession.on("streamDestroyed", (event) => {
        // deleteSubscriber(event.stream.streamManager);
      });

      const connection = await createOpenViduConnection(sessionId);
      // if (connection) {
      //   setMyConnection(connection);
      // }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: role,
          fanMeetingId: fanMeetingId,
          userName: userName,
        }),
      });

      // setSession(mySession);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const startFanMeeting = () => {
    backend_api()
      .post(`/fanMeetings/${fanMeetingId}/start`)
      .then((res) => {
        console.log(res);
      });
  };

  const deleteFanMeeting = async () => {
    await backend_api()
      .post(`/fanMeetings/${fanMeetingId}/roomDeleted`)
      .then((res) => {
        console.log(res);
      });

    sessionIds.forEach((sessionId) => {
      closeOpenViduSession(sessionId);
    });
  };

  const endFanMeeting = async () => {
    await backend_api()
      .post(`/fanMeetings/${fanMeetingId}/close`)
      .then((res) => {
        console.log(res);
      });
  };

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      direction={"column"}
      spacing={2}
    >
      <Grid item>
        <h1>👩🏻‍💻 팬미팅 관리자 페이지</h1>
      </Grid>
      <Grid item>
        <Stack direction={"row"} spacing={2}>
          <Button variant={"contained"} onClick={joinMultipleSession}>
            팬미팅 생성하기
          </Button>
          <Button variant={"contained"} onClick={startFanMeeting}>
            팬미팅 시작하기
          </Button>
          <Button variant={"contained"} onClick={deleteFanMeeting}>
            팬미팅 삭제하기
          </Button>
          <Button variant={"contained"} onClick={endFanMeeting}>
            팬미팅 종료하기
          </Button>
        </Stack>
      </Grid>
      <Grid item>
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
      </Grid>
    </Grid>
  );
};

export default AdminInitFanMeetingPage;
