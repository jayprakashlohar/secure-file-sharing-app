import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
// import { FileProvider } from "./context/FileContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {/* <FileProvider> */}
      <App />
      {/* </FileProvider> */}
    </AuthProvider>
  </React.StrictMode>
);
