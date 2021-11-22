import React, { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FaceMesh,
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_LEFT_IRIS,
  FACEMESH_LIPS,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_TESSELATION,
} from "@mediapipe/face_mesh";

export default function Face() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);

  const onResults = useCallback((results) => {
    resultsRef.current = results;
    const ctx = canvasRef.current.getContext("2d");
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(results.image, 0, 0, width, height);
    if (results.multiFaceLandmarks) {
      const lineWidth = 1;
      const tesselation = { color: "#C0C0C070", lineWidth };
      const right_eye = { color: "#FF3030", lineWidth };
      const left_eye = { color: "#30FF30", lineWidth };
      const face_oval = { color: "#E0E0E0", lineWidth };

      for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, tesselation);
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, right_eye);
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, right_eye);
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, right_eye);
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, left_eye);
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, left_eye);
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, left_eye);
        drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, face_oval);
        drawConnectors(ctx, landmarks, FACEMESH_LIPS, face_oval);
        drawPoint(ctx, landmarks[1]);
      }
    }
    ctx.restore();
  }, []);

  const drawPoint = (ctx, point) => {
    const x = ctx.canvas.width * point.x;
    const y = ctx.canvas.height * point.y;
    const r = 5;
    ctx.fillStyle = "#22a7f2";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
  };

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults(onResults);
    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 240,
        height: 240,
      });
      camera.start();
    }
    return () => {
      faceMesh.close();
    };
  }, [onResults]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{ visibility: "hidden" }}
        audio={false}
        width={200}
        height={200}
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 200, height: 200, facingMode: "user" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: "10px",
          bottom: "2px",
          left: "0px",
          padding: "20px",
          position: "absolute",
        }}
        width={200}
        height={200}
      />
    </div>
  );
}
