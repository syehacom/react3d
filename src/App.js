import React, { useState, Suspense } from "react";
import { HexColorPicker } from "react-colorful";
import Hand from "./components/Hand";
import Face from "./components/Face";
import Mate from "./components/Mate";

export default function App() {
  const [colors, setColors] = useState("#fff");
  const [change, setChange] = useState(false);

  const colorHandler = (newColor) => {
    setColors(newColor);
  };
  const changeHandler = () => {
    setChange(!change);
  };

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
      <button
        style={{
          color: "#fff",
          backgroundColor: colors,
          fontSize: "1rem",
          border: "none",
          borderRadius: "5px",
          padding: "10px 10px",
          cursor: "pointer",
        }}
        onClick={changeHandler}
      >
        切り替え
      </button>
      <Suspense fallback={null}>
        {/* <Face /> */}
        <Hand />
        <Mate />
      </Suspense>
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HexColorPicker color={colors} onChange={colorHandler} />
      </div>
    </div>
  );
}
