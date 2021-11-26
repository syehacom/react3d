import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

export default function Mate() {
  const canvasRef = useRef(null);
  const ENDPOINT = "http://127.0.0.1:3001";
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.connect();
    socket.on("FromAPI", (data) => {
      if (data) {
        setResponse(data);
      }
    });
    return () => socket.disconnect();
  }, [response]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    if (!response) {
      return;
    } else {
      // response.forEach((e) => {
      // const keypoints = e.scaledMesh;
      // const boundingBox = e.boundingBox;
      // const bottomRight = boundingBox.bottomRight;
      // const topLeft = boundingBox.topLeft;
      // const distance =
      //   Math.sqrt(
      //     Math.pow(bottomRight[0] - topLeft[0], 2) +
      //     Math.pow(topLeft[1] - topLeft[1], 2)
      //   ) * 0.02;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      function drawCircle(x2, y2, r2, a2, b2, lineColor) {
        ctx.beginPath();
        ctx.arc(x2, y2, r2, a2, b2 * Math.PI);
        ctx.strokeStyle = lineColor;
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.stroke();
      }
      function drawsArc(x, y, r, l1, l2) {
        ctx.beginPath();
        ctx.arc(x, y, r, l1 * Math.PI, l2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
      }
      function darwEyes(x1, y1, a1, b1) {
        ctx.strokeStyle = "#754924";
        ParamEllipse(ctx, x1, y1, a1, b1);
        function ParamEllipse(ctx, x, y, a, b) {
          var step = a > b ? 1 / a : 1 / b;
          ctx.beginPath();
          ctx.moveTo(x + a, y);
          for (var i = 0; i < 2 * Math.PI; i += step) {
            ctx.lineTo(x + a * Math.cos(i), y + b * Math.sin(i));
          }
          ctx.closePath();
          ctx.fillStyle = "#754924";
          ctx.fill();
          ctx.stroke();
        }
      }
      drawCircle(150, 150, 150, 0, 2, "#EEE685", "#FCF200");
      ctx.strokeStyle = "#754924";
      darwEyes(response[130].x * 300, response[130].y * 300, 13.5, 18.5);
      drawCircle(
        response[130].x * 300,
        response[130].y * 300,
        9,
        0,
        2,
        "#754924",
        "#F5F5F5"
      );
      darwEyes(response[263].x * 300, response[263].y * 300, 13.5, 18.5);
      drawCircle(
        response[263].x * 300,
        response[263].y * 300,
        9,
        0,
        2,
        "#754924",
        "#F5F5F5"
      );
      drawsArc(response[35].x * 300, response[35].y * 300, 37.5, 1.3, 1.7);
      drawsArc(response[265].x * 300, response[265].y * 300, 37.5, 1.3, 1.7);
      drawsArc(response[13].x * 300, response[13].y * 300, 135, 0.3, 0.7);
    }
  }, [response]);

  return (
    <div
      style={{
        width: "300px",
        height: "300px",
      }}
    >
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
