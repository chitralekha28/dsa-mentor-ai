import { useNavigate } from "react-router-dom";

const companies = [
  {
    name: "Google",
    slug: "google",
    focus: "Strings, sliding windows, and clean reasoning.",
    count: "1 problem",
  },
  {
    name: "Amazon",
    slug: "amazon",
    focus: "Arrays, hash maps, and fast implementation.",
    count: "1 problem",
  },
  {
    name: "Microsoft",
    slug: "microsoft",
    focus: "Coming soon.",
    count: "Planned",
  },
  {
    name: "Meta",
    slug: "meta",
    focus: "Coming soon.",
    count: "Planned",
  },
];

const Companies = () => {
  const navigate = useNavigate();

  return (
    <main className="page">
      <div className="section-head">
        <div>
          <span className="tag">Practice tracks</span>
          <h1>Choose a company</h1>
          <p>Pick a track and start solving with the built-in editor.</p>
        </div>
      </div>

      <div className="grid company-grid">
        {companies.map((company) => (
          <article
            className="company-card"
            key={company.slug}
            onClick={() => navigate(`/companies/${company.slug}`)}
          >
            <span className="badge">{company.count}</span>
            <h2>{company.name}</h2>
            <p>{company.focus}</p>
          </article>
        ))}
      </div>
    </main>
  );
};

export default Companies;
