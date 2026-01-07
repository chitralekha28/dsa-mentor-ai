import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();   // ✅ ADD THIS LINE

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1 style={{ fontSize: "48px" }}>DSA Mentor AI 🚀</h1>

      <p style={{ fontSize: "18px", marginTop: "20px" }}>
        Your personal AI mentor for company-wise DSA preparation
      </p>

      <div style={{ marginTop: "40px" }}>
        <button
          style={{ padding: "12px 24px", fontSize: "16px" }}
          onClick={() => navigate("/companies")}   // ✅ ADD THIS
        >
          Start Preparing
        </button>
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Why DSA Mentor AI?</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>✅ Company-specific DSA questions</li>
          <li>✅ AI-powered hints & explanations</li>
          <li>✅ Personalized preparation roadmap</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
