const spinBtn = document.getElementById("spinBtn");
const scheduleBtn = document.getElementById("scheduleBtn");
const backBtn = document.getElementById("backBtn");

const reel1 = document.getElementById("reel1");
const reel2 = document.getElementById("reel2");
const reel3 = document.getElementById("reel3");

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

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createReelItems(finalSymbol, count = 14) {
  const items = [];
  for (let i = 0; i < count - 1; i++) {
    items.push(allSymbols[Math.floor(Math.random() * allSymbols.length)]);
  }
  items.push(finalSymbol);
  return items;
}

function buildReel(reel, finalSymbol) {
  const items = createReelItems(finalSymbol);
  reel.innerHTML = items.map(symbol => `<div class="symbol">${symbol}</div>`).join("");
  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
  reel.offsetHeight;
  const offset = (items.length - 1) * 112;
  return offset;
}

function buildReelMobileAware(reel, finalSymbol) {
  const itemHeight = window.innerWidth <= 390 ? 98 : 112;
  const items = createReelItems(finalSymbol);
  reel.innerHTML = items.map(symbol => `<div class="symbol">${symbol}</div>`).join("");
  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
  reel.offsetHeight;
  return {
    offset: (items.length - 1) * itemHeight
  };
}

function spinTo(reel, symbol, duration, delay = 0) {
  const { offset } = buildReelMobileAware(reel, symbol);

  setTimeout(() => {
    reel.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    reel.style.transform = `translateY(-${offset}px)`;
  }, delay);

  return delay + duration;
}

function animateStep(stepSymbols, baseDelay = 0) {
  const t1 = spinTo(reel1, stepSymbols[0], 700, baseDelay);
  const t2 = spinTo(reel2, stepSymbols[1], 950, baseDelay + 120);
  const t3 = spinTo(reel3, stepSymbols[2], 1200, baseDelay + 240);
  return Math.max(t1, t2, t3);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function switchScreen(showSchedule) {
  slotScreen.classList.toggle("active", !showSchedule);
  scheduleScreen.classList.toggle("active", showSchedule);
}

function launchConfetti(duration = 1600) {
  const particles = [];
  const colors = ["#ffffff", "#ffe7ef", "#f7d6df", "#e7f0ff", "#fdf6d8"];

  for (let i = 0; i < 160; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.22,
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
  spinBtn.disabled = true;
  resultBlock.classList.add("hidden");
  document.body.classList.remove("flash-win");

  for (const step of steps) {
    const endTime = animateStep(step);
    await delay(endTime + 220);
  }

  document.body.classList.add("flash-win");
  launchConfetti();
  await delay(250);
  resultBlock.classList.remove("hidden");
  spinBtn.disabled = false;
}

spinBtn.addEventListener("click", startSpin);

scheduleBtn.addEventListener("click", () => {
  switchScreen(true);
});

backBtn.addEventListener("click", () => {
  switchScreen(false);
});
