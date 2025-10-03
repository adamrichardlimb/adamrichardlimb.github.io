import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import rawItems from '../assets/items.json' with { type: 'json' };

// Build the text string: PROJECTS · ARTICLES · X · LinkedIn ·
const textString = rawItems.map(item => item.text).join(' · ') + ' · ';

// Container <h1> that will hold the circular text
const container = document.createElement('h1');

const div = document.createElement('div');
div.className = 'label';
div.innerHTML = `<p>${textString}</p>`;

// Wrap in CSS2DObject so it can be positioned in the scene
const labelObject = new CSS2DObject(div);

export default labelObject;

