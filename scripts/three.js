import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// lights
scene.add(new THREE.AmbientLight(0x505050));
const key = new THREE.DirectionalLight(0xffffff, 1);
key.position.set(1, 1, 1);
scene.add(key);

// A small “rig” to separate yaw (Y) and pitch (X)
const yawRig = new THREE.Group();
const pitchRig = new THREE.Group();
yawRig.add(pitchRig);
scene.add(yawRig);

// mouse → pitch/yaw
let mouseX = 0, mouseY = 0;
const maxYaw = THREE.MathUtils.degToRad(15);
const maxPitch = THREE.MathUtils.degToRad(30);
const lerpAlpha = 0.12;

// load model, centre it, orient it, scale to fit
const loader = new GLTFLoader();
loader.load(
  './assets/head.glb',
  (gltf) => {
    const model = gltf.scene;

    // 1) Centre geometry at origin so rotations are about the true centre
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3(), center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    model.position.sub(center); // translate so centre is at (0,0,0)

    // 2) If the head’s “forward” is +X (facing right), rotate -90° to face camera (-Z)
    const baseYaw = - Math.PI / 2;
    yawRig.rotation.y = baseYaw;

    // 3) Uniformly scale to fit ~60% of viewport height at current camera distance
    const camDist = camera.position.z; // object at z≈0
    const visibleH = 2 * camDist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const targetH = visibleH * 0.6;
    const scale = (size.y > 0) ? targetH / size.y : 1.0;
    //model.scale.setScalar(scale);

    // 4) Add to pitch rig (so pitch doesn’t affect yaw baseline)
    pitchRig.add(model);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// mouse handlers
addEventListener('mousemove', (e) => {
  const nx = (e.clientX / innerWidth) * 2 - 1;
  const ny = (e.clientY / innerHeight) * 2 - 1;
  mouseX = THREE.MathUtils.clamp(nx, -1, 1);
  mouseY = THREE.MathUtils.clamp(ny, -1, 1);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// animate
function animate() {
  // target angles
  const targetYaw = mouseX * maxYaw + yawRig.rotation.y; // apply delta around current baseline
  const baselineYaw = yawRig.rotation.y - THREE.MathUtils.clamp(yawRig.rotation.y, -Math.PI, Math.PI); // keep reference
  const desiredYaw = baselineYaw - mouseY * maxYaw;

  // smooth yaw & pitch (invert Y for natural feel)
  yawRig.rotation.z = THREE.MathUtils.lerp(yawRig.rotation.z, desiredYaw, lerpAlpha);
  pitchRig.rotation.y = THREE.MathUtils.lerp(pitchRig.rotation.y, mouseX * maxPitch, lerpAlpha);

  // clamp pitch
  pitchRig.rotation.x = THREE.MathUtils.clamp(pitchRig.rotation.x, -maxPitch, maxPitch);

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

