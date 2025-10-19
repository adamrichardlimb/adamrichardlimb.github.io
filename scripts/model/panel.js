import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// === Style ===
const style = document.createElement('style');
style.textContent = `
.details-container {
  border: 0.25em solid white;
  background: rgba(0, 0, 0, 0.7);
  padding: 1em;
  text-align: right;
  font-optical-sizing: auto;
  font-family: "JetBrains Mono", monospace;
  transition: opacity 0.4s ease;
  font-weight: 500;
  font-style: normal;
  font-variant-numeric: tabular-nums lining-nums;
  font-size: 16px;
  height: 7.5em;
}

a:hover {
  text-decoration: underline;
}

a {
  text-decoration: none;
  border: none;
  outline: none;
  color: white;
  display: block;
  margin: 0.25em 0;
  outline: none;
}
`;
document.head.appendChild(style);

export default class Panel {
  constructor(element, {
    name = '',
    visible = true,
    position = { x: 0, y: 0, z: 0 },
    target = { x: 0, y: 0, z: 0 },
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

    requestAnimationFrame(() => {
      el.style.visibility = 'visible';
      void el.offsetWidth;
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
