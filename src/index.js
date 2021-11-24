import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ColorsContextProvider } from "./contexts/ColorsContext";
import { PositionsContextProvider } from "./contexts/PositionsContext";

ReactDOM.render(
  <React.StrictMode>
    <PositionsContextProvider>
      <ColorsContextProvider>
        <App />
      </ColorsContextProvider>
    </PositionsContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);