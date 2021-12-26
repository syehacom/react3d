import React from "react";
import Admin from "./components/Admin";
// import Sky from "./components/Sky";

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
          height: "100%",
          width: "100%",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* <Sky /> */}
        <Admin />
      </div>
    </div>
  );
}
