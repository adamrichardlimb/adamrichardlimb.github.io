import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const container = document.createElement('div');
container.className = 'details-container';

export default function details(list, position = new THREE.Vector3()) {
  // Clear old contents
  container.innerHTML = '';

  // Create buttons for each item
  for (const item of list) {
    const btn = document.createElement('button');
    btn.textContent = item.title;
    btn.onclick = () => {
      console.log(`Clicked: ${item.title}`);
      // Could trigger another render or open detail view
    };
    container.appendChild(btn);
  }

  // Wrap in CSS3DObject so we can place it in 3D
  const obj = new CSS3DObject(container);
  obj.position.copy(position);
  return obj;
}
