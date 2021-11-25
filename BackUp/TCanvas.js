import React from "react";
import { Canvas } from "@react-three/fiber";

export const TCanvas = (props) => {
  const { children, fov = 50, position = [0, 3, 10] } = props;
  return (
    <Canvas
      style={{ width: "300px", height: "304px" }}
      camera={{ fov, position }}
      dpr={[1, 2]}
      shadows
    >
      {children}
    </Canvas>
  );
};
