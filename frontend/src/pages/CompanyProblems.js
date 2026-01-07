import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const CompanyProblems = () => {
  const { company } = useParams();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/problems/${company}`)
      .then((res) => res.json())
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [company]);

  if (loading) return <p style={{ padding: "40px" }}>Loading problems...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ textTransform: "capitalize" }}>
        {company} DSA Problems
      </h1>

      {problems.length === 0 ? (
        <p>No problems found for this company.</p>
      ) : (
        <ul style={{ marginTop: "30px" }}>
          {problems.map((problem) => (
            <li
              key={problem.id}
              onClick={() =>
    navigate(`/companies/${company}/problem/${problem.id}`)
  }
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
                listStyle: "none",
              }}
            >
              <h3>{problem.title}</h3>
              <span
                style={{
                  fontWeight: "bold",
                  color:
                    problem.difficulty === "Easy"
                      ? "green"
                      : problem.difficulty === "Medium"
                      ? "orange"
                      : "red",
                }}
              >
                {problem.difficulty}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompanyProblems;
