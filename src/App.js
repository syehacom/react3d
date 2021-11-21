import React, { useState, useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import { drawCanvas } from "./drawCanvas";
import { HexColorPicker } from "react-colorful";

export const App = () => {
  const [colors, setColors] = useState("#fffff");
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);
  const changeHandler = (newColor) => {
    setColors(newColor);
  };

  const onResults = useCallback((results) => {
    resultsRef.current = results;
    const canvasCtx = canvasRef.current.getContext("2d");
    drawCanvas(canvasCtx, results);
  }, []);

  // 初期設定
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    if (webcamRef.current !== "undefined" && webcamRef.current !== null) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 480,
        height: 480,
      });
      camera.start();
    }
  }, [onResults]);

  /** 検出結果をconsoleに出力する */

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
      {/* capture */}
      <Webcam
        ref={webcamRef}
        style={{ visibility: "hidden" }}
        audio={false}
        width={480}
        height={480}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 480, height: 480, facingMode: "user" }}
      />
      {/* draw */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "480px",
          height: "480px",
          border: `10px solid ${colors}`,
          backgroundColor: "#fff",
        }}
        width={480}
        height={480}
      />
      {/* output */}
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
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
          <HexColorPicker color={colors} onChange={changeHandler} />
        </div>
      </div>
    </div>
  );
};
