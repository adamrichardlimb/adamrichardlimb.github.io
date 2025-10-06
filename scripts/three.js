import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mobileCheck from './mobileCheck.js';
import labelObject from './items.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

let myHead = new THREE.Object3D();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

let onMobile = mobileCheck();
camera.position.set(0, 0, onMobile ? 2 : 1);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';

// Lights
scene.add(new THREE.AmbientLight(0xC0C0C0));

// Mouse/touch state
let mouseX = 0, mouseY = 0;
let startX = 0, startY = 0;
let startYaw = 0, startPitch = 0;
let dragging = false;

const maxYaw = THREE.MathUtils.degToRad(20);
const maxPitch = THREE.MathUtils.degToRad(20);
const lerpAlpha = 0.15;

// CSS3D renderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(cssRenderer.domElement);

scene.add(labelObject); // add to scene, not as a child of the head

// Load model
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

    // half of the largest dimension
    labelRadius = Math.max(headSize.x, headSize.z) * 0.04;
    labelObject.scale.set(labelRadius, labelRadius, labelRadius);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// Pointer helpers
const el = renderer.domElement;
function getNormXY(clientX, clientY) {
  const rect = el.getBoundingClientRect();
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  return { nx: nx * 2 - 1, ny: ny * 2 - 1 };
}

// Mouse/drag controls
addEventListener('mousemove', (e) => {
  if (dragging) return;
  const { nx, ny } = getNormXY(e.clientX, e.clientY);
  mouseX = THREE.MathUtils.clamp(nx, -1, 1);
  mouseY = THREE.MathUtils.clamp(ny, -1, 1);
});
el.addEventListener('pointerdown', (e) => {
  dragging = true;
  const { nx, ny } = getNormXY(e.clientX, e.clientY);
  startX = nx;
  startY = ny;
  startYaw = mouseX;
  startPitch = mouseY;
});
el.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const { nx, ny } = getNormXY(e.clientX, e.clientY);
  const dx = nx - startX;
  const dy = ny - startY;
  mouseX = THREE.MathUtils.clamp(startYaw + dx, -1, 1);
  mouseY = THREE.MathUtils.clamp(startPitch + dy, -1, 1);
});
el.addEventListener('pointerup', () => (dragging = false));
el.addEventListener('pointercancel', () => (dragging = false));

// Resize
addEventListener('resize', () => {
  onMobile = mobileCheck();
  camera.position.set(0, 0, onMobile ? 2 : 1);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  cssRenderer.setSize(innerWidth, innerHeight);
  renderer.setSize(innerWidth, innerHeight);
});

// Animate
let lastT = performance.now();
const headPos = new THREE.Vector3();
function animate(now = performance.now()) {
  const dt = (now - lastT) / 1000;
  lastT = now;

  const desiredYaw = mouseX * maxYaw;
  const desiredPitch = mouseY * maxPitch;

  myHead.rotation.y = THREE.MathUtils.lerp(myHead.rotation.y, desiredYaw, lerpAlpha);
  myHead.rotation.x = THREE.MathUtils.lerp(myHead.rotation.x, desiredPitch, lerpAlpha);
  myHead.rotation.x = THREE.MathUtils.clamp(myHead.rotation.x, -maxPitch, maxPitch);

  // Follow head position, ignore rotation
  myHead.getWorldPosition(headPos);
  labelObject.position.copy(headPos).add(new THREE.Vector3(0, headSize.y * 0.125, 0));

  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Style
const style = document.createElement('style');
style.textContent = `
#circlePath {
  font-family: Helvetica, sans-serif;
  font-size: 16px;
  color: white;
}
.label a {
  color: white;
  margin: 0 0.5rem;
  text-decoration: none;
}
.label a:hover {
  text-decoration: underline;
}
`;
document.head.appendChild(style);

