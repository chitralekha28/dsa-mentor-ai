import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="page hero">
      <section className="hero-copy">
        <span className="tag">Company-wise DSA practice</span>
        <h1>DSA Mentor AI</h1>
        <p>
          Practice focused interview problems, run code against hidden tests,
          and get a guided review after acceptance.
        </p>

        <div className="hero-actions">
          <button className="btn primary" onClick={() => navigate("/companies")}>
            Start Preparing
          </button>
          <button className="btn" onClick={() => navigate("/companies/amazon")}>
            Try Amazon Set
          </button>
          <button className="btn" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </button>
        </div>
      </section>

      <section className="hero-panel" aria-label="Platform preview">
        <div className="terminal-head">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <div className="terminal-body">
          <div className="terminal-row">
            <span>Problems</span>
            <strong>Company curated</strong>
          </div>
          <div className="terminal-row">
            <span>Judge</span>
            <strong>Python, JS, C++, Java</strong>
          </div>
          <div className="terminal-row">
            <span>Workflow</span>
            <strong>Run, submit, review</strong>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
