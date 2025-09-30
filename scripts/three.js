import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none'; // block browser gestures on mobile

// lights
scene.add(new THREE.AmbientLight(0x505050));
const key = new THREE.DirectionalLight(0xffffff, 1);
key.position.set(1, 1, 1);
scene.add(key);

// Rig: yaw(Y) → pitch(X) → align(fixed correction)
const yawRig = new THREE.Group();
const pitchRig = new THREE.Group();
const alignRig = new THREE.Group();
yawRig.add(pitchRig);
pitchRig.add(alignRig);
scene.add(yawRig);

// prevent roll: ensure Euler orders + zero Z each frame (done in animate)
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

// load model, centre, orient, scale
const loader = new GLTFLoader();
loader.load(
  './assets/head.glb',
  (gltf) => {
    const model = gltf.scene;

    // centre about true bounds
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3(), center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    model.position.sub(center);
    model.rotation.set(0, 0, 0);

    // fixed correction: +X → -Z
    alignRig.rotation.y = -Math.PI / 2;

    // optional fit to view
    const camDist = camera.position.z;
    const visibleH = 2 * camDist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const targetH = visibleH * 0.6;
    const scale = size.y > 0 ? targetH / size.y : 1.0;
    // model.scale.setScalar(scale);

    alignRig.add(model);
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
  return { nx: nx * 2 - 1, ny: ny * 2 - 1 }; // [-1,1] each
}

// Desktop hover movement
addEventListener('mousemove', e => {
  if (dragging) return; // drag has priority
  const { nx, ny } = getNormXY(e.clientX, e.clientY);
  mouseX = THREE.MathUtils.clamp(nx, -1, 1);
  mouseY = THREE.MathUtils.clamp(ny, -1, 1);
});

// Pointer drag (mobile + desktop click-drag)
el.addEventListener('pointerdown', e => {
  dragging = true;
  const { nx, ny } = getNormXY(e.clientX, e.clientY);
  startX = nx; startY = ny;
  startYaw = mouseX;
  startPitch = mouseY;
});
el.addEventListener('pointermove', e => {
  if (!dragging) return;
  const { nx, ny } = getNormXY(e.clientX, e.clientY);
  const dx = nx - startX;
  const dy = ny - startY;
  mouseX = THREE.MathUtils.clamp(startYaw + dx, -1, 1);
  mouseY = THREE.MathUtils.clamp(startPitch + dy, -1, 1);
});
el.addEventListener('pointerup',   () => { dragging = false; });
el.addEventListener('pointercancel',() => { dragging = false; });

// resize
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// === AUDIO (robust unlock + fade) ===
let audioCtx, audio, gainNode;
let audioSetup = false;

async function ensureAudioUnlocked() {
  if (!audioSetup) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audio = new Audio('./assets/concrete.m4a');
    audio.loop = true;

    const track = audioCtx.createMediaElementSource(audio);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    track.connect(gainNode).connect(audioCtx.destination);
    audioSetup = true;
  }

  if (audioCtx.state !== 'running') {
    try { await audioCtx.resume(); } catch {}
  }
}

function fadeIn(duration = 0.1) {
  if (!audioSetup) return;
  const now = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(1, now + duration);
}

function fadeOut(duration = 0.1) {
  if (!audioSetup) return;
  const now = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
  setTimeout(() => { if (audio && !audio.paused) audio.pause(); }, duration * 1000 + 50);
}

// events (play only after first gesture)
addEventListener('headMoveStart', async () => {
  await ensureAudioUnlocked();
  if (audio.paused) { try { await audio.play(); } catch {} }
  fadeIn();
});
addEventListener('headMoveStop', () => fadeOut());

// === HEAD MOTION STATE ===
let wasMoving = false;
let lastYaw = 0;
let lastPitch = 0;

function checkHeadMotion() {
  const yaw = yawRig.rotation.y;
  const pitch = pitchRig.rotation.x;

  const deltaYaw = Math.abs(yaw - lastYaw);
  const deltaPitch = Math.abs(pitch - lastPitch);
  lastYaw = yaw;
  lastPitch = pitch;

  const moving = deltaYaw > 0.0005 || deltaPitch > 0.0005;

  if (moving && !wasMoving) {
    dispatchEvent(new Event('headMoveStart'));
  } else if (!moving && wasMoving) {
    dispatchEvent(new Event('headMoveStop'));
  }
  wasMoving = moving;
}

// animate
function animate() {
  const desiredYaw = mouseX * maxYaw;
  const desiredPitch = mouseY * maxPitch; // invert for natural feel (move up = look up)

  // smooth
  yawRig.rotation.y = THREE.MathUtils.lerp(yawRig.rotation.y, desiredYaw, lerpAlpha);
  pitchRig.rotation.x = THREE.MathUtils.lerp(pitchRig.rotation.x, desiredPitch, lerpAlpha);

  // clamp pitch and hard-zero roll
  pitchRig.rotation.x = THREE.MathUtils.clamp(pitchRig.rotation.x, -maxPitch, maxPitch);
  yawRig.rotation.z = 0;
  pitchRig.rotation.z = 0;

  checkHeadMotion();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// one-time gesture listeners to help unlock early (no autoplay attempts here)
['pointerdown','keydown','touchstart'].forEach(type => {
  window.addEventListener(type, ensureAudioUnlocked, { once: true, passive: true });
});

