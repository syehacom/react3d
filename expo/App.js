import React, { useState } from "react";
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
} from "three";
import Stick from "./Stick";

export default function App() {
  const camera = new PerspectiveCamera(30, 1, 1, 100); // カメラが映し出す設定(視野角, アスペクト比, near, far)
  const [lr, setLr] = useState(0);
  const [ud, setUd] = useState(0);

  // カメラの初期座標
  let cameraInitialPositionX = 0;
  let cameraInitialPositionY = 2;
  let cameraInitialPositionZ = 7;

  // TweenMax.to(何が, 何秒で, { z軸に distance 分移動 })
  const moveUd = (distance) => {
    TweenMax.to(camera.position, 0.1, {
      z: camera.position.z + distance,
    });
  };

  //TweenMax.to(何が, 何秒で, { x軸に distance 分移動 })
  const moveLr = (distance) => {
    TweenMax.to(camera.position, 0.1, {
      x: camera.position.x + distance,
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
            const geometry = new BoxGeometry(2, 2, 2); // 四角い物体
            const material = new MeshLambertMaterial({ color: "blue" }); // 物体に光を反射させ色や影を表現する
            cube = new Mesh(geometry, material); // geometryとmaterialでオブジェクト完成
            cube.position.set(0, 0, 0); // 配置される座標 (x,y,z)
            scene.add(cube); // 3D空間に追加

            // 3D空間の光！
            const pointLight = new PointLight(0xffffff, 2, 1000, 1); //一点からあらゆる方向への光源(色, 光の強さ, 距離, 光の減衰率)
            pointLight.position.set(0, 200, 200); //配置される座標 (x,y,z)
            scene.add(pointLight); //3D空間に追加

            // カメラの座標　＝　一人称視点
            camera.position.set(
              cameraInitialPositionX,
              cameraInitialPositionY,
              cameraInitialPositionZ
            );

            const render = () => {
              requestAnimationFrame(render); // アニメーション　moveUd関数、moveLr関数でカメラ座標が移動
              renderer.render(scene, camera); // レンダリング
              gl.endFrameEXP(); // 現在のフレームを表示する準備ができていることをコンテキストに通知するpresent (Expo公式)
            };
            render();
          }}
        />
      </View>
      <View style={{ alignItems: "center" }}>
        <Stick
          onMove={(data) => {
           console.log(data)
          }}
        />
      </View>
    </>
  );
}
