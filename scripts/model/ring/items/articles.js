import Panel from '../../panel.js';
import findMarkdown from '../../util/findMarkdown.js';

const res = await fetch('../articles/articles.json');
const files = await res.json();
const article_list = await findMarkdown("articles");

const container = document.createElement('div');
container.className = 'details-container';

for (const { title, href } of article_list) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = title;
  a.style.display = 'block';
  container.appendChild(a);
}

const articles = new Panel(container, {
  name: 'details-container',
  visible: true,
  position: { x: 0, y: 0, z: 0 },
  scale: 0.005
});

export default articles;
