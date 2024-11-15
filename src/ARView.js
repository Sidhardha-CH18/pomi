// ARView.js
import React, { useEffect } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function ARView({ model }) {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const arButton = ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] });
    document.body.appendChild(arButton);

    const loader = new GLTFLoader();
    loader.load(model.glb, (gltf) => {
      const object = gltf.scene;
      object.scale.set(0.01, 0.01, 0.01); // Adjust scale if needed
      scene.add(object);
    });

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {
      document.body.removeChild(renderer.domElement);
      document.body.removeChild(arButton);
    };
  }, [model]);

  return <div />;
}

export default ARView;
