import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { TweenMax } from "gsap";
import {
  PointLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  AnimationMixer,
  Clock,
} from "three";
import Positon from "./Position";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Asset } from "expo-asset";
import io from "socket.io-client";

export default function App() {
  const [cameras, setCameras] = useState(null);
  const [modelsA, setModelsA] = useState(null);
  const [walkA, setWalkA] = useState(true);
  const [modelsB, setModelsB] = useState(null);
  const [walkB, setWalkB] = useState(true);
  const socketRef = useRef();

  const send = (props) => {
    socketRef.current.emit("FromAPI", {
      x: props.x,
      y: props.y,
      z: props.z,
      w: props.w,
    });
  };

  useEffect(() => {
    // サーバーのアドレス
    const socket = io("https://vrm.syeha.com/");
    if (modelsB !== null)
      socket.on("FromAPI", (data) => {
        console.log(data)
        modelsB.position.set(data.x, 0, data.z);
        modelsB.rotation.y = data.y;
        walkB.paused = data.w;
        walkB.play();
      });
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
    socket.on("connect", () => {
      console.log("connected");
    });
    // models の位置情報をサーバーに送信
    socketRef.current = socket;
    return () => socket.disconnect();
  }, [socketRef]);

  // TweenMax.to(何が, 何秒で, { z軸に distance 分移動 })
  const move = (props) => {
    walkA.paused = false;
    walkA.play(); // 変数walkを再生
    TweenMax.to(modelsA.position, 0.1, {
      z: modelsA.position.z + props.y,
      x: modelsA.position.x + props.x,
    });
    TweenMax.to(cameras.position, 0.1, {
      z: cameras.position.z + props.y,
      x: cameras.position.x + props.x,
    });
    // y座標を反転させ radian に加算し前後左右にいい感じで向くようにする
    modelsA.rotation.y = Math.atan2(-props.y, props.x) + 1.5;
    send({
      x: modelsA.position.x,
      y: modelsA.rotation.y,
      z: modelsA.position.z,
      w: walkA.paused,
    });
  };
  // Position.jsから画面から指を離すことで発火する
  const end = () => {
    walkA.paused = true;
    send({
      x: modelsA.position.x,
      y: modelsA.rotation.y,
      z: modelsA.position.z,
      w: walkA.paused,
    });
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <GLView
          style={{ flex: 1 }}
          onContextCreate={async (gl) => {
            // 3D空間の準備
            const { drawingBufferWidth: width, drawingBufferHeight: height } =
              gl;
            const renderer = new Renderer({ gl }); // レンダラーの準備
            renderer.setSize(width, height); // 3D空間の幅と高さ
            renderer.setClearColor("white"); // 3D空間の配色
            const scene = new Scene(); // これが3D空間
            scene.add(new GridHelper(100, 100)); //グリッドを表示

            // GLTFをロードする
            const loader = new GLTFLoader();
            // 自分のキャラクターを設置
            const assetA = Asset.fromModule(require("./assets/testA.glb"));
            await assetA.downloadAsync();
            let mixerA;
            let clockA = new Clock();
            loader.load(
              assetA.uri || "",
              (gltf) => {
                const modelA = gltf.scene;
                modelA.position.set(0, 0, 0); // 配置される座標 (x,y,z)
                modelA.rotation.y = Math.PI;
                const animations = gltf.animations;
                //Animation Mixerインスタンスを生成
                mixerA = new AnimationMixer(modelA);
                // 設定した一つ目のアニメーションを設定
                let animation = animations[0];
                // アニメーションを変数walkにセット
                setWalkA(mixerA.clipAction(animation));
                // test.glbを3D空間に追加
                scene.add(modelA);
                setModelsA(modelA);
              },
              (xhr) => {
                console.log("ロード中");
              },
              (error) => {
                console.error("読み込めませんでした");
              }
            );
            // 相手のキャラクターを設置
            let mixerB;
            let clockB = new Clock();
            const assetB = Asset.fromModule(require("./assets/testB.glb"));
            await assetB.downloadAsync();
            loader.load(
              assetB.uri || "",
              (gltf) => {
                const modelB = gltf.scene;
                modelB.position.set(0, 0, 0); // 配置される座標 (x,y,z)
                modelB.rotation.y = Math.PI;
                const animations = gltf.animations;
                //Animation Mixerインスタンスを生成
                mixerB = new AnimationMixer(modelB);
                // 設定した一つ目のアニメーションを設定
                let animation = animations[0];
                // アニメーションを変数walkにセット
                setWalkB(mixerB.clipAction(animation));
                // test.glbを3D空間に追加;
                scene.add(modelB);
                setModelsB(modelB);
              },
              (xhr) => {
                console.log("ロード中");
              },
              (error) => {
                console.error("読み込めませんでした");
              }
            );

            // 3D空間の光！
            const pointLight = new PointLight(0xffffff, 2, 1000, 1); //一点からあらゆる方向への光源(色, 光の強さ, 距離, 光の減衰率)
            pointLight.position.set(0, 200, 200); //配置される座標 (x,y,z)
            scene.add(pointLight); //3D空間に追加
            // カメラが映し出す設定(視野角, アスペクト比, near, far)
            const camera = new PerspectiveCamera(45, width / height, 1, 1000);
            setCameras(camera);
            // カメラの初期座標
            let cameraInitialPositionX = 0;
            let cameraInitialPositionY = 2;
            let cameraInitialPositionZ = 7;
            // カメラの座標
            camera.position.set(
              cameraInitialPositionX,
              cameraInitialPositionY,
              cameraInitialPositionZ
            );

            const render = () => {
              requestAnimationFrame(render); // アニメーション　moveUd関数、moveLr関数でカメラ座標が移動
              renderer.render(scene, camera); // レンダリング
              //Animation Mixerを自分と相手ともに実行
              if (mixerA) {
                mixerA.update(clockA.getDelta());
              }
              if (mixerB) {
                mixerB.update(clockB.getDelta());
              }
              gl.endFrameEXP(); // 現在のフレームを表示する準備ができていることをコンテキストに通知するpresent (Expo公式)
            };
            render();
          }}
        />
      </View>
      <View style={{ flexDirection: "row", alignSelf: "center" }}>
        <Positon
          onMove={(data) => {
            move({
              x: (data.x - 60) / 1000,
              y: (data.y - 60) / 1000,
            });
          }}
          onEnd={end}
        />
      </View>
    </>
  );
}
