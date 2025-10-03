//Not using this right now - put here before I add it as an easter egg to tidy up main file
let audioCtx, audio, gainNode;
let audioSetup = false;
let easterEggUnlocked = false;
async function ensureAudioUnlocked() { /* unchanged */ }
function fadeIn(duration = 0.1) { /* unchanged */ }
function fadeOut(duration = 0.1) { /* unchanged */ }
addEventListener('headMoveStart', async () => { /* unchanged */ });
addEventListener('headMoveStop', () => fadeOut());

// === HEAD MOTION STATE ===
let wasMoving = false;
let lastYaw = 0;
let lastPitch = 0;
function checkHeadMotion() {
  const yaw = yawRig.rotation.y;
  const pitch = pitchRig.rotation.x;
  const deltaYaw = Math.abs(yaw - lastYaw);
  const deltaPitch = Math.abs(pitch - lastPitch);
  lastYaw = yaw;
  lastPitch = pitch;
  const moving = deltaYaw > 0.0005 || deltaPitch > 0.0005;
  if (moving && !wasMoving) dispatchEvent(new Event('headMoveStart'));
  else if (!moving && wasMoving) dispatchEvent(new Event('headMoveStop'));
  wasMoving = moving;
}



// unlock audio on first gesture
['pointerdown', 'keydown', 'touchstart'].forEach((type) => {
  window.addEventListener(type, ensureAudioUnlocked, { once: true, passive: true });
});
