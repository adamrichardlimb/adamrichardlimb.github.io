import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import rawItems from '../assets/items.json' with { type: 'json' };

// Load JetBrains Mono
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap';
document.head.appendChild(fontLink);

// Global CSS stays
const words = rawItems.map(item => item.text);
const textString = words.join(' ') + ' ';
const textLength = textString.length;
const fontSize = 1.0;
const charWidth = 1.0;
const canTrig = CSS.supports('(top: calc(sin(1) * 1px))');

// Style — keep this
const style = `
  .ring {
    --char-count: ${textLength};
    --inner-angle: calc((360 / var(--char-count, ${textLength})) * 1deg);
    --character-width: ${charWidth};
    --radius: calc(
      (var(--character-width, ${charWidth}) /
      ${canTrig ? 'sin(var(--inner-angle))' : Math.sin(360 / textLength / (180 / Math.PI))})
      * -1ch
    );
    --font-size: ${fontSize}rem;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    font-size: calc(var(--font-size, 1) * 1rem);
    position: relative;
    color: white;
    animation: rotation 30s infinite linear;
  }
  .char {
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--angle-offset) + var(--inner-angle) * var(--char-index)))
      translateY(var(--radius));
  }
  @keyframes rotation { to { rotate: 360deg; } }
`;
const styleTag = document.createElement('style');
styleTag.textContent = style;
document.head.appendChild(styleTag);

// Convert this part to a function:
export function createItems(onClick) {
  const items = [];
  let angleOffset = 0;

  for (const word of words) {
    const textWithSpace = word + ' ';
    const wordLength = textWithSpace.length;

    const container = document.createElement('h1');
    container.className = 'ring';
    container.style.setProperty('--char-count', textLength);
    container.style.setProperty('--font-size', fontSize);
    container.style.setProperty('--character-width', charWidth);

    for (let i = 0; i < wordLength; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--char-index', i);
      span.style.setProperty('--angle-offset', `${angleOffset}deg`);
      span.textContent = textWithSpace[i];
      container.appendChild(span);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'ring-wrapper';
    wrapper.appendChild(container);

    const labelObject = new CSS3DObject(wrapper);
    labelObject.element.onclick = () => onClick(word, labelObject);

    items.push(labelObject);
    angleOffset += (360 / textLength) * wordLength;
  }

  return items;
}

