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
}
