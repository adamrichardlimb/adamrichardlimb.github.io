import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

export default class Panel {
  constructor(element, {
    name = '',
    visible = true,
    position = { x: 0, y: 0, z: 0 },
    target = {x: 0, y: 0, z: 0},
    scale = 1,
    metadata = {}
  } = {}) {
    this.name = name;
    this.element = element;
    this.element.style.transition = `opacity 1000ms ease`;
    this.object = new CSS3DObject(element);
    this.object.position.set(position.x, position.y, position.z);
    this.object.scale.setScalar(scale);
    this.visible = visible;
    this.metadata = metadata;
    this.object.visible = visible;
  }

  show() {
    this.visible = true;
    this.object.visible = true;
  }

  hide() {
    this.visible = false;
    this.object.visible = false;
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  setPosition(x, y, z) {
    this.object.position.set(x, y, z);
  }

  fadeIn(duration = 1000) {
    const el = this.object.element;
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = 0;
    el.style.visibility = 'hidden';
    this.show();

    // Wait for next paint
    requestAnimationFrame(() => {
      el.style.visibility = 'visible';
      void el.offsetWidth; // force reflow
      el.style.opacity = 1;
    });
  }

  fadeOut(duration = 1000) {
    const el = this.object.element;
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = 1;

    void el.offsetWidth;
    el.style.opacity = 0;

    setTimeout(() => {
      el.style.visibility = 'hidden';
      this.hide();
    }, duration);
}


}
