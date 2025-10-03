import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mobileCheck from './mobileCheck.js';
import labelObject from './items.js';

import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

// Zoom camera out for mobile users
let onMobile = mobileCheck();
camera.position.set(0, 0, onMobile ? 2 : 1);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';

// lights
scene.add(new THREE.AmbientLight(0xC0C0C0));

// Rig: yaw(Y) → pitch(X) → align(fixed correction)
const yawRig = new THREE.Group();
const pitchRig = new THREE.Group();
const alignRig = new THREE.Group();


// Put model inside a container, pivot at (0,0,0)
const modelPivot = new THREE.Group();

yawRig.add(pitchRig);
pitchRig.add(alignRig);
scene.add(yawRig);

yawRig.rotation.order = 'YXZ';
pitchRig.rotation.order = 'YXZ';

// mouse/touch state
let mouseX = 0, mouseY = 0;
let startX = 0, startY = 0;
let startYaw = 0, startPitch = 0;
let dragging = false;

const maxYaw = THREE.MathUtils.degToRad(45);
const maxPitch = THREE.MathUtils.degToRad(45);
const lerpAlpha = 0.15;

// load model, centre, orient
const loader = new GLTFLoader();
loader.load(
  './assets/head.glb',
  (gltf) => {
    const model = gltf.scene;

    // Compute bounding box centre
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Shift model so its centre is at (0,0,0)
    model.position.sub(center);
    modelPivot.add(model);

    alignRig.rotation.y = -Math.PI / 2; // correction
    alignRig.add(modelPivot);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// pointer helpers
const el = renderer.domElement;
function getNormXY(clientX, clientY) {
  const rect = el.getBoundingClientRect();
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  return { nx: nx * 2 - 1, ny: ny * 2 - 1 };
}

// mouse/drag controls
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
el.addEventListener('pointerup', () => {
  dragging = false;
});
el.addEventListener('pointercancel', () => {
  dragging = false;
});

// resize
addEventListener('resize', () => {
  onMobile = mobileCheck();
  camera.position.set(0, 0, onMobile ? 2 : 1);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Create the CSS2D renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
document.body.appendChild(labelRenderer.domElement);

// add labelObject to the scene, positioned relative to head
scene.add(labelObject);

// animate
let lastT = performance.now();
function animate(now = performance.now()) {
  const dt = (now - lastT) / 1000;
  lastT = now;

  const desiredYaw = mouseX * maxYaw;
  const desiredPitch = mouseY * maxPitch;
  yawRig.rotation.y = THREE.MathUtils.lerp(yawRig.rotation.y, desiredYaw, lerpAlpha);
  pitchRig.rotation.x = THREE.MathUtils.lerp(pitchRig.rotation.x, desiredPitch, lerpAlpha);
  pitchRig.rotation.x = THREE.MathUtils.clamp(pitchRig.rotation.x, -maxPitch, maxPitch);
  yawRig.rotation.z = 0;
  pitchRig.rotation.z = 0;

  const offset = new THREE.Vector3(0, 0.5, 0); // offset in world space
  const newPos = new THREE.Vector3();

  modelPivot.position.set(0.5, 0, 0);

  modelPivot.getWorldPosition(newPos);
  labelObject.position.copy(newPos).add(offset);

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

}
renderer.setAnimationLoop(animate);

const style = document.createElement('style')
style.textContent = `
.label {
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
`
document.head.appendChild(style)
