import React, { useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FaceMesh,
  FACEMESH_TESSELATION,
  FACEMESH_LIPS,
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_LEFT_IRIS,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_RIGHT_IRIS,
} from "@mediapipe/face_mesh";
import socketIOClient from "socket.io-client";

export default function Media() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);
  const ENDPOINT = "http://127.0.0.1:3001";
  const socket = socketIOClient(ENDPOINT);

  const onResults = useCallback((results) => {
    resultsRef.current = results;
    const ctx = canvasRef.current.getContext("2d");
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(results.image, 0, 0, width, height);
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        });
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
        });
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, {
          color: "#FF3030",
        });
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, {
          color: "#FF3030",
        });
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
          color: "#30FF30",
        });
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, {
          color: "#30FF30",
        });
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, {
          color: "#30FF30",
        });
        drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
        });
        drawConnectors(ctx, landmarks, FACEMESH_LIPS, {
          color: "#E0E0E0",
        });
        drawPoint(ctx, landmarks[1]);
        if (socket !== undefined) {
          socket.emit("FromAPI", landmarks[1]);
        }
      }
    }
    ctx.restore();
    // eslint-disable-next-line
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
        width: 300,
        height: 300,
      });
      camera.start();
    }
    return () => {
      faceMesh.close();
    };
  }, [onResults]);

  return (
    <div
      style={{
        width: "300px",
        height: "300px",
      }}
    >
      <Webcam
        ref={webcamRef}
        style={{ visibility: "hidden" }}
        audio={false}
        width={300}
        height={300}
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 300, height: 300, facingMode: "user" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: "10px",
          bottom: "0px",
          left: "0px",
          padding: "20px",
          position: "absolute",
        }}
        width={300}
        height={300}
      ></canvas>
    </div>
  );
}
