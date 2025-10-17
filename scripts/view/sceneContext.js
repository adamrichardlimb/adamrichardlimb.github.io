import * as THREE from 'three';
import mobileCheck from '../mobileCheck.js'; 
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

//Scene + Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, mobileCheck() ? 2 : 1);

//3D Renderer
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';

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

addEventListener('resize', () => {
  //Cameras
  camera.aspect = innerWidth / innerHeight;
  camera.position.set(0, 0, mobileCheck() ? 2 : 1);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  //Renderers
  cssRenderer.setSize(innerWidth, innerHeight);
  renderer.setSize(innerWidth, innerHeight);

  //Any items in the scene will be moved in three.js
});

export { camera, renderer, cssRenderer };
export default scene;
