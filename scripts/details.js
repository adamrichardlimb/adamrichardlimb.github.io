import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const container = document.createElement('div');
container.className = 'details-container';

const style = document.createElement('style');
style.textContent = `
  .details-container {
    color: white;
    font-family: 'JetBrains Mono', monospace;
  }
  .details-container button {
    color: white;    
  }
`;
document.head.appendChild(style);

export default function details(list, position = new THREE.Vector3()) {
  container.innerHTML = '';

  for (const item of list) {
    const btn = document.createElement('button');
    btn.textContent = item.title;
    btn.onclick = () => console.log(`Clicked: ${item.title}`);
    container.appendChild(btn);
  }

  // Scale relative to your 3D world (tweak as needed)
  //obj.scale.setScalar(0.0025); // ≈ size of a human head at ~1m distance

  return obj;
}

