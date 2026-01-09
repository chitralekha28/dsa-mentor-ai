import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import CompanyProblems from "./pages/CompanyProblems";
import ProblemDetail from "./pages/ProblemDetail";
import CodeEditor from "./CodeEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:company" element={<CompanyProblems />} />
          <Route
  path="/companies/:company/problem/:problemId"
  element={<ProblemDetail />}
/>
      </Routes>
    

    </BrowserRouter>
  );
}

export default App;
