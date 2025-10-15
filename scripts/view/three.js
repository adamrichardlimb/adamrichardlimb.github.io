import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mobileCheck from '../mobileCheck.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { items } from '../model/ring/itemRing.js';
import scene from './sceneContext.js';

let myHead = new THREE.Object3D();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

let onMobile = mobileCheck();
camera.position.set(0, 0, onMobile ? 2 : 1);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';

// Lighting
scene.add(new THREE.AmbientLight(0xC0C0C0));

// Head movement smoothing
const lerpAlpha = 0.15;

// CSS3D renderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
Object.assign(cssRenderer.domElement.style, {
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: '10',
  pointerEvents: 'none',
});
document.body.appendChild(cssRenderer.domElement);

// State for panel animation
let isPanelVisible = false;
let headTarget = new THREE.Vector3(0, 0, 0);
let headCurrent = new THREE.Vector3(0, 0, 0);
let currentDetails = null;
let panelElement = null;

// === Show/hide helpers ===
function showPanel() {
  isPanelVisible = true;
  if (onMobile) headTarget.set(0, 0.8, 0);
  else headTarget.set(-0.8, 0, 0);
  if (panelElement) setTimeout(() => {
    panelElement.style.opacity = '1';
    panelElement.style.display = 'block';
    panelElement.style.pointerEvents = 'auto';
  }, 400);
}

function hidePanel() {
  isPanelVisible = false;
  if (panelElement) {
    panelElement.style.opacity = '0';
    setTimeout(() => {
      panelElement.style.display = 'none';
      panelElement.style.pointerEvents = 'none';
    }, 600);
  }
  headTarget.set(0, 0, 0);
}
// === Load model ===
const loader = new GLTFLoader();
let headBox = new THREE.Box3();
let headSize = new THREE.Vector3();
let labelRadius = 0;

loader.load(
  './assets/head.glb',
  (gltf) => {
    myHead = gltf.scene;
    scene.add(myHead);

    headBox.setFromObject(myHead);
    headBox.getSize(headSize);

    for (const item of items) {
      labelRadius = Math.max(headSize.x, headSize.z) * 0.04;
      item.object.scale.set(labelRadius, labelRadius, labelRadius);
    }
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// === Create labels ===
for (const item of items) scene.add(item.object);

// === Pointer/touch controls ===
let mouseX = 0, mouseY = 0;
let pointer = new THREE.Vector2(0, 0);
let lastPointer = new THREE.Vector2(0, 0);
let isTouchDragging = false;

function updatePointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

// Desktop: hover
window.addEventListener('mousemove', (e) => {
  if (onMobile || isTouchDragging) return;
  updatePointer(e);
  mouseX = THREE.MathUtils.clamp(pointer.x, -1, 1);
  mouseY = THREE.MathUtils.clamp(pointer.y, -1, 1);
});

// Unified pointer/touch
renderer.domElement.addEventListener('pointerdown', (e) => {
  updatePointer(e);
  lastPointer.copy(pointer);
  isTouchDragging = true;
});

renderer.domElement.addEventListener('pointermove', (e) => {
  if (!isTouchDragging) return;
  updatePointer(e);

  // More sensitivity for mobile
  const scale = onMobile ? 3.0 : 1.0;
  const dx = (pointer.x - lastPointer.x);
  const dy = (pointer.y - lastPointer.y);

  mouseX = THREE.MathUtils.clamp(mouseX + dx, -1, 1);
  mouseY = THREE.MathUtils.clamp(mouseY + dy, -1, 1);

  lastPointer.copy(pointer);
});

['pointerup', 'pointercancel', 'pointerleave'].forEach(evt =>
  renderer.domElement.addEventListener(evt, () => (isTouchDragging = false))
);

// === Resize ===
addEventListener('resize', () => {
  onMobile = mobileCheck();
  camera.position.set(0, 0, onMobile ? 2 : 1);
  camera.aspect = innerWidth / innerHeight;
  cssRenderer.setSize(innerWidth, innerHeight);
  renderer.setSize(innerWidth, innerHeight);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
});

// === Animate ===
let lastT = performance.now();
const headPos = new THREE.Vector3();
const mouseWorld = new THREE.Vector3();
const headWorld = new THREE.Vector3();
function animate(now = performance.now()) {
  const dt = (now - lastT) / 1000;
  lastT = now;

  // Project pointer into 3D world space
  const depth = onMobile ? 1.5 : 0.5;
  mouseWorld.set(mouseX, -mouseY, depth).unproject(camera);

  // Get head world position
  myHead.getWorldPosition(headWorld);

  // Direction to look at
  const targetDir = mouseWorld.clone().sub(headWorld).normalize();

  // Convert to yaw/pitch
  const desiredYaw = Math.atan2(targetDir.x, targetDir.z);
  const desiredPitch = Math.asin(targetDir.y);

  // Interpolate, with wider vertical range for mobile
  const pitchClamp = onMobile ? Math.PI / 2 : THREE.MathUtils.degToRad(20);
  myHead.rotation.y = THREE.MathUtils.lerp(myHead.rotation.y, desiredYaw, lerpAlpha);
  myHead.rotation.x = THREE.MathUtils.lerp(
    myHead.rotation.x,
    THREE.MathUtils.clamp(desiredPitch, -pitchClamp, pitchClamp),
    lerpAlpha
  );

  // Slide head position for panel animation
  headCurrent.lerp(headTarget, 0.05);
  myHead.position.copy(headCurrent);

  // Label tracking
  myHead.getWorldPosition(headPos);
  for (const item of items) {
    item.object.position.copy(headPos).add(new THREE.Vector3(0, headSize.y * 0.125, 0));
  }

  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// === Style ===
const style = document.createElement('style');
style.textContent = `
.details-container {
  border: 0.25em solid white;
  background: rgba(0, 0, 0, 0.7);
  padding: 1em;
  text-align: right;
  font-optical-sizing: auto;
  font-family: "JetBrains Mono", monospace;
  transition: opacity 0.4s ease;
  font-weight: 500;
  font-style: normal;
  font-variant-numeric: tabular-nums lining-nums;
  font-size: 16px;
  height: 7.5em;
}

a:hover {
  text-decoration: underline;
}

a {
  text-decoration: none;
  border: none;
  outline: none;
  color: white;
  display: block;
  margin: 0.25em 0;
  outline: none;
}
`;
document.head.appendChild(style);

export default scene;
