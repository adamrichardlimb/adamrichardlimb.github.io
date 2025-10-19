import * as THREE from 'three';
import mobileCheck from '../mobileCheck.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

// === Scene + Camera ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, mobileCheck() ? 2 : 1);

// === 3D Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';

// === CSS3D Renderer ===
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

// === Interaction Plane (for raycasting) ===
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
const interactionPlane = new THREE.Mesh(planeGeometry, planeMaterial);
interactionPlane.position.set(0, 0, -0.5);
camera.add(interactionPlane);
scene.add(camera);

// === Raycaster & Mouse Position ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const _mouseWorldPos = new THREE.Vector3();

// Internal helper to update cached position
function computeMouseWorldPos(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(interactionPlane);
  if (intersects.length > 0) _mouseWorldPos.copy(intersects[0].point);
  return _mouseWorldPos.clone(); // return a snapshot
}

// Exported accessor for current position
export function getMouseWorldPos(event) {
  return computeMouseWorldPos(event);
}

// === Resize Handling ===
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.position.set(0, 0, mobileCheck() ? 2 : 1);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  cssRenderer.setSize(innerWidth, innerHeight);
  renderer.setSize(innerWidth, innerHeight);
});

// === Exports ===
export { camera, renderer, cssRenderer };
export default scene;

