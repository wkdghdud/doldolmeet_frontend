"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import axios from "axios";
import ReactPlayer from "react-player";

const ShowVideoStreaming = () => {
  const [videoDirectory, setVideoDirectory] = useState("");
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [result, setResult] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadedFile] = useState<File>();
  const videoUrl =
    "https://s3.ap-northeast-2.amazonaws.com/doldolmeet.test/d3064509-b7d0-442d-83c9-28ce64906562.mp4";

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };
  const handleFormSubmit = async () => {
    // const formData = new FormData(event.target);
    const formData = new FormData();
    if (uploadFile !== undefined) {
      formData.append("multipartFile", uploadFile);
    }

    try {
      const response = await axios.post("/api/s3/file", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": `multipart/form-data;`,
        },
      });

      if (response.status === 200) {
        const resultText = response.data;
        setResult(resultText);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div>
      <div>베이스 페이지 입니다~</div>

      <input type="file" name="file" ref={inputRef} onChange={onChangeFile} />
      <input type="button" onClick={handleFormSubmit} />
      <div id="result">{result}</div>

      <ReactPlayer
        url={[
          "https://www.youtube.com/watch?v=AXV-g4tZdFQ",
          "https://www.youtube.com/watch?v=ZI0UO8aM9E8",
        ]}
        controls
        width="50vw" // 화면 너비의 50%
        height="50vw" // 높이를 자동으로 조절하여 비율을 유지
        playing={true}
        muted={true}
      />
    </div>
  );
};

export default ShowVideoStreaming;
