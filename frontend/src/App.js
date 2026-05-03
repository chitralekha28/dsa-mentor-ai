import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import CompanyProblems from "./pages/CompanyProblems";
import Dashboard from "./pages/Dashboard";
import ProblemDetail from "./pages/ProblemDetail";
import SolveProblem from "./pages/SolveProblem";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <Link className="brand" to="/">
            <span className="brand-mark">D</span>
            <span>DSA Mentor AI</span>
          </Link>
          <nav className="nav-actions">
            <Link className="btn" to="/dashboard">Dashboard</Link>
            <Link className="btn" to="/companies">Companies</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:company" element={<CompanyProblems />} />
          <Route
            path="/companies/:company/problem/:problemId"
            element={<ProblemDetail />}
          />
          <Route path="/solve/:id" element={<SolveProblem />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
