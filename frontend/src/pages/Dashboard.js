import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProgressSummary } from "../utils/progress";

const difficultyClass = (difficulty = "") => difficulty.toLowerCase();

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(getProgressSummary());

  useEffect(() => {
    const refresh = () => setSummary(getProgressSummary());

    window.addEventListener("storage", refresh);
    window.addEventListener("progress-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("progress-updated", refresh);
    };
  }, []);

  const solvedByCompany = useMemo(() => {
    return summary.entries.reduce((acc, item) => {
      const company = item.company || "Unknown";
      if (!acc[company]) {
        acc[company] = { attempted: 0, solved: 0 };
      }

      if (item.status === "solved") {
        acc[company].solved += 1;
      } else {
        acc[company].attempted += 1;
      }

      return acc;
    }, {});
  }, [summary.entries]);

  return (
    <main className="page">
      <div className="section-head">
        <div>
          <span className="tag">Your progress</span>
          <h1>Dashboard</h1>
          <p>Track solved problems, active attempts, and recent work.</p>
        </div>
        <button className="btn primary" onClick={() => navigate("/companies")}>
          Practice More
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Solved</span>
          <strong>{summary.solved}</strong>
        </div>
        <div className="stat-card">
          <span>Attempted</span>
          <strong>{summary.attempted}</strong>
        </div>
        <div className="stat-card">
          <span>Total touched</span>
          <strong>{summary.totalTouched}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <h2>Company Progress</h2>
          {Object.keys(solvedByCompany).length === 0 ? (
            <p className="muted">Solve a problem to start building history.</p>
          ) : (
            Object.entries(solvedByCompany).map(([company, stats]) => (
              <div className="progress-row" key={company}>
                <span>{company}</span>
                <strong>{stats.solved} solved / {stats.attempted} attempted</strong>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-panel">
          <h2>Recent Problems</h2>
          {summary.entries.length === 0 ? (
            <p className="muted">No attempts yet.</p>
          ) : (
            [...summary.entries]
              .sort((a, b) => new Date(b.lastAttemptedAt) - new Date(a.lastAttemptedAt))
              .slice(0, 6)
              .map((item) => (
                <button
                  className="history-item"
                  key={item.id}
                  onClick={() => navigate(`/companies/${item.company.toLowerCase()}/problem/${item.id}`)}
                  type="button"
                >
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.company} · {item.language}</small>
                  </span>
                  <span className={`badge ${item.status === "solved" ? "easy" : difficultyClass(item.difficulty)}`}>
                    {item.status}
                  </span>
                </button>
              ))
          )}
        </div>
      </section>
    </main>
  );
}
