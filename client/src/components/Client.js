import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as Kalidokit from "../kalidokit";
import * as THREE from "three";
import { Vector3 } from "three";
import Vector from "../kalidokit/utils/vector.js";
import socketIOClient from "socket.io-client";

export default function Client() {
  // socket.io
  // const ENDPOINT = process.env.REACT_APP_SERVER;
  const ENDPOINT = "http://localhost:3000";
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.connect();
    socket.on("connect_error", () => {
      console.log("connect_error");
      socket.connect();
    });
    socket.on("FromAPI", (data) => {
      if (data) {
        setResponse(data);
      }
    });
    // Animate model
    animateVRM(currentVrm, response);
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const canvasRef = useRef(null);

  const lerp = Vector.lerp;
  const clamp = (val, min, max) => {
    return Math.max(Math.min(val, max), min);
  };

  // VRM
  useEffect(() => {
    loadVRM("/avatar.vrm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const Inputs = ({ onFileChange }) => (
  //   <label
  //     style={{
  //       zIndex: "1",
  //       border: "1px solid #ccc",
  //       top: "10px",
  //       height: "25px",
  //       width: "110px",
  //       position: "absolute",
  //       marginTop: "50px",
  //     }}
  //   >
  //     <input type="file" accept=".vrm" onChange={onFileChange} />
  //   </label>
  // );

  // const handleFileChange = useCallback(
  //   async (event) => {
  //     const url = URL.createObjectURL(event.target.files[0]);
  //     await loadVRM(url);
  //     URL.revokeObjectURL(url);
  //   },
  //   [loadVRM]
  // );

  const VRMS = ({ vrm }) => {
    useFrame(({ mouse }, delta) => {
      if (vrm) {
        if (vrm.lookAt) vrm.lookAt.lookAt(new Vector3(mouse.x, mouse.y, 0));
        vrm.update(delta);
      }
    });
    return vrm && <primitive object={vrm.scene} />;
  };

  const useVRM = () => {
    const { current: loader } = useRef(new GLTFLoader());
    const [vrm, setVRM] = useState(null);
    const loadVRM = useCallback(
      (url) =>
        new Promise((resolve) => loader.load(url, resolve))
          .then((gltf) => VRM.from(gltf))
          .then((vrm) => {
            vrm.scene.rotation.y = Math.PI;
            setVRM(vrm);
          }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    return [vrm, loadVRM];
  };

  const [currentVrm, loadVRM] = useVRM();

  extend({ OrbitControls });

  const Controls = () => {
    const controls = useRef(null);
    const { camera, gl } = useThree();
    useFrame(() => controls.current.update());
    return (
      <orbitControls
        ref={controls}
        args={[camera, gl.domElement]}
        zoomSpeed={0.2}
        enableDamping
        dampingFactor={0.2}
        target={new Vector3(0, 1, -2)}
      />
    );
  };

  // Animate Rotation Helper function
  const rigRotation = (
    name,
    rotation = { x: 0, y: 0, z: 0 },
    dampener = 1,
    lerpAmount = 0.3
  ) => {
    if (!currentVrm) {
      return;
    }
    const Part = currentVrm.humanoid.getBoneNode(
      VRMSchema.HumanoidBoneName[name]
    );
    if (!Part) {
      return;
    }

    let euler = new THREE.Euler(
      rotation.x * dampener,
      rotation.y * dampener,
      rotation.z * dampener
    );
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
  };

  // Animate Position Helper Function
  const rigPosition = (
    name,
    position = { x: 0, y: 0, z: 0 },
    dampener = 1,
    lerpAmount = 0.3
  ) => {
    if (!currentVrm) {
      return;
    }
    const Part = currentVrm.humanoid.getBoneNode(
      VRMSchema.HumanoidBoneName[name]
    );
    if (!Part) {
      return;
    }
    let vector = new THREE.Vector3(
      position.x * dampener,
      position.y * dampener,
      position.z * dampener
    );
    Part.position.lerp(vector, lerpAmount); // interpolate
  };

  let oldLookTarget = new THREE.Euler();
  const rigFace = (riggedFace) => {
    if (!currentVrm) {
      return;
    }
    rigRotation("Neck", riggedFace.head, 0.7);
    // Blendshapes and Preset Name Schema
    const Blendshape = currentVrm.blendShapeProxy;
    const PresetName = VRMSchema.BlendShapePresetName;
    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.
    riggedFace.eye.l = lerp(
      clamp(1 - riggedFace.eye.l, 0, 1),
      Blendshape.getValue(PresetName.Blink),
      0.5
    );
    riggedFace.eye.r = lerp(
      clamp(1 - riggedFace.eye.r, 0, 1),
      Blendshape.getValue(PresetName.Blink),
      0.5
    );
    riggedFace.eye = Kalidokit.Face.stabilizeBlink(
      riggedFace.eye,
      riggedFace.head.y
    );
    Blendshape.setValue(PresetName.Blink, riggedFace.eye.l);
    // Interpolate and set mouth blendshapes
    Blendshape.setValue(
      PresetName.I,
      lerp(riggedFace.mouth.shape.I, Blendshape.getValue(PresetName.I), 0.5)
    );
    Blendshape.setValue(
      PresetName.A,
      lerp(riggedFace.mouth.shape.A, Blendshape.getValue(PresetName.A), 0.5)
    );
    Blendshape.setValue(
      PresetName.E,
      lerp(riggedFace.mouth.shape.E, Blendshape.getValue(PresetName.E), 0.5)
    );
    Blendshape.setValue(
      PresetName.O,
      lerp(riggedFace.mouth.shape.O, Blendshape.getValue(PresetName.O), 0.5)
    );
    Blendshape.setValue(
      PresetName.U,
      lerp(riggedFace.mouth.shape.U, Blendshape.getValue(PresetName.U), 0.5)
    );
    //PUPILS
    //interpolate pupil and keep a copy of the value
    let lookTarget = new THREE.Euler(
      lerp(oldLookTarget.x, riggedFace.pupil.y, 0.4),
      lerp(oldLookTarget.y, riggedFace.pupil.x, 0.4),
      0,
      "XYZ"
    );
    oldLookTarget.copy(lookTarget);
    currentVrm.lookAt.applyer.lookAt(lookTarget);
  };

  /* VRM Character Animator */
  const animateVRM = (vrm, response) => {
    if (!vrm) {
      return;
    }
    if (response.ea) {
      delete response.ea[0];
      delete response.ea[1];
      delete response.ea[2];
      delete response.ea[3];
      delete response.ea[4];
      delete response.ea[5];
      delete response.ea[6];
      delete response.ea[7];
      delete response.ea[8];
      delete response.ea[9];
      delete response.ea[10];
      delete response.ea[21];
      delete response.ea[22];
      delete response.ea[29];
      delete response.ea[30];
      delete response.ea[31];
      delete response.ea[32];
      delete response.ea[33];
    }
    if (response.poseLandmarks) {
      delete response.poseLandmarks[0];
      delete response.poseLandmarks[1];
      delete response.poseLandmarks[2];
      delete response.poseLandmarks[3];
      delete response.poseLandmarks[4];
      delete response.poseLandmarks[5];
      delete response.poseLandmarks[6];
      delete response.poseLandmarks[7];
      delete response.poseLandmarks[8];
      delete response.poseLandmarks[9];
      delete response.poseLandmarks[10];
      delete response.poseLandmarks[13];
      delete response.poseLandmarks[14];
      delete response.poseLandmarks[17];
      delete response.poseLandmarks[18];
      delete response.poseLandmarks[19];
      delete response.poseLandmarks[20];
      delete response.poseLandmarks[21];
      delete response.poseLandmarks[22];
      delete response.poseLandmarks[25];
      delete response.poseLandmarks[26];
      delete response.poseLandmarks[27];
      delete response.poseLandmarks[28];
      delete response.poseLandmarks[29];
      delete response.poseLandmarks[30];
      delete response.poseLandmarks[31];
      delete response.poseLandmarks[32];
      delete response.poseLandmarks[33];
    }
    // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
    let riggedPose, riggedLeftHand, riggedRightHand;

    const faceLandmarks = response.faceLandmarksZ;
    // Pose 3D Landmarks are with respect to Hip distance in meters
    const pose3DLandmarks = response.ea;
    // Pose 2D landmarks are with respect to videoWidth and videoHeight
    const pose2DLandmarks = response.poseLandmarks;
    // Be careful, hand landmarks may be reversed
    const leftHandLandmarks = response.rightHandLandmarks;
    const rightHandLandmarks = response.leftHandLandmarks;

    // Animate Face
    if (faceLandmarks) {
      rigFace(Kalidokit.Face.solve(faceLandmarks), {
        runtime: "mediapipe",
        video: canvasRef,
        smoothBlink: true, // smooth left and right eye blink delays
      });
    }

    // Animate Pose
    if (pose2DLandmarks && pose3DLandmarks) {
      riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
        runtime: "mediapipe",
        video: canvasRef,
        enableLegs: true,
      });
      rigRotation("Hips", riggedPose.Hips.rotation, 0.7);
      rigPosition(
        "Hips",
        {
          x: -riggedPose.Hips.position.x, // Reverse direction
          y: riggedPose.Hips.position.y + 1, // Add a bit of height
          z: -riggedPose.Hips.position.z, // Reverse direction
        },
        1,
        0.07
      );
      rigRotation("Chest", riggedPose.Spine, 0.25, 0.3);
      rigRotation("Spine", riggedPose.Spine, 0.45, 0.3);
      rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3);
      rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3);
      rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3);
      rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3);
      rigRotation("LeftUpperLeg", riggedPose.LeftUpperLeg, 1, 0.3);
      rigRotation("LeftLowerLeg", riggedPose.LeftLowerLeg, 1, 0.3);
      rigRotation("RightUpperLeg", riggedPose.RightUpperLeg, 1, 0.3);
      rigRotation("RightLowerLeg", riggedPose.RightLowerLeg, 1, 0.3);
    }

    // Animate Hands
    if (leftHandLandmarks) {
      riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
      rigRotation("LeftHand", {
        // Combine pose rotation Z and hand rotation X Y
        z: riggedPose.LeftHand.z,
        y: riggedLeftHand.LeftWrist.y,
        x: riggedLeftHand.LeftWrist.x,
      });
      rigRotation("LeftRingProximal", riggedLeftHand.LeftRingProximal);
      rigRotation("LeftRingIntermediate", riggedLeftHand.LeftRingIntermediate);
      rigRotation("LeftRingDistal", riggedLeftHand.LeftRingDistal);
      rigRotation("LeftIndexProximal", riggedLeftHand.LeftIndexProximal);
      rigRotation(
        "LeftIndexIntermediate",
        riggedLeftHand.LeftIndexIntermediate
      );
      rigRotation("LeftIndexDistal", riggedLeftHand.LeftIndexDistal);
      rigRotation("LeftMiddleProximal", riggedLeftHand.LeftMiddleProximal);
      rigRotation(
        "LeftMiddleIntermediate",
        riggedLeftHand.LeftMiddleIntermediate
      );
      rigRotation("LeftMiddleDistal", riggedLeftHand.LeftMiddleDistal);
      rigRotation("LeftThumbProximal", riggedLeftHand.LeftThumbProximal);
      rigRotation(
        "LeftThumbIntermediate",
        riggedLeftHand.LeftThumbIntermediate
      );
      rigRotation("LeftThumbDistal", riggedLeftHand.LeftThumbDistal);
      rigRotation("LeftLittleProximal", riggedLeftHand.LeftLittleProximal);
      rigRotation(
        "LeftLittleIntermediate",
        riggedLeftHand.LeftLittleIntermediate
      );
      rigRotation("LeftLittleDistal", riggedLeftHand.LeftLittleDistal);
    }
    if (rightHandLandmarks) {
      riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
      rigRotation("RightHand", {
        // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
        z: riggedPose.RightHand.z,
        y: riggedRightHand.RightWrist.y,
        x: riggedRightHand.RightWrist.x,
      });
      rigRotation("RightRingProximal", riggedRightHand.RightRingProximal);
      rigRotation(
        "RightRingIntermediate",
        riggedRightHand.RightRingIntermediate
      );
      rigRotation("RightRingDistal", riggedRightHand.RightRingDistal);
      rigRotation("RightIndexProximal", riggedRightHand.RightIndexProximal);
      rigRotation(
        "RightIndexIntermediate",
        riggedRightHand.RightIndexIntermediate
      );
      rigRotation("RightIndexDistal", riggedRightHand.RightIndexDistal);
      rigRotation("RightMiddleProximal", riggedRightHand.RightMiddleProximal);
      rigRotation(
        "RightMiddleIntermediate",
        riggedRightHand.RightMiddleIntermediate
      );
      rigRotation("RightMiddleDistal", riggedRightHand.RightMiddleDistal);
      rigRotation("RightThumbProximal", riggedRightHand.RightThumbProximal);
      rigRotation(
        "RightThumbIntermediate",
        riggedRightHand.RightThumbIntermediate
      );
      rigRotation("RightThumbDistal", riggedRightHand.RightThumbDistal);
      rigRotation("RightLittleProximal", riggedRightHand.RightLittleProximal);
      rigRotation(
        "RightLittleIntermediate",
        riggedRightHand.RightLittleIntermediate
      );
      rigRotation("RightLittleDistal", riggedRightHand.RightLittleDistal);
    }
  };

  return (
    <>
      {/* <Inputs onFileChange={handleFileChange} /> */}
      <Canvas camera={{ position: [0, 1, 1] }}>
        <directionalLight />
        <Suspense fallback={null}>
          <VRMS vrm={currentVrm} />
        </Suspense>
        <Controls />
        <gridHelper />
        <axesHelper />
      </Canvas>
    </>
  );
}
