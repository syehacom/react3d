import React, { useState, useEffect, Suspense } from "react";
import { View } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { TweenMax } from "gsap";
import {
  PointLight,
  GridHelper,
  Mesh,
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  MeshLambertMaterial,
  AnimationMixer,
  Clock,
  LoopOnce,
} from "three";
import Positon from "./Position";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Asset } from "expo-asset";
import { VRM } from "@pixiv/three-vrm";
import { decode, encode } from "base-64";

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

export default function App() {
  const [cameras, setCameras] = useState(null);
  const [cubes, setCubes] = useState([]);
  const [models, setModels] = useState([]);

  // TweenMax.to(何が, 何秒で, { z軸に distance 分移動 })
  const move = (distance) => {
    TweenMax.to(models.position, 0.1, {
      z: models.position.z + distance.y,
      x: models.position.x + distance.x,
    });

    models.rotation.y = Math.atan2(distance.y, distance.x);
    console.log(Math.atan2(distance.y, distance.x));
    TweenMax.to(cameras.position, 0.1, {
      z: cameras.position.z + distance.y,
      x: cameras.position.x + distance.x,
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

            // 配置するオブジェクト
            // const geometry1 = new BoxGeometry(1, 1, 1); // 四角い物体
            // const material1 = new MeshLambertMaterial({ color: "blue" }); // 物体に光を反射させ色や影を表現する
            // cube1 = new Mesh(geometry1, material1); // geometryとmaterialでオブジェクト完成
            // cube1.position.set(0, 2, 0); // 配置される座標 (x,y,z)
            // const geometry2 = new BoxGeometry(0.5, 1, 0.5); // 四角い物体
            // const material2 = new MeshLambertMaterial({ color: "red" }); // 物体に光を反射させ色や影を表現する
            // cube2 = new Mesh(geometry2, material2); // geometryとmaterialでオブジェクト完成
            // cube2.position.set(-0.5, 1, 0); // 配置される座標 (x,y,z)
            // const geometry3 = new BoxGeometry(0.5, 1, 0.5); // 四角い物体
            // const material3 = new MeshLambertMaterial({ color: "red" }); // 物体に光を反射させ色や影を表現する
            // cube3 = new Mesh(geometry3, material3); // geometryとmaterialでオブジェクト完成
            // cube3.position.set(0.5, 1, 0); // 配置される座標 (x,y,z)
            // scene.add(cube1, cube2, cube3); // 3D空間に追加
            // setCubes([cube1, cube2, cube3]);

            // GLTFをロードする
            const loader = new GLTFLoader();
            const asset = Asset.fromModule(require("./assets/test.gltf"));
            await asset.downloadAsync();
            // loader.load(asset.uri || "", (gltf) =>
            //   VRM.from(gltf)
            //     .then((vrm) => {
            //       const model = vrm.scene;
            //       model.position.set(0, 2, 0); // 配置される座標 (x,y,z)
            //       scene.add(model);
            //       setModels(model);
            //     })
            //     .then((xhr) => {
            //       console.log((xhr.loaded / xhr.total) * 100 + "% ロード中");
            //     })
            //     .then((error) => {
            //       console.log("読み込めませんでした", error);
            //     })
            // );
            let mixer;
            let clock = new THREE.Clock();
            loader.load(
              asset.uri || "",
              (gltf) => {
                const model = gltf.scene;
                model.position.set(0, 0, 0); // 配置される座標 (x,y,z)
                model.rotation.y = Math.PI;
                const animations = gltf.animations;
                if (animations && animations.length) {
                  //Animation Mixerインスタンスを生成
                  mixer = new AnimationMixer(model);
                  //全てのAnimation Clipに対して
                  for (let i = 0; i < animations.length; i++) {
                    let animation = animations[i];
                    //Animation Actionを生成
                    let action = mixer.clipAction(animation);
                    // ループ設定（1回のみ）
                    action.setLoop(LoopOnce);
                    // アニメーションの最後のフレームでアニメーションが終了
                    action.clampWhenFinished = false;
                    //アニメーションを再生
                    action.play();
                  }
                }
                scene.add(model);
                setModels(model);
              },
              (xhr) => {
                console.log(`${(xhr.loaded / xhr.total) * 100}% ロード中`);
              },
              (error) => {
                console.error("読み込めませんでした", error);
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
        />
      </View>
    </>
  );
}
