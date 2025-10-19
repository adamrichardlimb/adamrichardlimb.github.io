import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { items } from '../model/ring/itemRing.js';
import scene, { camera, renderer, cssRenderer } from './sceneContext.js';
import HeadController from '../controller/headController.js';

// Initialise controller with placeholder head
const headController = new HeadController(new THREE.Object3D(), camera, renderer, items);
scene.add(headController.myHead);

// Lighting
scene.add(new THREE.AmbientLight(0xC0C0C0));

// === Load model ===
const loader = new GLTFLoader();
const headBox = new THREE.Box3();
const headSize = new THREE.Vector3();

loader.load(
  './assets/head.glb',
  (gltf) => {
    headController.myHead = gltf.scene;
    scene.add(headController.myHead);

    headBox.setFromObject(headController.myHead);
    headBox.getSize(headSize);

    const labelRadius = Math.max(headSize.x, headSize.z) * 0.04;
    for (const item of items)
      item.object.scale.set(labelRadius, labelRadius, labelRadius);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// === Add labels ===
for (const item of items) scene.add(item.object);

// === Animate ===
let lastT = performance.now();
const headPos = new THREE.Vector3();

function animate(now = performance.now()) {
  const dt = (now - lastT) / 1000;
  lastT = now;

  if (!headController.myHead) return;

  headController.update(dt);

  // Label follow
  headController.myHead.getWorldPosition(headPos);
  for (const item of items)
    item.object.position.copy(headPos).add(new THREE.Vector3(0, headSize.y * 0.125, 0));

  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

export default scene;
export { headController };

