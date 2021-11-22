import React, { useRef } from "react";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TCanvas } from "../utils/TCanvas";

const ModelPath = "/assets/model.glb";

export default function Mate() {
  const group = useRef();
  const { nodes } = useGLTF(ModelPath);

  const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    roughness: 0.5,
    metalness: 0.5,
    opacity: 1,
    transparent: true,
  });

  return (
    <div>
      <TCanvas>
        <OrbitControls enablePan={false} />
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
          {/* <Environment files="/assets/model.hdr" background /> */}
      </TCanvas>
    </div>
  );
}

useGLTF.preload(ModelPath);
