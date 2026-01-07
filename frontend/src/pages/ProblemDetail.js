import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

const boilerplate = {
  python: `def twoSum(nums, target):
    # Write your code here
    pass`,

  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
    }
};`,

  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
    }
}`,

  javascript: `var twoSum = function(nums, target) {
    // Write your code here
};`
};

const ProblemDetail = () => {
  const { company, problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/problem/${company}/${problemId}`)
      .then((res) => res.json())
      .then((data) => setProblem(data));
  }, [company, problemId]);
   useEffect(() => {
  setCode(boilerplate[language]);
}, [language]);

 const runCode = () => {
  if (language !== "python") {
    setOutput("⚠️ Code execution available only for Python right now.");
    return;
  }

  fetch("http://127.0.0.1:5000/api/run/python", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
    .then((res) => res.json())
    .then((data) => setOutput(data.output))
    .catch(() => setOutput("Error running code"));
};


  if (!problem) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
  
  {/* LEFT PANEL */}
  <div style={{
    width: "45%",
    padding: "25px",
    overflowY: "scroll",
    borderRight: "1px solid #ddd"
  }}>
    <h2>{problem.title}</h2>
    <span style={{
      color: problem.difficulty === "Easy" ? "green" : "orange",
      fontWeight: "bold"
    }}>
      {problem.difficulty}
    </span>

    <p style={{ marginTop: "20px" }}>{problem.description}</p>

    <h4>Example</h4>
    {problem.examples.map((ex, idx) => (
      <div key={idx} style={{ background: "#f5f5f5", padding: "10px" }}>
        <p><strong>Input:</strong> {ex.input}</p>
        <p><strong>Output:</strong> {ex.output}</p>
        <p><strong>Explanation:</strong> {ex.explanation}</p>
      </div>
    ))}

    <h4>Constraints</h4>
    <ul>
      {problem.constraints.map((c, i) => (
        <li key={i}>{c}</li>
      ))}
    </ul>
  </div>

  {/* RIGHT PANEL */}
<div style={{ width: "55%", padding: "25px" }}>

  <div style={{ marginBottom: "10px" }}>
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="python">Python</option>
      <option value="cpp">C++</option>
      <option value="java">Java</option>
      <option value="javascript">JavaScript</option>
    </select>
  </div>

 <Editor
  height="60vh"
  language={
    language === "cpp"
      ? "cpp"
      : language === "javascript"
      ? "javascript"
      : language
  }
  theme="vs-dark"
  value={code}
  onChange={(value) => setCode(value)}
  options={{
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: false,   // ✅ IMPORTANT
  }}
/>
 <button style={{ marginTop: "10px" }}>▶ Run</button>
    <button style={{ marginLeft: "10px" }}>✔ Submit</button>
  </div>
</div>

  );
};

export default ProblemDetail;
