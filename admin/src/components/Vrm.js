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
import {
  Holistic,
  FACEMESH_TESSELATION,
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
} from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import Vector from "../kalidokit/utils/vector.js";
import socketIOClient from "socket.io-client";

export default function Vrm() {
  //socket.io
  const ENDPOINT = "https://react3d.azurewebsites.net";
  // const ENDPOINT = process.env.REACT_APP_SERVER;
  // const ENDPOINT = "http://localhost:3001";
  const options = {
    transports: ["websocket", "polling"],
  };
  const socket = socketIOClient(ENDPOINT, options);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const lerp = Vector.lerp;
  const clamp = (val, min, max) => {
    return Math.max(Math.min(val, max), min);
  };

  // VRM
  useEffect(() => {
    loadVRM("/animal.vrm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Inputs = ({ onFileChange }) => (
    <label
      style={{
        zIndex: "1",
        border: "1px solid #ccc",
        top: "10px",
        height: "25px",
        width: "110px",
        position: "absolute",
        marginTop: "50px",
      }}
    >
      <input type="file" accept=".vrm" onChange={onFileChange} />
    </label>
  );

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
  const handleFileChange = useCallback(
    async (event) => {
      const url = URL.createObjectURL(event.target.files[0]);
      await loadVRM(url);
      URL.revokeObjectURL(url);
    },
    [loadVRM]
  );

  extend({ OrbitControls });

  const Controls = () => {
    const controls = useRef(null);
    const { camera, gl } = useThree();
    useFrame(() => controls.current.update());
    return (
      <orbitControls
        ref={controls}
        args={[camera, gl.domElement]}
        zoomSpeed={0.5}
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
  const animateVRM = (vrm, results) => {
    if (!vrm) {
      return;
    }
    if (results.faceLandmarks) {
      results.faceLandmarksZ = {
        //head
        21: results.faceLandmarks[21],
        251: results.faceLandmarks[251],
        397: results.faceLandmarks[397],
        172: results.faceLandmarks[172],
        //mouth
        133: results.faceLandmarks[133],
        362: results.faceLandmarks[362],
        130: results.faceLandmarks[130],
        263: results.faceLandmarks[263],
        13: results.faceLandmarks[13],
        14: results.faceLandmarks[14],
        61: results.faceLandmarks[61],
        291: results.faceLandmarks[291],
        // eye
        160: results.faceLandmarks[160],
        159: results.faceLandmarks[159],
        158: results.faceLandmarks[158],
        144: results.faceLandmarks[144],
        145: results.faceLandmarks[145],
        153: results.faceLandmarks[153],
        387: results.faceLandmarks[387],
        386: results.faceLandmarks[386],
        385: results.faceLandmarks[385],
        373: results.faceLandmarks[373],
        374: results.faceLandmarks[374],
        380: results.faceLandmarks[380],
        //brow
        35: results.faceLandmarks[35],
        244: results.faceLandmarks[244],
        63: results.faceLandmarks[63],
        105: results.faceLandmarks[105],
        66: results.faceLandmarks[66],
        229: results.faceLandmarks[229],
        230: results.faceLandmarks[230],
        231: results.faceLandmarks[231],
        265: results.faceLandmarks[265],
        464: results.faceLandmarks[464],
        293: results.faceLandmarks[293],
        334: results.faceLandmarks[334],
        296: results.faceLandmarks[296],
        449: results.faceLandmarks[449],
        450: results.faceLandmarks[450],
        451: results.faceLandmarks[451],
        //pupil
        468: results.faceLandmarks[468],
        469: results.faceLandmarks[469],
        470: results.faceLandmarks[470],
        471: results.faceLandmarks[471],
        472: results.faceLandmarks[472],
        473: results.faceLandmarks[473],
        474: results.faceLandmarks[474],
        475: results.faceLandmarks[475],
        476: results.faceLandmarks[476],
        477: results.faceLandmarks[477],
      };
    }
    if (results.ea) {
      delete results.ea[0];
      delete results.ea[1];
      delete results.ea[2];
      delete results.ea[3];
      delete results.ea[4];
      delete results.ea[5];
      delete results.ea[6];
      delete results.ea[7];
      delete results.ea[8];
      delete results.ea[9];
      delete results.ea[10];
      delete results.ea[21];
      delete results.ea[22];
      delete results.ea[29];
      delete results.ea[30];
      delete results.ea[31];
      delete results.ea[32];
      delete results.ea[33];
    }
    if (results.poseLandmarks) {
      delete results.poseLandmarks[0];
      delete results.poseLandmarks[1];
      delete results.poseLandmarks[2];
      delete results.poseLandmarks[3];
      delete results.poseLandmarks[4];
      delete results.poseLandmarks[5];
      delete results.poseLandmarks[6];
      delete results.poseLandmarks[7];
      delete results.poseLandmarks[8];
      delete results.poseLandmarks[9];
      delete results.poseLandmarks[10];
      delete results.poseLandmarks[13];
      delete results.poseLandmarks[14];
      delete results.poseLandmarks[17];
      delete results.poseLandmarks[18];
      delete results.poseLandmarks[19];
      delete results.poseLandmarks[20];
      delete results.poseLandmarks[21];
      delete results.poseLandmarks[22];
      delete results.poseLandmarks[25];
      delete results.poseLandmarks[26];
      delete results.poseLandmarks[27];
      delete results.poseLandmarks[28];
      delete results.poseLandmarks[29];
      delete results.poseLandmarks[30];
      delete results.poseLandmarks[31];
      delete results.poseLandmarks[32];
      delete results.poseLandmarks[33];
    }
    delete results.faceLandmarks;
    delete results.image;
    delete results.multiFaceGeometry;

    if (socket !== undefined) {
      console.log(results);
      socket.emit("FromAPI", results);
    }
    // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
    let riggedPose, riggedLeftHand, riggedRightHand;
    // const faceLandmarks = results.faceLandmarks
    const faceLandmarks = results.faceLandmarksZ;
    // Pose 3D Landmarks are with respect to Hip distance in meters
    const pose3DLandmarks = results.ea;
    // Pose 2D landmarks are with respect to videoWidth and videoHeight
    const pose2DLandmarks = results.poseLandmarks;
    // Be careful, hand landmarks may be reversed
    const leftHandLandmarks = results.rightHandLandmarks;
    const rightHandLandmarks = results.leftHandLandmarks;

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
  // Use `Mediapipe` utils to get camera - lower resolution = higher fps
  // Pass holistic a callback function
  const onResults = useCallback(
    (results) => {
      // Draw landmark guides
      drawResults(results);
      // Animate model
      animateVRM(currentVrm, results);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentVrm]
  );

  useEffect(() => {
    if (currentVrm) {
      const holistic = new Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
        },
      });
      holistic.setOptions({
        modelComplexity: 0,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        refineFaceLandmarks: true,
      });

      holistic.onResults(onResults);

      if (webcamRef.current) {
        const camera = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            await holistic.send({ image: webcamRef.current.video });
          },
          width: 300,
          height: 300,
        });
        camera.start();
      }
      return () => {
        holistic.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResults]);

  const drawResults = (results) => {
    const ctx = canvasRef.current.getContext("2d");
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    // Use `Mediapipe` drawing functions
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00cff7",
      lineWidth: 4,
    });
    drawLandmarks(ctx, results.poseLandmarks, {
      color: "#ff0364",
      lineWidth: 2,
    });
    drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, {
      color: "#C0C0C070",
      lineWidth: 1,
    });
    if (results.faceLandmarks && results.faceLandmarks.length === 478) {
      //draw pupils
      drawLandmarks(
        ctx,
        [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
        {
          color: "#ffe603",
          lineWidth: 2,
        }
      );
    }
    drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, {
      color: "#eb1064",
      lineWidth: 5,
    });
    drawLandmarks(ctx, results.leftHandLandmarks, {
      color: "#00cff7",
      lineWidth: 2,
    });
    drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, {
      color: "#22c3e3",
      lineWidth: 5,
    });
    drawLandmarks(ctx, results.rightHandLandmarks, {
      color: "#ff0364",
      lineWidth: 2,
    });
  };

  return (
    <>
      <Inputs onFileChange={handleFileChange} />
      <Webcam
        ref={webcamRef}
        style={{ visibility: "hidden" }}
        audio={false}
        width={0}
        height={0}
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
