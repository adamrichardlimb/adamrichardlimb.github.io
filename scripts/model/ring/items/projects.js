import Panel from '../../panel.js';
import mobileCheck from '../../../mobileCheck.js';
import items from '../../../../assets/items.json' with { type: 'json' };

const container = document.createElement('div');
container.className = 'panel';

// Find the “PROJECTS” group in items.json
const projectsGroup = items.find(i => i.text === 'PROJECTS');
if (!projectsGroup) throw new Error('No PROJECTS group found in items.json');

const projectList = document.createElement('div');
projectList.className = 'panel-item scrollbox';

const projectInfo = document.createElement('div');
projectInfo.className = 'panel-item scrollbox project-info';
projectInfo.style.textAlign = 'left';
projectInfo.innerHTML = `
      <h4>Click a project to get information on it!</h4>
      <p>Or, if you're enjoying this project, you can view the code here.<br><a href="https://github.com/adamrichardlimb/adamrichardlimb.github.io" target="_blank" style="color:#0af;text-decoration:none;">Visit project →</a></p>
    `;

projectsGroup.items.forEach(({ title, link, description }) => {
  const a = document.createElement('a');
  a.href = link || '#';
  a.textContent = title;
  a.onclick = (e) => {
    e.preventDefault();

    // Show and update info panel
    projectInfo.style.display = 'block';
    projectInfo.innerHTML = `
      <h4>${title}</h4>
      <p>${description} ${link ? `<br><a href="${link}" target="_blank" style="color:#0af;text-decoration:none;">Visit project →</a>` : ''}</p>
    `;

    // Optionally scroll to top
    projectInfo.scrollTop = 0;
  };

  projectList.appendChild(a);
});

container.appendChild(projectInfo);
container.appendChild(projectList);

const projects = new Panel(container, {
  name: 'projects',
  visible: true,
  position: mobileCheck() ? { x: 0, y: -0.75, z: 0 } : { x: -0.75, y: 0, z: 0 },
  scale: 0.005
});

export default projects;
