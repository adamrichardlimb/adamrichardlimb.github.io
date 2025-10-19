import Panel from '../../panel.js';
import mobileCheck from '../../../mobileCheck.js';
import items from '../../../../assets/items.json' with { type: 'json' };

const container = document.createElement('div');
container.className = 'details-container';

// Find the “PROJECTS” group in items.json
const projectsGroup = items.find(i => i.text === 'PROJECTS');
if (!projectsGroup) throw new Error('No PROJECTS group found in items.json');

const projectList = document.createElement('div');
const projectInfo = document.createElement('div');
projectInfo.style.marginTop = '0.75em';

// Add links for each project
projectsGroup.items.forEach(({ title, link, description }) => {
  const a = document.createElement('a');
  a.href = link || '#';
  a.textContent = title;
  a.onclick = (e) => {
    e.preventDefault();
    projectInfo.innerHTML = `
      <div style="margin-top:0.5em;text-align:left">
        <strong>${title}</strong><br>
        <span style="font-size:0.9em;color:#ccc">${description}</span>
      </div>
    `;
  };
  projectList.appendChild(a);
});

container.appendChild(projectList);
container.appendChild(projectInfo);

const projects = new Panel(container, {
  name: 'details-container',
  visible: true,
  position: mobileCheck() ? { x: 0, y: -0.5, z: 0 } : { x: -0.75, y: 0, z: 0 },
  scale: 0.005
});

export default projects;

