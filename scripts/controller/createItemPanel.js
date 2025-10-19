import rawItems from '../../assets/items.json' with { type: 'json' };
import Panel from '../model/panel.js';
import scene from '../view/sceneContext.js';
import validPanelName from './util/validPanelName.js';
import removeItemPanel from './removeItemPanel.js';
import moveHead from './moveHead.js';

export default async function createItemPanel(name) {
  const validPanel = validPanelName(name);
  if (!validPanel) return;

  // Remove any existing item panels
  const existing = scene.children.filter(obj => obj.name.startsWith('item-panel'));
  console.log(scene.children)
  existing.forEach(obj => removeItemPanel(obj));
  console.log(existing)

  // If a panel with this name already exists, return
  const alreadyExists = existing.some(obj => obj.name === `item-panel-${name}`);
  
  if (alreadyExists) return;

  //Create the new panel
  let newPanel = null;
  try {
    const module = await import(`../model/ring/items/${name.toLowerCase()}.js`);
    const exported = module.default;

    if (exported instanceof Panel) {
      newPanel = exported;
    } else {
      console.warn(`${name}.js does not export a Panel instance.`);
    }
  } catch (err) {
    console.error(`Failed to load script for ${name}:`, err);
  }

  //If we get one - show it
  if (newPanel) {
      newPanel.object.name = `item-panel-${name}`;
      
      //Move head to appropriate position
      moveHead(name);

      scene.add(newPanel.object);
      newPanel.fadeIn();
  }
}
