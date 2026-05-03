import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProgress } from "../utils/progress";

const difficultyClass = (difficulty = "") => difficulty.toLowerCase();

export default function CompanyProblems() {
  const { company } = useParams();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(getProgress());

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/problems?company=${company}`)
      .then((res) => res.json())
      .then((data) => {
        setProblems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setProblems([]);
      })
      .finally(() => setLoading(false));
  }, [company]);

  useEffect(() => {
    const refresh = () => setProgress(getProgress());

    window.addEventListener("storage", refresh);
    window.addEventListener("progress-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("progress-updated", refresh);
    };
  }, []);

  const companyName = company.charAt(0).toUpperCase() + company.slice(1);

  return (
    <main className="page">
      <div className="section-head">
        <div>
          <span className="tag">{companyName}</span>
          <h1>{companyName} Problems</h1>
          <p>Open a problem, write your solution, run tests, then submit.</p>
        </div>
        <button className="btn" onClick={() => navigate("/companies")}>
          Back to Companies
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading problems...</div>
      ) : problems.length === 0 ? (
        <div className="empty-state">
          No problems are available for this company yet.
        </div>
      ) : (
        <div className="problem-list">
          {problems.map((problem) => (
            <article
              className={`problem-card ${progress[problem.id]?.status || ""}`}
              key={problem.id}
              onClick={() => navigate(`/companies/${company}/problem/${problem.id}`)}
            >
              <div>
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
                <div className="tags">
                  {problem.tags?.map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="card-status">
                {progress[problem.id]?.status && (
                  <span className={`badge status-${progress[problem.id].status}`}>
                    {progress[problem.id].status}
                  </span>
                )}
                <span className={`badge ${difficultyClass(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
