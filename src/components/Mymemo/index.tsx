"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { backend_api } from "@/utils/api";
import { AxiosResponse } from "axios"; // 이 부분을 사용하려는 API 파일로 변경해야 합니다.

interface MemoItem {
  id: number;
  contents: string;
  createdAt: string;
}

const Memo = () => {
  const [memoList, setMemoList] = useState<MemoItem[]>([]);
  const [memoText, setMemoText] = useState<string>("");
  const [mymemo, setMymemo] = useState<MemoItem[]>([]);
  //create
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMemoText(event.target.value);
  };
  const handleSaveMemo = async () => {
    try {
      const newMemo: MemoItem = {
        id: Date.now(),
        contents: memoText,
        createdAt: "",
      };
      const createdMemo = await createMemo(newMemo);
      setMymemo((prevMemoList) => [...prevMemoList, createdMemo]);
      setMemoText("");
    } catch (error) {
      console.error("Error saving memo:", error);
    }
  };

  const createMemo = async (newMemo: MemoItem) => {
    try {
      const response = await backend_api().post("/memos", {
        id: newMemo.id,
        contents: newMemo.contents,
      });
      if (response.status >= 200 && response.status < 300) {
        const createdMemo: MemoItem = await response.data.data;
        return createdMemo;
      } else {
        throw new Error("Failed to create memo");
      }
    } catch (error) {
      console.error("Error creating memo:", error);
      throw error;
    }
  };

  //read!!
  useEffect(() => {
    const myMemo = async () => {
      const response = await backend_api()
        .get(`memos/my`)
        .then((response: AxiosResponse) => setMymemo([...response.data]))
        .catch((e) => console.error(e));
    };
    myMemo();
  }, []);

  //delete
  const handleDeleteMemo = async (id: number) => {
    try {
      await deleteMemo(id);
      setMemoList((prevMemoList) =>
        prevMemoList.filter((memo) => memo.id !== id),
      );
      setMymemo((prevMemoList) =>
        prevMemoList.filter((mememo) => mememo.id !== id),
      );
    } catch (error) {
      console.error("Error deleting memo:", error);
    }
  };
  const deleteMemo = async (id: number) => {
    try {
      const response = await backend_api().delete(`/memos/${id}`);
      if (response.status >= 200 && response.status < 300) {
        return;
      } else {
        throw new Error("Failed to delete memo");
      }
    } catch (error) {
      console.error("Error deleting memo:", error);
      throw error;
    }
  };

  // update, modify
  const [editingMemo, setEditingMemo] = useState<{
    id: number | null;
    contents: string;
  }>({ id: null, contents: "" });

  // 수정 상태를 활성화하고 해당 메모의 내용을 가져오는 함수
  const handleEditMemo = (id: number, contents: string) => {
    setEditingMemo({ id, contents });
  };

  // 수정된 내용을 서버에 업데이트하는 함수
  const handleUpdateMemo = async () => {
    try {
      await updateMemo(editingMemo.id || 0, editingMemo.contents);
      // 서버에 업데이트 후 로컬 상태 업데이트
      setMymemo((prevMymemo) =>
        prevMymemo.map((memo) =>
          memo.id === editingMemo.id
            ? { ...memo, contents: editingMemo.contents }
            : memo,
        ),
      );
      setEditingMemo({ id: null, contents: "" }); // 수정 상태 비활성화
    } catch (error) {
      console.error("Error updating memo:", error);
    }
  };

  // 서버에 메모를 업데이트하는 함수
  const updateMemo = async (id: number, contents: string) => {
    try {
      const response = await backend_api().put(`/memos/${id}`, { contents });
      if (response.status >= 200 && response.status < 300) {
        return;
      } else {
        throw new Error("Failed to update memo");
      }
    } catch (error) {
      console.error("Error updating memo:", error);
      throw error;
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>간단한 메모장</h1>
        <textarea
          rows={10}
          cols={50}
          value={memoText}
          onChange={handleInputChange}
          placeholder="메모를 입력하세요..."
          style={{ marginBottom: "10px" }}
        />
        <br />
        <button onClick={handleSaveMemo}>저장</button>
        <div>
          {mymemo.length > 0 &&
            mymemo.map((memomo) => (
              <div
                key={memomo.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                {editingMemo.id === memomo.id ? ( // 수정 중인 메모 아이템인 경우 input 표시
                  <div>
                    <input
                      type="text"
                      value={editingMemo.contents}
                      onChange={(event) =>
                        setEditingMemo({
                          ...editingMemo,
                          contents: event.target.value,
                        })
                      }
                    />
                    <button onClick={handleUpdateMemo}>저장</button>
                  </div>
                ) : (
                  <div>
                    <p>{memomo.contents}</p>
                    <button
                      onClick={() => handleEditMemo(memomo.id, memomo.contents)}
                    >
                      수정
                    </button>
                    <button onClick={(event) => handleDeleteMemo(memomo.id)}>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Memo;
