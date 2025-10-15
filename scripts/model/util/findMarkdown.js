import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

export default async function findMarkdown(loc) {
  const res = await fetch(`../../../${loc}/${loc}.json`);
  const files = await res.json();
  const addresses = [];

  for (const file of files) {
    const slug = file.replace('.md', '');
    const text = await fetch(`/${loc}/${file}`).then(r => r.text());
    const match = text.match(/---\s*title:\s*(.+?)\s*\n/);
    const title = match ? match[1].trim().toUpperCase() : slug;
    addresses.push({ title, href: `/${loc}/${slug}.html` });
  }

  return addresses;
}
