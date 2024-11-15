import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ARModelPlacement = () => {
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const controllerRef = useRef(null);
  const reticleRef = useRef(null);
  const [furnitureModel, setFurnitureModel] = useState(null);

  const updateReticle = useCallback(() => {
    const controller = controllerRef.current;
    const reticle = reticleRef.current;
    const scene = sceneRef.current;

    if (!controller || !reticle || !scene) return;

    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Detect surfaces
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      reticle.position.copy(intersects[0].point);
      reticle.visible = true;
    } else {
      reticle.visible = false;
    }
  }, []);

  const onControllerSelect = useCallback(() => {
    const scene = sceneRef.current;
    const reticle = reticleRef.current;

    if (reticle.visible && furnitureModel) {
      const modelClone = furnitureModel.clone();
      modelClone.position.copy(reticle.position);
      scene.add(modelClone); // Place the model at the reticle position
    }
  }, [furnitureModel]);

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

    // Load the furniture model
    const loader = new GLTFLoader();
    loader.load('/models/armchair.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.1, 0.1, 0.1); // Scale the model
      setFurnitureModel(model);
    });

    // Create the reticle
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.15, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    reticle.rotation.x = -Math.PI / 2; // Align with the floor
    reticle.visible = false; // Initially hidden
    scene.add(reticle);
    reticleRef.current = reticle;

    // AR controller setup
    const controller = renderer.xr.getController(0);
    scene.add(controller);
    controllerRef.current = controller;

    // Handle window resize
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    renderer.setAnimationLoop(() => {
      updateReticle(); // Ensure reticle updates in the render loop
      renderer.render(scene, camera);
    });
  }, [updateReticle]);

  useEffect(() => {
    initializeScene();

    // Add event listener for controller interaction
    const controller = controllerRef.current;
    if (controller) {
      controller.addEventListener('selectstart', onControllerSelect);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        document.body.removeChild(rendererRef.current.domElement);
      }
    };
  }, [initializeScene, onControllerSelect]);

  return null; // No UI elements needed for this minimal example
};

export default ARModelPlacement;
