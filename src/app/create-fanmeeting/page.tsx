"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import { backend_api } from "@/utils/api";

const CreateFanMeeting = () => {
  const [result, setResult] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadedFile] = useState<File>();

  const [fanMeetingImgUrl, setFanMeetingImgUrl] = useState("");
  const [fanMeetingName, setFanMeetingName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [capacity, setCapacity] = useState("");

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFormSubmit = async (): Promise<string | null> => {
    // const formData = new FormData(event.target);
    const formData = new FormData();
    if (uploadFile !== undefined) {
      formData.append("multipartFile", uploadFile);
    }

    try {
      const response = await backend_api().post("/s3/file", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": `multipartFile/form-data;`,
        },
      });

      if (response.status === 200 && response.data) {
        return response.data[0];
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }

    return null;
  };
  const submit = async (s3FileName: string | null) => {
    try {
      // 이미지를 업로드하고 URL을 받아온 경우에만 실행
      // if (fanMeetingImgUrl) {
      // 팬미팅 정보를 저장
      const response = await backend_api().post("/fanMeetings", {
        fanMeetingName,
        startTime: "2023-11-20T15:00:00",
        endTime: "2023-12-01T10:00:00",
        capacity,
        teamName,
        fanMeetingImgUrl: s3FileName,
      });

      console.log("Fan Meeting Creation Response:", response);

      // 성공적으로 저장한 후 폼 필드 초기화
      setFanMeetingName("");
      setCapacity("");
      setTeamName("");
      setFanMeetingImgUrl("");

      alert("팬미팅이 성공적으로 생성되었습니다!");
      // }
    } catch (error) {
      console.error("Error creating fan meeting:", error.message);
      alert("팬미팅 생성 중 오류가 발생했습니다.");
    }
  };

  const handleRegister = async () => {
    await handleFormSubmit().then(async (s3FileName) => {
      await submit(s3FileName);
    });
  };

  return (
    <div>
      <div>파일 업로드 테스트 중입니다.</div>
      <div>
        <label>팬미팅 이름:</label>
        <input
          type="text"
          value={fanMeetingName}
          onChange={(e) => setFanMeetingName(e.target.value)}
        />
      </div>
      <div>
        <label>수용 인원:</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>
      <div>
        <label>팀 이름:</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>
      <input type="file" name="file" ref={inputRef} onChange={onChangeFile} />
      <input type="button" value="이미지 제출" onClick={handleFormSubmit} />
      <div id="result">{result}</div>
      <input type="button" value="팬미팅 생성" onClick={handleRegister} />
    </div>
  );
};

export default CreateFanMeeting;
