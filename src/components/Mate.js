import React, {
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
// import { OrbitControls, useGLTF } from "@react-three/drei";
// import * as THREE from "three";
// import { TCanvas } from "../utils/TCanvas";
// import { TFloor } from "../utils/TFloor";
// import { TLight } from "../utils/TLight";
// import { BridgeContextProvider } from "../contexts/BridgeContext";
import { ColorsContext } from "../contexts/ColorsContext";
import { PositionsContext } from "../contexts/PositionsContext";
import socketIOClient from "socket.io-client";

// const ModelPath = "/assets/model.glb";

export default function Mate() {
  // const group = useRef();
  // const { nodes } = useGLTF(ModelPath);
  const { colors } = useContext(ColorsContext);
  const { positions } = useContext(PositionsContext);
  const canvasRef = useRef(null);
  const ENDPOINT = "http://127.0.0.1:3001";
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.connect();
    socket.on("FromAPI", (data) => {
      if (data) {
        setResponse(data.x);
      }
    });
    return () => socket.disconnect();
  }, []);
  
  // const material = new THREE.MeshStandardMaterial({
  //   color: colors,
  //   roughness: 0.5,
  //   metalness: 0.5,
  //   opacity: 1,
  //   transparent: true,
  // });
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors;
    if (positions) {
      ctx.fillRect(100, 100, 100, 100);
    } else {
      ctx.fillRect(0, 0, 300, 300);
    }
  }, [response, positions, colors]);

  return (
    <div
      style={{
        width: "300px",
        height: "300px",
      }}
    >
      <p>{response}</p>
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
      {/* <TCanvas>
        <BridgeContextProvider value={{ ...colors }}>
          <OrbitControls enablePan={false} />
          <TLight />
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
          <TFloor isGridHelper={true} />
        </BridgeContextProvider>
      </TCanvas> */}
    </div>
  );
}

// useGLTF.preload(ModelPath);
