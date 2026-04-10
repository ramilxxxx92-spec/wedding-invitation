const spinBtn = document.getElementById("spinBtn");
const leverBtn = document.getElementById("leverBtn");
const scheduleBtn = document.getElementById("scheduleBtn");
const backBtn = document.getElementById("backBtn");

const reel1 = document.getElementById("reel1");
const reel2 = document.getElementById("reel2");
const reel3 = document.getElementById("reel3");

const machine = document.getElementById("machine");
const resultBlock = document.getElementById("resultBlock");
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
window.addEventListener("resize", resizeCanvas);

function getItemHeight() {
  return window.innerWidth <= 390 ? 102 : 118;
}

function vibrate(pattern) {
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

  const ctxAudio = window.__audioCtx;

  if (ctxAudio.state === "suspended") {
    ctxAudio.resume();
  }

  const oscillator = ctxAudio.createOscillator();
  const gainNode = ctxAudio.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(ctxAudio.destination);

  oscillator.start();

  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    ctxAudio.currentTime + duration / 1000
  );

  oscillator.stop(ctxAudio.currentTime + duration / 1000);
}

function playStartSound() {
  playTone(180, 120, "triangle", 0.04);
  setTimeout(() => playTone(220, 120, "triangle", 0.035), 90);
}

function playWinSound() {
  playTone(520, 180, "sine", 0.045);
  setTimeout(() => playTone(660, 220, "sine", 0.04), 130);
  setTimeout(() => playTone(880, 260, "sine", 0.035), 260);
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
  reel.innerHTML = items.map(symbol => `<div class="symbol">${symbol}</div>`).join("");
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
  const t3 = spinTo(reel3, stepSymbols[2], 1240, baseDelay + 240);
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
  const colors = ["#ffffff", "#ffe4ef", "#fff0c8", "#e6f0ff", "#ffd6e3"];

  for (let i = 0; i < 180; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.20,
      r: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 8 + 3,
      vy: Math.random() * 1.5 + 1,
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
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.9);
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

function animateLeverAndMachine() {
  leverBtn.classList.remove("lever-pull");
  machine.classList.remove("machine-shake");
  void leverBtn.offsetWidth;
  void machine.offsetWidth;
  leverBtn.classList.add("lever-pull");
  machine.classList.add("machine-shake");

  setTimeout(() => {
    machine.classList.remove("machine-shake");
  }, 500);
}

async function startSpin() {
  if (isSpinning) return;
  isSpinning = true;

  spinBtn.disabled = true;
  leverBtn.disabled = true;
  resultBlock.classList.add("hidden");
  document.body.classList.remove("flash-win");

  animateLeverAndMachine();
  vibrate([40, 40, 70]);
  playStartSound();

  for (const step of steps) {
    const endTime = animateStep(step);
    await delay(endTime + 220);
  }

  vibrate([90, 40, 120]);
  playWinSound();
  document.body.classList.add("flash-win");
  launchConfetti();

  await delay(280);
  resultBlock.classList.remove("hidden");

  spinBtn.disabled = false;
  leverBtn.disabled = false;
  isSpinning = false;
}

spinBtn.addEventListener("click", startSpin);
leverBtn.addEventListener("click", startSpin);

scheduleBtn.addEventListener("click", () => {
  switchScreen(true);
});

backBtn.addEventListener("click", () => {
  switchScreen(false);
});
