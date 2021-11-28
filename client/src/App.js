import React from "react";
import Sky from "./components/Sky";
import Live from "./components/Live";

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
          bottom: 0,
          height: "50%",
          width: "100%",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Sky />
        <Live />
      </div>
    </div>
  );
}
