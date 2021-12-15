import { PixelRatio, StyleSheet, View, Button, Alert } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { VRMLoader } from 'three/examples/jsm/loaders/VRMLoader.js';
import React, { useEffect ,Component ,useState} from "react";
import { VRM, VRMUtils, VRMSchema } from "@pixiv/three-vrm";
import {
  AmbientLight,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
  GridHelper,
  AxesHelper,
  TextureLoader,
  MeshBasicMaterial,
  Mesh
} from "three";
import { Asset } from "expo-asset";
import OrbitControlsView from "expo-three-orbit-controls";

let model
// let test = 0
let test = false; 
export default function App() {
  
  const [camera, setCamera] = React.useState(null);
  let timeout;
  React.useEffect(() => {
    return () => clearTimeout(timeout);
  });
  const onContextCreate= async (gl) => {//: ExpoWebGLRenderingContext

    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    const sceneColor = "#ffe4e1"
    renderer.setClearColor(sceneColor);
    renderer.gammaOutput = true;

    const camera = new PerspectiveCamera(120, width / height, 0.01, 1000);
    camera.position.z = 2;
    camera.position.y = 1.5;
    setCamera(camera)

    const asset = Asset.fromModule(
      require("./assets/animal.vrm")
    );
    await asset.downloadAsync();

    const scene = new Scene();
    
    const gridHelper = new GridHelper(10, 10);
    gridHelper.position.y = 0
    scene.add(gridHelper);

    const axesHelper = new AxesHelper(5);
    axesHelper.position.y = 0
    scene.add(axesHelper);

    const ambientLight = new AmbientLight(0x101010);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 2, 1000, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);

    const spotLight = new SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene.position);
    scene.add(spotLight);

    const loader = new GLTFLoader();
    loader.load(
      asset.url, // || "",
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        animate();
      },
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error("An error happened", error);
      }
    );
 
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const deltaTime = clock.getDelta();

      const s = Math.sin(clock.elapsedTime * Math.PI / 2);

      if (test) {

          model.children[0].children[0].children[1].children[3].rotation.x = Math.abs(s)*-1;

      }
      renderer.render(scene, camera);
      gl.endFrameEXP();

    }
    const render = () => {
      timeout = requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  }

  const click = () =>{
    if(test==true){
      test = false
      console.log(test)
    }
    else{
      test = true
      console.log(test)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.butt}>
        <Button onPress={() => click()} title='move' color='lightpink' style={{flex:1}} />
      </View> 
      <OrbitControlsView style={{ flex:1 }} camera={camera}>
          <GLView style={styles.gl} onContextCreate={onContextCreate} />
      </OrbitControlsView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  butt:{
    paddingLeft:40,
    paddingRight:40,
    paddingTop:50,
    // flex:0.1
  },
  mid:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-around',
  },
  one:{
    padding:30,
    flex:0.5
  },
  two:{
    padding:30,
    flex:0.5
  },
  gl:{
    flex:100
  }
  
})