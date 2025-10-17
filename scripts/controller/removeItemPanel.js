import Panel from '../model/panel.js';
import validPanelName from './util/validPanelName.js';
import scene from '../view/sceneContext.js';

export default function removeItemPanel(panel) {
  if (!panel.name.startsWith('item-panel')) {
    console.warn(`Attempted to remove panel that does not start with item-panel: ${panel.name}`)
    return;
  }

  const panelName = panel.name.slice("item-panel-".length);

  const validName = validPanelName(panelName);
  if (!validName) {
    console.warn(`Attempted to remove panel with invalid name: ${panelName}`);
    return;
  }

  //Animate based on name and if on mobile
  scene.remove(panel);
}
