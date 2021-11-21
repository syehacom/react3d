import React, {
  Suspense,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { TCanvas } from "./components/TCanvas";
import { HexColorPicker } from "react-colorful";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import { draw } from "./components/drawCanvas";

const ModelPath = "/assets/model.glb";

export default function App() {
  const [colors, setColors] = useState("#fffff");
  const group = useRef();
  const { nodes } = useGLTF(ModelPath);
  const changeHandler = (newColor) => {
    setColors(newColor);
  };
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);

  const onResults = useCallback((results) => {
    resultsRef.current = results;
    const ctx = canvasRef.current.getContext("2d");
    draw(ctx, results, false, 0);
  }, []);
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
        width: 480,
        height: 480,
      });
      camera.start();
    }
    return () => {
      faceMesh.close();
    };
  }, [onResults]);

  const material = new THREE.MeshStandardMaterial({
    color: colors,
    roughness: 0.5,
    metalness: 0.5,
    opacity: 1,
    transparent: true,
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
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
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 480, height: 480, facingMode: "user" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "480px",
          height: "480px",
          border: "1px solid #fff",
          backgroundColor: colors,
        }}
        width={480}
        height={480}
      />
      {/* <TCanvas>
        <OrbitControls enablePan={false} />
        <Suspense fallback={null}>
          <group ref={group} dispose={null}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Cube.geometry}
              material={material}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          </group>
          <Environment files="/assets/model.hdr" background />
        </Suspense>
      </TCanvas> */}
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
}

useGLTF.preload(ModelPath);
