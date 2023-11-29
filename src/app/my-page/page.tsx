"use client";

import React, { useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import { Button, Grid, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import useJwtToken from "@/hooks/useJwtToken";

// TODO: 마이 페이지, 탭버튼 -> 팬 미팅 시작 전이면 예정, 하는 중이면, 진행, 끝났으면, 종료

const MyPage = () => {
  const [fanmeetings, setFanMeetings] = useState([]);
  const [openedFanMeetings, setOpenedFanMeetings] = useState([]);
  const [closedFanMeetings, setClosedFanMeetings] = useState([]);
  const [progressFanMeetings, setProgressFanMeetings] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0); // 현재 선택된 탭의 인덱스
  const [userName, setUserName] = useState<string>("");

  const router = useRouter();
  const token = useJwtToken();

  useEffect(() => {
    setFanMeeting();
  }, []);

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setUserName(res.sub);
      }
    });
  }, [token]);

  const setFanMeeting = () => {
    backend_api()
      .get("/fanMeetings/my", {
        params: {
          option: "all",
        },
      })
      .then((response) => {
        const fanMeetingsData = response.data.data || [];
        setFanMeetings(fanMeetingsData);
      })
      .catch((error) => {
        console.error(error);
      });
    backend_api()
      .get("/fanMeetings/my", {
        params: {
          option: "opened",
        },
      })
      .then((response) => {
        const fanMeetingsData = response.data.data || [];
        setOpenedFanMeetings(fanMeetingsData);
      })
      .catch((error) => {
        console.error(error);
      });
    backend_api()
      .get("/fanMeetings/my", {
        params: {
          option: "closed",
        },
      })
      .then((response) => {
        const fanMeetingsData = response.data.data || [];
        setClosedFanMeetings(fanMeetingsData);
      })
      .catch((error) => {
        console.error(error);
      });
    backend_api()
      .get("/fanMeetings/my", {
        params: {
          option: "progress",
        },
      })
      .then((response) => {
        const fanMeetingsData = response.data.data || [];
        setProgressFanMeetings(fanMeetingsData);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const parseISODate = (isoDate) => {
    const dateObject = new Date(isoDate);

    if (!isNaN(dateObject.getTime())) {
      const formattedDate = dateObject.toLocaleDateString();
      const formattedTime = dateObject.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        date: formattedDate,
        time: formattedTime,
      };
    } else {
      return {
        date: "날짜 파싱 오류",
        time: "시간 파싱 오류",
      };
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const joinMemoryRoom = async (info) => {
    const fanMeetingId = info.id;
    await router.push(`/my-page/${userName}/${fanMeetingId}`);
  };

  return (
    <>
      <style jsx>{`
        :root {
          --border-color: #ddd;
          --header-background-color: #f2f2f2;
          --link-color: blue;
          --link-hover-color: darkblue;
        }

        .fanmeetings-table {
          border-collapse: collapse;
          width: 100%;
        }

        .fanmeetings-table th,
        .fanmeetings-table td {
          border: 1px solid var(--border-color);
          padding: 8px;
          text-align: left;
        }

        .fanmeetings-table th {
          background-color: var(--header-background-color);
        }

        .fanmeetings-link {
          color: var(--link-color);
          text-decoration: underline;
          cursor: pointer;
        }

        .fanmeetings-link:hover {
          color: var(--link-hover-color);
        }
      `}</style>

      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="예정" />
          <Tab label="진행" />
          <Tab label="종료" />
        </Tabs>

        {Array.isArray(fanmeetings) && fanmeetings.length > 0 && (
          <div>
            <table
              className="fanmeetings-table"
              style={{ display: selectedTab === 0 ? "table" : "none" }}
            >
              {openedFanMeetings.length > 0 ? (
                <>
                  <thead>
                    <tr>
                      <th>State</th>
                      <th>Title</th>
                      <th>Team Name</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openedFanMeetings.map((fanmeeting, idx) => (
                      <tr key={idx}>
                        <td>all</td>
                        <td>{fanmeeting.title}</td>
                        <td>{fanmeeting.teamName}</td>
                        <td>{parseISODate(fanmeeting.startTime).date}</td>
                        <td>{parseISODate(fanmeeting.startTime).time}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <caption>예정된 팬미팅이 없습니다.</caption>
              )}
            </table>

            <table
              className="fanmeetings-table"
              style={{ display: selectedTab === 1 ? "table" : "none" }}
            >
              {progressFanMeetings.length > 0 ? (
                <>
                  <thead>
                    <tr>
                      <th>State</th>
                      <th>Title</th>
                      <th>Team Name</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressFanMeetings.map((fanmeeting, idx) => (
                      <tr key={idx}>
                        <td>all</td>
                        <td>{fanmeeting.title}</td>
                        <td>{fanmeeting.teamName}</td>
                        <td>{parseISODate(fanmeeting.startTime).date}</td>
                        <td>{parseISODate(fanmeeting.startTime).time}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <p>진행 중인 팬미팅이 없습니다.</p>
              )}
            </table>

            <table
              className="fanmeetings-table"
              style={{ display: selectedTab === 2 ? "table" : "none" }}
            >
              <thead>
                <tr>
                  <th>State</th>
                  <th>Title</th>
                  <th>Team Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Move</th>
                </tr>
              </thead>
              <tbody>
                {closedFanMeetings.map((fanmeeting, idx) => (
                  <tr key={idx}>
                    <td>all</td>
                    <td>{fanmeeting.title}</td>
                    <td>{fanmeeting.teamName}</td>
                    <td>{parseISODate(fanmeeting.startTime).date}</td>
                    <td>{parseISODate(fanmeeting.startTime).time}</td>
                    <td>
                      <Button onClick={() => joinMemoryRoom(fanmeeting)}>
                        추억보관함
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Grid>
    </>
  );
};

export default MyPage;
