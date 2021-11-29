import React from "react";
import { View, Pressable, Text } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { TweenMax } from "gsap";
import {
  AmbientLight,
  Fog,
  GridHelper,
  Mesh,
  PerspectiveCamera,
  Scene,
  PointLight,
  SpotLight,
  BoxGeometry,
  MeshLambertMaterial,
} from "three";

export default function App() {

  const sphere = new Mesh();
  const camera = new PerspectiveCamera(30, 1, 1, 100);

  let cameraInitialPositionX = 0;
  let cameraInitialPositionY = 2;
  let cameraInitialPositionZ = 5;

  function moveUd(distance) {
    TweenMax.to(sphere.position, 0.2, {
      z: sphere.position.z + distance,
    });
    TweenMax.to(camera.position, 0.2, {
      z: camera.position.z + distance,
    });
  }

  function moveLr(distance) {
    TweenMax.to(sphere.position, 0.2, {
      x: sphere.position.x + distance,
    });
    TweenMax.to(camera.position, 0.2, {
      x: camera.position.x + distance,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={async (gl) => {
          // GL Parameter disruption
          const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
          // Renderer declaration and set properties
          const renderer = new Renderer({ gl });
          renderer.setSize(width, height);
          renderer.setClearColor("#fff");
          // Scene declaration, add a fog, and a grid helper to see axes dimensions
          const scene = new Scene();
          scene.fog = new Fog("#3A96C4", 1, 10000);
          scene.add(new GridHelper(10, 10));
          const geometry = new BoxGeometry(2, 2, 2); // 立方体
          const material = new MeshLambertMaterial({ color: 0x00ddff }); // 影が表示される
          cube = new Mesh(geometry, material); // それらをまとめて3Dオブジェクトにします
          cube.position.set(0, 0, 0);
          scene.add(cube);
          // Add all necessary lights
          const ambientLight = new AmbientLight(0x101010);
          scene.add(ambientLight);
          const pointLight = new PointLight(0xffffff, 2, 1000, 1);
          pointLight.position.set(0, 200, 200);
          scene.add(pointLight);
          const spotLight = new SpotLight(0xffffff, 0.5);
          spotLight.position.set(0, 500, 100);
          spotLight.lookAt(scene.position);
          scene.add(spotLight);
          // Add sphere object instance to our scene
          scene.add(sphere);
          // Set camera position and look to sphere
          camera.position.set(
            cameraInitialPositionX,
            cameraInitialPositionY,
            cameraInitialPositionZ
          );

          camera.lookAt(sphere.position);

          // Render function
          const render = () => {
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            gl.endFrameEXP();
          };
          render();
        }}
      />
      <View>
        <Pressable onPress={() => moveUd(-0.2)}>
          <Text
            style={{
              fontSize: 36,
              color: "red",
            }}
          >
            Up
          </Text>
        </Pressable>
        <Pressable onPress={() => moveUd(0.2)}>
          <Text
            style={{
              fontSize: 36,
              color: "red",
            }}
          >
            Down
          </Text>
        </Pressable>
        <Pressable onPress={() => moveLr(-0.2)}>
          <Text
            style={{
              fontSize: 36,
              color: "red",
            }}
          >
            Left
          </Text>
        </Pressable>
        <Pressable onPress={() => moveLr(0.2)}>
          <Text
            style={{
              fontSize: 36,
              color: "red",
            }}
          >
            Right
          </Text>
        </Pressable>
      </View>
    </View>
  );
}