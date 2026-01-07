import { useNavigate } from "react-router-dom";

const Companies = () => {
  const navigate = useNavigate();

  const companies = [
    { name: "Google", slug: "google" },
    { name: "Amazon", slug: "amazon" },
    { name: "Microsoft", slug: "microsoft" },
    { name: "Meta", slug: "meta" },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ textAlign: "center" }}>Company-wise DSA</h1>
      <p style={{ textAlign: "center", marginBottom: "40px" }}>
        Choose a company to start practicing
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {companies.map((company) => (
          <div
            key={company.slug}
            onClick={() => navigate(`/companies/${company.slug}`)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "30px",
              textAlign: "center",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <h2>{company.name}</h2>
            <p>DSA Questions</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Companies;
