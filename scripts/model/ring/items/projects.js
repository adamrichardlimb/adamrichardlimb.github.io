import Panel from '../../panel.js';
import findMarkdown from '../../util/findMarkdown.js';

const container = document.createElement('div');
container.className = 'details-container';

const articles = new Panel(container, {
  name: 'details-container',
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  scale: 0.005
});

export default articles;

