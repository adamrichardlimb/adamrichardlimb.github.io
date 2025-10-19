import * as THREE from 'three';
import mobileCheck from '../mobileCheck.js';
import { getMouseWorldPos } from '../view/sceneContext.js';

export default class HeadController {
  constructor(myHead, camera, renderer, items) {
    this.myHead = myHead;
    this.camera = camera;
    this.renderer = renderer;
    this.items = items;

    this.lerpAlpha = 0.15;
    this.headTarget = new THREE.Vector3(0, 0, 0);
    this.headCurrent = new THREE.Vector3(0, 0, 0);

    this.targetYaw = 0;
    this.targetPitch = 0;

    this.isTouchDragging = false;

    this._initPointerEvents();
  }

  _initPointerEvents() {
    const handleMove = (clientX, clientY) => {
      const e = { clientX, clientY };
      const clickWorld = getMouseWorldPos(e);
      clickWorld.z = mobileCheck() ? 1.5 : 1;

      const headWorld = new THREE.Vector3();
      this.myHead.getWorldPosition(headWorld);

      const dir = clickWorld.clone().sub(headWorld).normalize();
      this.targetYaw = Math.atan2(dir.x, dir.z);
      this.targetPitch = -Math.asin(dir.y);
    };

    // Desktop
    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

    // Mobile
    window.addEventListener('touchstart', (e) => {
      this.isTouchDragging = true;
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isTouchDragging) return;
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    });

    window.addEventListener('touchend', () => {
      this.isTouchDragging = false;
    });
  }

  update(dt) {
    this.myHead.rotation.y = THREE.MathUtils.lerp(
      this.myHead.rotation.y,
      this.targetYaw,
      this.lerpAlpha
    );

    this.myHead.rotation.x = THREE.MathUtils.lerp(
      this.myHead.rotation.x,
      this.targetPitch,
      this.lerpAlpha
    );

    this.headCurrent.lerp(this.headTarget, 0.05);
    this.myHead.position.copy(this.headCurrent);
  }
}

