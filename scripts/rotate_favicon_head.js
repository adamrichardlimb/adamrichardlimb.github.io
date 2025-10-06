// ./assets/favicons/animateFavicon.js

// Number of frames and update speed (1 rotation per second)
const frames = 60;
const interval = 2500 / frames; // ms per frame

// Preload all frames
const icons = Array.from({ length: frames }, (_, i) => {
  const img = new Image();
  const name = `${i + 1}.png`; // 1.png, 2.png, ..., 60.png
  img.src = `../assets/favicons/${name}`;
  console.log(`rotating ${i}`);
  return img.src;
});

// Create or reuse the favicon <link>
let favicon =
  document.querySelector("link[rel~='icon']") ||
  Object.assign(document.createElement('link'), { rel: 'icon' });
document.head.appendChild(favicon);

let index = 0;
function updateFavicon() {
  favicon.href = icons[index];
  index = (index + 1) % frames;
}

// Start animation
setInterval(updateFavicon, interval);

