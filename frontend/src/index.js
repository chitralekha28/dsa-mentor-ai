import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
window.addEventListener("error", (e) => {
  if (e.message.includes("ResizeObserver")) {
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
