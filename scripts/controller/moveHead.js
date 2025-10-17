import { headTarget } from '../view/three.js';
import mobileCheck from '../mobileCheck.js';

export default function moveHead(panelName) {
  let new_target = {x: 0, y: 0, z: 0};

  console.log(`Moving for ${panelName}`)

  if (panelName == "ARTICLES") {
    new_target = mobileCheck() ? {x: 0, y: -0.5, z:0 } : { x: -1, y: 0, z: 0 };
  } else if (panelName == "PROJECTS") {
    new_target = mobileCheck() ? {x: 0, y: 0.5, z:0 } : { x: 1, y: 0, z: 0 };
  }

  headTarget.set(new_target.x, new_target.y, new_target.z);
}
