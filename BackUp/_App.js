import React, { useContext, Suspense } from "react";
import { HexColorPicker } from "react-colorful";
import Media from "./components/Media";
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
          top: "200px",
          left: "20px",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Suspense fallback={null}>
          <Mate />
        </Suspense>
      </div>
      <div
        style={{
          position: "absolute",
          top: "200px",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Suspense fallback={null}>
          <Media />
        </Suspense>
      </div>
      <div
        style={{
          position: "absolute",
          top: "200px",
          right: "20px",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <HexColorPicker
          style={{ width: "300px", height: "300px" }}
          color={colors}
          onChange={colorHandler}
        />
      </div>
    </div>
  );
}
