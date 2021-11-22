import React, { useContext, useRef } from "react";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { TCanvas } from "../utils/TCanvas";
import { ColorsContext } from "../contexts/ColorsContext";
import { BridgeContextProvider } from "../contexts/BridgeContext";

const ModelPath = "/assets/model.glb";

export default function Mate() {
  const group = useRef();
  const { nodes } = useGLTF(ModelPath);
  const { colors } = useContext(ColorsContext);

  const material = new THREE.MeshStandardMaterial({
    color: colors,
    roughness: 0.5,
    metalness: 0.5,
    opacity: 1,
    transparent: true,
  });

  return (
    <div>
      <TCanvas>
        <BridgeContextProvider value={{ ...colors }}>
          <OrbitControls enablePan={false} />
          <group ref={group} dispose={null}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Cube.geometry}
              material={material}
              position={[0, 0, 1]}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          </group>
          <Environment files="/assets/model.hdr" background />
        </BridgeContextProvider>
      </TCanvas>
    </div>
  );
}

useGLTF.preload(ModelPath);
