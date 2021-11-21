import React, { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import { drawCanvas } from "./drawCanvas";

export const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);
  /**
   * 検出結果（フレーム毎に呼び出される）
   * @param results
   */
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
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, [onResults]);

  /** 検出結果をconsoleに出力する */
  const OutputData = () => {
    const results = resultsRef.current;
    console.log(results.multiHandLandmarks);
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
      {/* capture */}
      <Webcam
        audio={false}
        style={{ visibility: "hidden" }}
        width={1280}
        height={720}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
      />
      {/* draw */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "1280px",
          height: "720px",
          backgroundColor: "#fff",
        }}
        width={1280}
        height={720}
      />
      {/* output */}
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <button
          style={{
            color: "#fff",
            backgroundColor: "#0082cf",
            fontSize: "1rem",
            border: "none",
            borderRadius: "5px",
            padding: "10px 10px",
            cursor: "pointer",
          }}
          onClick={OutputData}
        >
          Output Data
        </button>
      </div>
    </div>
  );
};
