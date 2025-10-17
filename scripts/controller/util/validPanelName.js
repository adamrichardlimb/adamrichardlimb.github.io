import rawItems from '../../../assets/items.json' with { type: 'json' };

export default function validPanelName(name) {
  return rawItems.map(item => item.text).includes(name);
}
