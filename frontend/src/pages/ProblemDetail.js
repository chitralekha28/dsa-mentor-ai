import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getProblemProgress, markAttempted, markSolved } from "../utils/progress";

const API_BASE = "http://127.0.0.1:5000/api";

const fallbackStarterCode = {
  python: "def solve():\n    pass",
  cpp: "void solve() {\n    \n}",
  java: "class Solution {\n    \n}",
  javascript: "function solve() {\n  \n}",
};

const difficultyClass = (difficulty = "") => difficulty.toLowerCase();

export default function ProblemDetail() {
  const { company, problemId, id } = useParams();
  const navigate = useNavigate();
  const resolvedProblemId = problemId || id;
  const editorRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [submitResult, setSubmitResult] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");

  const starterCode = useMemo(
    () => problem?.starterCode || fallbackStarterCode,
    [problem]
  );

  useEffect(() => {
    const controller = new AbortController();
    const url = company
      ? `${API_BASE}/problems/${company}/${resolvedProblemId}`
      : `${API_BASE}/problems/${resolvedProblemId}`;

    setLoading(true);
    setLoadError("");

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Problem not found");
        }
        return res.json();
      })
      .then((data) => setProblem(data))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoadError(error.message);
          setProblem(null);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [company, resolvedProblemId]);

  useEffect(() => {
    if (problem?.id) {
      setProgressStatus(getProblemProgress(problem.id).status || "");
    }
  }, [problem]);

  useEffect(() => {
    setCode(starterCode[language] || fallbackStarterCode[language]);
    setOutput("");
    setOutputStatus("");
    setCanSubmit(false);
    setSubmitResult("");
    setSubmitStatus("");
    setAiFeedback("");
  }, [language, starterCode]);

  const runCode = async () => {
    setOutput("Running tests...");
    setOutputStatus("");
    setCanSubmit(false);
    setSubmitResult("");
    setSubmitStatus("");
    markAttempted(problem, language);
    setProgressStatus((current) => current || "attempted");

    try {
      const res = await fetch(`${API_BASE}/problems/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          company,
          problemId: problem.id,
        }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setOutput(`All test cases passed.\nRuntime: ${data.runtime}`);
        setOutputStatus("success");
        setCanSubmit(true);
        return;
      }

      setOutput(data.message || "Code did not pass the test cases.");
      setOutputStatus("error");
    } catch (error) {
      setOutput(`Run failed: ${error.message}`);
      setOutputStatus("error");
    }
  };

  const submitCode = async () => {
    setSubmitResult("Submitting...");
    setSubmitStatus("");
    setAiFeedback("");

    try {
      const res = await fetch(`${API_BASE}/problems/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          company,
          problemId: problem.id,
        }),
      });
      const data = await res.json();

      if (data.status !== "accepted") {
        setSubmitResult(data.message || "Wrong answer");
        setSubmitStatus("error");
        return;
      }

      setSubmitResult(`Accepted\nRuntime: ${data.runtime}`);
      setSubmitStatus("success");
      markSolved(problem, language, data.runtime);
      setProgressStatus("solved");
      setLoadingAI(true);

      const aiRes = await fetch(`${API_BASE}/ai-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problem: problem.title,
          company: problem.company || company,
          result: "accepted",
        }),
      });
      const aiData = await aiRes.json();
      setAiFeedback(aiData.review || "AI review is unavailable right now.");
    } catch (error) {
      setSubmitResult(`Submit failed: ${error.message}`);
      setSubmitStatus("error");
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) return <div className="loading-state">Loading problem...</div>;
  if (loadError) return <div className="empty-state">{loadError}</div>;
  if (!problem) return <div className="empty-state">Problem unavailable.</div>;

  return (
    <main className="problem-workspace">
      <section className="problem-pane">
        <div className="meta-row">
          <button
            className="btn"
            onClick={() => navigate(company ? `/companies/${company}` : "/companies")}
          >
            Back
          </button>
          <span className={`badge ${difficultyClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.company && <span className="tag">{problem.company}</span>}
          {progressStatus && (
            <span className={`badge status-${progressStatus}`}>{progressStatus}</span>
          )}
        </div>

        <h1 className="problem-title">{problem.title}</h1>

        <div className="tags">
          {problem.tags?.map((tag) => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>

        <section className="content-section">
          <h4>Problem</h4>
          <p>{problem.problemStatement || problem.description}</p>
        </section>

        <section className="content-section">
          <h4>Input Format</h4>
          <p>{problem.inputFormat}</p>
        </section>

        <section className="content-section">
          <h4>Output Format</h4>
          <p>{problem.outputFormat}</p>
        </section>

        <section className="content-section">
          <h4>Examples</h4>
          {problem.examples?.map((example, index) => (
            <div className="example-box" key={`${example.input}-${index}`}>
              <p><strong>Input:</strong> {example.input}</p>
              <p><strong>Output:</strong> {example.output}</p>
              {example.explanation && (
                <p><strong>Explanation:</strong> {example.explanation}</p>
              )}
            </div>
          ))}
        </section>

        <section className="content-section">
          <h4>Sample Test Cases</h4>
          {problem.visibleTestCases?.map((testCase, index) => (
            <div className="example-box" key={`${testCase.input}-${index}`}>
              <p><strong>Input:</strong> {testCase.input}</p>
              <p><strong>Output:</strong> {testCase.output}</p>
            </div>
          ))}
        </section>

        <section className="content-section">
          <h4>Constraints</h4>
          <ul>
            {problem.constraints?.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </section>
      </section>

      <section className="editor-pane">
        <div className="editor-toolbar">
          <label htmlFor="language">Language</label>
          <select
            className="language-select"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <div className="editor-frame">
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            onChange={(value) => setCode(value || "")}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              automaticLayout: true,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
            theme="vs-dark"
            value={code}
          />
        </div>

        <div className="editor-actions">
          <button className="btn" onClick={runCode}>Run</button>
          <button className="btn primary" disabled={!canSubmit} onClick={submitCode}>
            Submit
          </button>
        </div>

        {output && <pre className={`console ${outputStatus}`}>{output}</pre>}
        {submitResult && (
          <pre className={`console ${submitStatus}`}>{submitResult}</pre>
        )}
        {loadingAI && <pre className="console">AI is reviewing...</pre>}
        {aiFeedback && <pre className="console">{aiFeedback}</pre>}
      </section>
    </main>
  );
}
