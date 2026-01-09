import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useRef } from "react";

const boilerplate = {
  python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> mp;
        for(int i=0;i<nums.size();i++){
            int diff = target - nums[i];
            if(mp.count(diff)) return {mp[diff], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer,Integer> map = new HashMap<>();
        for(int i=0;i<nums.length;i++){
            int diff = target - nums[i];
            if(map.containsKey(diff)){
                return new int[]{map.get(diff), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
  javascript: `var twoSum = function(nums, target) {
    const map = {};
    for(let i=0;i<nums.length;i++){
        let diff = target - nums[i];
        if(map[diff] !== undefined) return [map[diff], i];
        map[nums[i]] = i;
    }
};`
};

export default function ProblemDetail() {
  const { company, problemId } = useParams();
 
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(boilerplate["python"]);
  const [output, setOutput] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [submitResult, setSubmitResult] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/problem/${company}/${problemId}`)
      .then((res) => res.json())
      .then(setProblem);
  }, [company, problemId]);

  useEffect(() => {
    setCode(boilerplate[language]);
    setCanSubmit(false);
    setSubmitResult("");
    setAiFeedback("");
  }, [language]);

  // RUN
  const runCode = async () => {
    setOutput("Running...");
    setCanSubmit(false);

    const res = await fetch("http://127.0.0.1:5000/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ code, language }),

    });

    const data = await res.json();

    if (data.status === "success") {
      setOutput("✅ All test cases passed");
      setCanSubmit(true);
    } else if (data.status === "failed") {
      setOutput(`❌ ${data.message}`);
    } else {
      setOutput(`⚠️ ${data.message}`);
    }
  };

  // SUBMIT + AI REVIEW
  const handleSubmit = async () => {
    setSubmitResult("Submitting...");
    setAiFeedback("");

    const res = await fetch("http://127.0.0.1:5000/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });

    const data = await res.json();

    if (data.status === "accepted") {
      setSubmitResult(`🎉 Accepted\nRuntime: ${data.runtime}`);
      setLoadingAI(true);

      // AI REVIEW
      const aiRes = await fetch("http://localhost:5000/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problem: problem.title,
          company: company,
          result: "accepted",
        }),
      });

      const aiData = await aiRes.json();
      setAiFeedback(aiData.review);
      setLoadingAI(false);
    } else {
      setSubmitResult("❌ Wrong Answer");
    }
  };

  if (!problem) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
     <div style={{ width: "45%", padding: "20px", overflowY: "auto" }}>
  <h2>{problem.title}</h2>
  <span style={{ color: "#22c55e", fontWeight: "bold" }}>
    {problem.difficulty}
  </span>

  <h4 style={{ marginTop: "15px" }}>Problem</h4>
  <p>{problem.problemStatement}</p>

  <h4>Input Format</h4>
  <p>{problem.inputFormat}</p>

  <h4>Output Format</h4>
  <p>{problem.outputFormat}</p>

  <h4>Examples</h4>
  {problem.examples.map((ex, i) => (
    <div
      key={i}
      style={{
        background: "#f1f5f9",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "10px",
      }}
    >
      <p><strong>Input:</strong> {ex.input}</p>
      <p><strong>Output:</strong> {ex.output}</p>
      <p><strong>Explanation:</strong> {ex.explanation}</p>
    </div>
  ))}

  <h4>Sample Test Cases</h4>
  {problem.visibleTestCases.map((tc, i) => (
    <div
      key={i}
      style={{
        background: "#e2e8f0",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
      }}
    >
      <p><strong>Input:</strong> {tc.input}</p>
      <p><strong>Output:</strong> {tc.output}</p>
    </div>
  ))}

  <h4>Constraints</h4>
  <ul>
    {problem.constraints.map((c, i) => (
      <li key={i}>{c}</li>
    ))}
  </ul>
</div>


      <div style={{ width: "55%", padding: "20px" }}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
        </select>

       <Editor
  height="60vh"
  language={language === "cpp" ? "cpp" : language}
  theme="vs-dark"
  value={code}
  onChange={(value) => setCode(value || "")}
  options={{
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    wordWrap: "on",
    automaticLayout: true,
  }}
  onMount={(editor) => {
    editorRef.current = editor;
  }}
/>


        <button onClick={runCode}>Run</button>
        <button disabled={!canSubmit} onClick={handleSubmit}>
          Submit
        </button>

        <pre>{output}</pre>
        <pre>{submitResult}</pre>

        {loadingAI && <p>🤖 AI is reviewing...</p>}

        {aiFeedback && (
          <pre style={{ background: "#020617", color: "white" }}>
            {aiFeedback}
          </pre>
        )}
      </div>
    </div>
  );
}

