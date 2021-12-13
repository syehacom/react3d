import React, { useState } from "react";
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
import { decode, encode } from "base-64";

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

export default function App() {
  const [cameras, setCameras] = useState(null);
  const [models, setModels] = useState(null);
  const [walk, setWalk] = useState(true);

  // TweenMax.to(何が, 何秒で, { z軸に distance 分移動 })
  const move = (props) => {
    walk.paused = false;
    walk.play(); // 変数walkを再生
    TweenMax.to(models.position, 0.1, {
      z: models.position.z + props.y,
      x: models.position.x + props.x,
    });
    TweenMax.to(cameras.position, 0.1, {
      z: cameras.position.z + props.y,
      x: cameras.position.x + props.x,
    });
    // y座標を反転させ radian に加算し前後左右にいい感じで向くようにする
    models.rotation.y = Math.atan2(-props.y, props.x) + 1.5;
  };
  // Position.jsから画面から指を離すことで発火する
  const end = () => {
    walk.paused = true;
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
            const asset = Asset.fromModule(require("./assets/test.glb"));
            await asset.downloadAsync();

            let mixer;
            let clock = new Clock();
            loader.load(
              asset.uri || "",
              (gltf) => {
                const model = gltf.scene;
                model.position.set(0, 0, 0); // 配置される座標 (x,y,z)
                model.rotation.y = Math.PI;
                const animations = gltf.animations;
                //Animation Mixerインスタンスを生成
                mixer = new AnimationMixer(model);
                // 設定した一つ目のアニメーションを設定
                let animation = animations[0];
                // アニメーションを変数walkにセット
                setWalk(mixer.clipAction(animation));
                // test.glbを3D空間に追加
                scene.add(model);
                setModels(model);
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
              //Animation Mixerを実行
              if (mixer) {
                mixer.update(clock.getDelta());
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
