// src/App.tsx
import { useState } from "react";
import { parseTree } from "./parser";

function App() {
  const [treeInput, setTreeInput] = useState("");
  const [commandOutput, setCommandOutput] = useState("");

  const handleConvert = () => {
    const result = parseTree(treeInput);
    setCommandOutput(result);
  };

  const handleCopy = async () => {
    if (!commandOutput) return;
    try {
      await navigator.clipboard.writeText(commandOutput);
      alert("コピーしました！");
    } catch (error) {
      alert("コピーに失敗しました…");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-4">Tree Parser SPA</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* 左側: 入力エリア */}
        <div className="w-full md:w-1/2">
          <label className="font-semibold">Treeコマンド文字列</label>
          <textarea
            className="w-full h-64 p-2 border rounded mt-2"
            value={treeInput}
            onChange={(e) => setTreeInput(e.target.value)}
            placeholder={`例）
my-project
├─ package.json
├─ src
   └─ main.ts`}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleConvert}
          >
            変換
          </button>
        </div>

        {/* 右側: 出力エリア */}
        <div className="w-full md:w-1/2">
          <label className="font-semibold">生成されたコマンド</label>
          <div className="relative">
            <textarea
              className="w-full h-64 p-2 border rounded mt-2 font-mono"
              value={commandOutput}
              readOnly
            />
            <button
              className="absolute top-3 right-3 px-2 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded"
              onClick={handleCopy}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
