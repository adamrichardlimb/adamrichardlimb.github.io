import rawItems from '../../assets/items.json' with { type: 'json' };
import Panel from '../model/panel.js';

export default async function createItemPanel(name) {
  const words = rawItems.map(item => item.text);

  if (!words.includes(name)) {
    console.warn(`Requested panel "${name}" does not exist.`);
    return null;
  }

  /*
  //If the new panel is the same as the old one - shut the panel
  if (name == getActivePanel()) {
    closePanel(name);
  }
  */

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
  /*if (newPanel) {
    changePanel(newPanel);
  }
  */
  return newPanel;
}
