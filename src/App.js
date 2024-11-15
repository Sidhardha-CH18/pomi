import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { XREstimatedLight } from 'three/examples/jsm/webxr/XREstimatedLight';

const ARFurnitureApp = () => {
  const rendererRef = useRef(null);
  const sceneRef = useRef(null); // Use refs for scene
  const controllerRef = useRef(null);
  const [furnitureModel, setFurnitureModel] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const initializeScene = useCallback(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    document.body.appendChild(ARButton.createButton(renderer));

    const estimatedLight = new XREstimatedLight();
    scene.add(estimatedLight);

    const loader = new GLTFLoader();
    loader.load('/models/armchair.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.1, 0.1, 0.1);
      setFurnitureModel(model);
    });

    const controller = renderer.xr.getController(0);
    scene.add(controller);
    controllerRef.current = controller;

    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    renderer.setAnimationLoop(() => {
      if (selectedModel && controllerRef.current.userData.dragging) {
        const controllerPosition = new THREE.Vector3();
        controllerRef.current.getWorldPosition(controllerPosition);
        selectedModel.position.copy(controllerPosition);
      }
      renderer.render(scene, camera);
    });
  }, [selectedModel]);

  const onControllerEvents = useCallback(() => {
    const controller = controllerRef.current;
    const scene = sceneRef.current;

    if (!controller || !scene) return;

    const getIntersections = () => {
      const raycaster = new THREE.Raycaster();
      const tempMatrix = new THREE.Matrix4();
      controller.updateMatrixWorld();
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      return raycaster.intersectObjects(scene.children);
    };

    controller.addEventListener('selectstart', () => {
      const intersections = getIntersections();
      if (intersections.length > 0) {
        setSelectedModel(intersections[0].object);
        controller.userData.dragging = true;
      } else if (furnitureModel) {
        const modelClone = furnitureModel.clone();
        modelClone.position.set(0, 0, -1).applyMatrix4(controller.matrixWorld);
        scene.add(modelClone);
      }
    });

    controller.addEventListener('selectend', () => {
      controller.userData.dragging = false;
      setSelectedModel(null);
    });
  }, [furnitureModel]);

  const changeColor = () => {
    if (selectedModel) {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      selectedModel.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(`#${randomColor}`);
        }
      });
    }
  };

  const deleteModel = () => {
    const scene = sceneRef.current;
    if (selectedModel) {
      scene.remove(selectedModel);
      setSelectedModel(null);
    }
  };

  useEffect(() => {
    initializeScene();
    onControllerEvents();
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        document.body.removeChild(rendererRef.current.domElement);
      }
    };
  }, [initializeScene, onControllerEvents]);

  return (
    <div>
      <div
        id="controls"
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <button onClick={changeColor} style={{ margin: '5px' }}>
          Change Color
        </button>
        <button onClick={deleteModel} style={{ margin: '5px' }}>
          Delete Model
        </button>
      </div>
    </div>
  );
};

export default ARFurnitureApp;
