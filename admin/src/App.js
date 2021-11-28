import React from "react";
import Vrm from "./components/Vrm";
import Sky from "./components/Sky";
// import Live from "./components/Live";

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
      {/* <div
        style={{
          position: "absolute",
          top: 0,
          height: "50%",
          width: "100%",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Vrm />
      </div> */}
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
        <Vrm />
      </div>
    </div>
  );
}
