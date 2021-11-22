import React, { useContext, Suspense } from "react";
import { HexColorPicker } from "react-colorful";
import Face from "./components/Face";
import Mate from "./components/Mate";
import { ColorsContext } from "./contexts/ColorsContext";

export default function App() {
  const { colors, changeColors } = useContext(ColorsContext);

  const colorHandler = (newColor) => {
    changeColors(newColor);
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
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "2px",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Suspense fallback={null}>
          <Mate />
        </Suspense>
      </div>
      <div
        style={{
          position: "absolute",
          top: "300px",
          left: "20px",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Face />
      </div>
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
