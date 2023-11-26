"use client";

import React, { useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import { Button, Grid, Tab, Tabs } from "@mui/material";

const MyPage = () => {
  const [fanmeetings, setFanMeetings] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0); // 현재 선택된 탭의 인덱스

  useEffect(() => {
    backend_api()
      .get("/fanMeetings", {
        params: {
          option: "opened",
        },
      })
      .then((response) => {
        const fanMeetingsData = response.data.data || [];
        setFanMeetings(fanMeetingsData);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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

  const imgDownLoad = () => {
    const fileName = "0f09cb8c-f8b0-44fd-911a-46dc0a7f0d2e.png";

    // Axios를 사용하여 파일 다운로드 요청
    backend_api()
      .get(`s3/file/download?fileName=${fileName}`, {
        responseType: "blob", // 파일 다운로드를 위해 responseType을 'blob'으로 설정
      })
      .then((response) => {
        // 파일 다운로드를 위해 Blob 형식으로 받은 응답을 처리
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);

        // 생성된 URL을 사용하여 다운로드 링크 생성
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);

        // 링크 클릭하여 파일 다운로드
        document.body.appendChild(link);
        link.click();

        // 필요 없는 링크 제거
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error(error);
      });
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
          <Tab label="종료" />
        </Tabs>

        {Array.isArray(fanmeetings) && fanmeetings.length > 0 && (
          <div>
            <table
              className="fanmeetings-table"
              style={{ display: selectedTab === 0 ? "table" : "none" }}
            >
              <thead>
                <tr>
                  <th>State</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {fanmeetings.map((fanmeeting, idx) => (
                  <tr key={idx}>
                    <td>all</td>
                    <td>{fanmeeting.title}</td>
                    <td>{parseISODate(fanmeeting.startTime).date}</td>
                    <td>{parseISODate(fanmeeting.startTime).time}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table
              className="fanmeetings-table"
              style={{ display: selectedTab === 1 ? "table" : "none" }}
            >
              <thead>
                <tr>
                  <th>State</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Move</th>
                </tr>
              </thead>
              <tbody>
                {fanmeetings.map((fanmeeting, idx) => (
                  <tr key={idx}>
                    <td>all</td>
                    <td>{fanmeeting.title}</td>
                    <td>{parseISODate(fanmeeting.startTime).date}</td>
                    <td>{parseISODate(fanmeeting.startTime).time}</td>
                    <td>
                      {/*<Link href={""}>추억보관함</Link>*/}
                      <Button onClick={imgDownLoad}>추억보관함</Button>
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
