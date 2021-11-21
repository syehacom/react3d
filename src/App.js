import React, { useState, useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import { HexColorPicker } from "react-colorful";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

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
    const ctx = canvasRef.current.getContext("2d");
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);
    ctx.drawImage(results.image, 0, 0, width, height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(ctx, landmarks, {
          color: "#FF0000",
          lineWidth: 1,
          radius: 5,
        });
      }
      drawCircle(ctx, results.multiHandLandmarks);
    }
    ctx.restore();
  }, []);

  const drawCircle = (ctx, handLandmarks) => {
    if (
      handLandmarks.length === 2 &&
      handLandmarks[0].length > 8 &&
      handLandmarks[1].length > 8
    ) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const [x1, y1] = [
        handLandmarks[0][8].x * width,
        handLandmarks[0][8].y * height,
      ];
      const [x2, y2] = [
        handLandmarks[1][8].x * width,
        handLandmarks[1][8].y * height,
      ];
      const x = (x1 + x2) / 2;
      const y = (y1 + y2) / 2;
      const r = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) / 2;
      ctx.strokeStyle = "#0082cf";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.stroke();
    }
  };

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
      <Webcam
        ref={webcamRef}
        style={{ visibility: "hidden" }}
        audio={false}
        width={480}
        height={480}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 480, height: 480, facingMode: "user" }}
      />
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
  );
};
