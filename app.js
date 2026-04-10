const spinBtn = document.getElementById("spinBtn");
const scheduleBtn = document.getElementById("scheduleBtn");
const backBtn = document.getElementById("backBtn");

const reel1 = document.getElementById("reel1");
const reel2 = document.getElementById("reel2");
const reel3 = document.getElementById("reel3");

const winOverlay = document.getElementById("winOverlay");
const slotScreen = document.getElementById("slotScreen");
const scheduleScreen = document.getElementById("scheduleScreen");

const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");

const steps = [
  ["💍", "💍", "💍"],
  ["❤️", "💍", "❤️"],
  ["🕊", "💍", "🕊"],
  ["❤️", "❤️", "❤️"]
];

const allSymbols = ["💍", "❤️", "🕊", "✨", "🥂"];
let isSpinning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  initReels();
});

function getItemHeight() {
  const frame = document.querySelector(".reel-frame");
  return frame ? frame.clientHeight : 100;
}

function setReelSingle(reel, symbol) {
  const itemHeight = getItemHeight();
  reel.innerHTML = `<div class="symbol" style="height:${itemHeight}px">${symbol}</div>`;
  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
}

function initReels() {
  setReelSingle(reel1, "💍");
  setReelSingle(reel2, "💍");
  setReelSingle(reel3, "💍");
}
initReels();

function vibrate(pattern = [40]) {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      if (Array.isArray(pattern) && pattern.length >= 3) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
      }
      return;
    } catch (e) {}
  }

  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function playTone(frequency, duration, type = "sine", volume = 0.03) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!window.__audioCtx) {
    window.__audioCtx = new AudioContextClass();
  }

  const audioCtx = window.__audioCtx;
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration / 1000
  );

  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playStartSound() {
  playTone(210, 90, "triangle", 0.04);
  setTimeout(() => playTone(250, 110, "triangle", 0.035), 90);
  setTimeout(() => playTone(290, 120, "triangle", 0.03), 180);
}

function playWinSound() {
  playTone(520, 160, "sine", 0.05);
  setTimeout(() => playTone(660, 180, "sine", 0.045), 120);
  setTimeout(() => playTone(880, 220, "sine", 0.04), 240);
}

function createReelItems(finalSymbol, count = 16) {
  const items = [];
  for (let i = 0; i < count - 1; i++) {
    items.push(allSymbols[Math.floor(Math.random() * allSymbols.length)]);
  }
  items.push(finalSymbol);
  return items;
}

function buildReel(reel, finalSymbol) {
  const itemHeight = getItemHeight();
  const items = createReelItems(finalSymbol);

  reel.innerHTML = items
    .map(symbol => `<div class="symbol" style="height:${itemHeight}px">${symbol}</div>`)
    .join("");

  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
  reel.offsetHeight;

  return (items.length - 1) * itemHeight;
}

function spinTo(reel, symbol, duration, delay = 0) {
  const offset = buildReel(reel, symbol);

  setTimeout(() => {
    reel.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    reel.style.transform = `translateY(-${offset}px)`;
  }, delay);

  return delay + duration;
}

function animateStep(stepSymbols, baseDelay = 0) {
  const t1 = spinTo(reel1, stepSymbols[0], 760, baseDelay);
  const t2 = spinTo(reel2, stepSymbols[1], 980, baseDelay + 120);
  const t3 = spinTo(reel3, stepSymbols[2], 1220, baseDelay + 240);
  return Math.max(t1, t2, t3);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function switchScreen(showSchedule) {
  slotScreen.classList.toggle("active", !showSchedule);
  scheduleScreen.classList.toggle("active", showSchedule);
}

function launchConfetti(duration = 1800) {
  const particles = [];
  const colors = ["#ffffff", "#ffdbe8", "#ffe9ef", "#ffd1dc", "#fff0f4", "#fff7d9"];

  for (let i = 0; i < 190; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.24,
      r: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 8 + 2,
      vy: Math.random() * 2 + 1,
      alpha: 1,
      rotate: Math.random() * 0.2
    });
  }

  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed + p.vy;
      p.speed *= 0.985;
      p.alpha *= 0.986;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate * elapsed * 0.02);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.8);
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(frame);
}

async function startSpin() {
  if (isSpinning) return;
  isSpinning = true;

  spinBtn.disabled = true;
  winOverlay.classList.add("hidden");

  vibrate([40, 40, 70]);
  playStartSound();

  for (const step of steps) {
    const endTime = animateStep(step);
    await delay(endTime + 220);
  }

  vibrate([90, 40, 120]);
  playWinSound();
  launchConfetti();

  await delay(260);
  winOverlay.classList.remove("hidden");

  spinBtn.disabled = false;
  isSpinning = false;
}

spinBtn.addEventListener("click", startSpin);

scheduleBtn.addEventListener("click", () => {
  switchScreen(true);
});

backBtn.addEventListener("click", () => {
  switchScreen(false);
});
