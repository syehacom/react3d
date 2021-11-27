import React from "react";
import Vrm from "./components/Vrm";

export default function App() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "row",
        }}
      >
          <Vrm />
      </div>
    </div>
  );
}
