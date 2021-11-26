import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ColorsContextProvider } from "./contexts/ColorsContext";

ReactDOM.render(
  <React.StrictMode>
      <ColorsContextProvider>
        <App />
      </ColorsContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);